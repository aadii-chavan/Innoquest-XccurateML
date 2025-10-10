import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import nibabel as nib
import cv2
import base64
from io import BytesIO
from PIL import Image

def dice_coef(y_true, y_pred):
    return 0.0

def precision(y_true, y_pred):
    return 0.0

def recall(y_true, y_pred):
    return 0.0

# --- Load both models at startup ---
CLASSIFICATION_MODEL_PATH = "best_model_augmented.keras"
SEGMENTATION_MODEL_PATH = "model_per_class.h5"

classification_model = load_model(CLASSIFICATION_MODEL_PATH)
try:
    segmentation_model = load_model(
        SEGMENTATION_MODEL_PATH,
        custom_objects={"dice_coef": dice_coef, "precision": precision, "recall": recall}
    )
    segmentation_model_loaded = True
except Exception as e:
    print(f"[ERROR] Could not load segmentation model: {e}")
    segmentation_model = None
    segmentation_model_loaded = False

print(f"[INFO] Classification model loaded (from '{CLASSIFICATION_MODEL_PATH}') ✅")
print(f"[INFO] Segmentation model loaded (from '{SEGMENTATION_MODEL_PATH}'): {segmentation_model_loaded}")

input_shape = classification_model.input_shape[1:3]
CLASS_NAMES = ['glioma', 'meningioma', 'notumor', 'pituitary']
SEGMENT_CLASSES = ['NOT tumor', 'NECROTIC/CORE', 'EDEMA', 'ENHANCING']

app = Flask(__name__)
CORS(app, origins=["http://localhost:8080", "http://localhost:5173"])

@app.route("/status", methods=["GET"])
def status():
    status_obj = {
        "status": "ok" if classification_model is not None else "error",
        "classification_model_loaded": classification_model is not None,
        "segmentation_model_loaded": segmentation_model_loaded,
        "input_shape": input_shape,
    }
    return jsonify(status_obj), 200

def preprocess_nifti(flair_path, t1ce_path):
    flair_img = nib.load(flair_path).get_fdata()
    t1ce_img = nib.load(t1ce_path).get_fdata()
    batch = []
    orig_slices = []
    for idx in range(22, 122):  # 100 slices
        flair_slice = flair_img[:, :, idx]
        t1ce_slice = t1ce_img[:, :, idx]
        flair_resized = cv2.resize(flair_slice, (128, 128), interpolation=cv2.INTER_LINEAR)
        t1ce_resized = cv2.resize(t1ce_slice, (128, 128), interpolation=cv2.INTER_LINEAR)
        stacked = np.stack([flair_resized, t1ce_resized], axis=-1)  # (128,128,2)
        batch.append(stacked)
        orig_slices.append(flair_resized)
    batch = np.array(batch)  # (100,128,128,2)
    batch = batch / np.max(batch)  # normalize
    return batch, orig_slices

def array_to_base64_png(arr):
    # arr: (128,128), assume float32 0-1 or uint8 0-255
    arr = np.asarray(arr)
    if arr.dtype != np.uint8:
        arr = (255 * (arr - arr.min()) / (arr.max() - arr.min() + 1e-6)).astype(np.uint8)
    img = Image.fromarray(arr)
    if img.mode != 'L':
        img = img.convert('L')
    buf = BytesIO()
    img.save(buf, format='PNG')
    return base64.b64encode(buf.getvalue()).decode('utf-8')

def mask_to_base64_png(mask):
    # mask: (128,128) int where 0/1/2/3. Colorize for frontend overlay
    rgba = np.zeros((128,128,4), dtype=np.uint8)
    # Red for 1, Yellow for 2, Green for 3; transparent for 0
    rgba[mask == 1] = [255, 0, 0, 128]          # NECROTIC/CORE
    rgba[mask == 2] = [255, 255, 0, 128]        # EDEMA
    rgba[mask == 3] = [0, 255, 0, 128]          # ENHANCING
    rgba[mask == 0] = [0, 0, 0, 0]              # NOT tumor
    img = Image.fromarray(rgba, mode="RGBA")
    buf = BytesIO()
    img.save(buf, format='PNG')
    return base64.b64encode(buf.getvalue()).decode('utf-8')

@app.route("/classify", methods=["POST"])
def classify():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join("/tmp", filename)
        file.save(filepath)
        try:
            img = image.load_img(filepath, target_size=input_shape)
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0) / 255.0
            preds = classification_model.predict(img_array)
            predicted_class = CLASS_NAMES[np.argmax(preds)]
            confidence = float(np.max(preds))
            all_probs = {cls: float(prob) for cls, prob in zip(CLASS_NAMES, preds[0])}
            os.remove(filepath)
            return jsonify({
                "predicted_class": predicted_class,
                "confidence": confidence,
                "all_class_probabilities": all_probs
            })
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Unknown error"}), 500

@app.route("/segment", methods=["POST"])
def segment():
    if not segmentation_model_loaded:
        return jsonify({"error": "Segmentation model not loaded"}), 503
    flair_file = request.files.get('flair_file')
    t1ce_file = request.files.get('t1ce_file')
    if not flair_file or not t1ce_file:
        return jsonify({"error": "Both flair_file and t1ce_file are required"}), 400
    # Save temp files
    flair_path = os.path.join("/tmp", secure_filename(flair_file.filename))
    t1ce_path = os.path.join("/tmp", secure_filename(t1ce_file.filename))
    flair_file.save(flair_path)
    t1ce_file.save(t1ce_path)
    try:
        batch, orig_slices = preprocess_nifti(flair_path, t1ce_path)
        preds = segmentation_model.predict(batch)
        # preds: (100,128,128,4)
        chosen_slices = [40, 45, 50, 55, 60]
        result = []
        for idx in chosen_slices:
            flair_slice = orig_slices[idx]
            prob_mask = preds[idx]     # (128,128,4)
            mask = np.argmax(prob_mask, axis=-1)  # (128,128)
            flair_png = array_to_base64_png(flair_slice)
            mask_png = mask_to_base64_png(mask)
            result.append({
                "slice_index": idx+22,
                "original_image": flair_png,
                "mask_image": mask_png
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            os.remove(flair_path)
            os.remove(t1ce_path)
        except: pass

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
