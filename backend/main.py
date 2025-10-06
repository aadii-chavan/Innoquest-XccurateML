import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS

# --- Load the trained model ---
MODEL_PATH = "best_model_augmented.keras"
model = load_model(MODEL_PATH)
print(f"[INFO] Model loaded successfully from '{MODEL_PATH}' ✅")

# --- Automatically detect input size ---
input_shape = model.input_shape[1:3]  # (height, width)
print(f"[INFO] Model expects input shape: {input_shape}")

# --- Class labels (adjust if needed) ---
CLASS_NAMES = ['glioma', 'meningioma', 'notumor', 'pituitary']

# --- Prediction function ---
def predict_tumor(img_path):
    # Load and preprocess the image properly
    img = image.load_img(img_path, target_size=input_shape)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0  # normalize

    # Predict
    preds = model.predict(img_array)
    predicted_class = CLASS_NAMES[np.argmax(preds)]
    confidence = np.max(preds)

    # Display results
    print("\n--- Prediction Result ---")
    print(f"Predicted Class : {predicted_class}")
    print(f"Confidence Score: {confidence:.4f}")
    print(f"All Class Probabilities: {dict(zip(CLASS_NAMES, preds[0]))}")

app = Flask(__name__)
CORS(app, origins=["http://localhost:8080"])

@app.route("/status", methods=["GET"])
def status():
    try:
        # Try a dummy prediction to check model health
        dummy = np.zeros((1, *input_shape, 3))
        _ = model.predict(dummy)
        return jsonify({"status": "ok", "model_loaded": True, "input_shape": input_shape}), 200
    except Exception as e:
        return jsonify({"status": "error", "model_loaded": False, "error": str(e)}), 500

@app.route("/predict", methods=["POST"])
def predict():
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
            # Use the same logic as predict_tumor
            img = image.load_img(filepath, target_size=input_shape)
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0) / 255.0
            preds = model.predict(img_array)
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
