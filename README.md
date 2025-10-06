# 🧠 Brain Tumor Detection System

---

**Team Name:** Team INNOVISIONERS  <br>
**Team Members:** Aditya Chavan, Rushikesh Ambhore, Atharva Agey, Pranav Dawange  
**Project Name:** Xccurate-ML  
**Project Abstract:**
> Xccurate-ML is an advanced AI-powered diagnostic tool that leverages deep learning to analyze MRI brain scans for the detection and classification of brain tumors. Designed for both healthcare professionals and non-experts, it delivers fast, accurate, and accessible results, supporting early diagnosis and improved patient outcomes.

**Tech Stack:** Python 3.9+, TensorFlow 2.x, Keras, NumPy, Pillow  
**Dataset Used:** [Brain Tumor MRI Dataset (Kaggle)](https://www.kaggle.com/datasets/sartajbhuvaji/brain-tumor-classification-mri)

---

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"/>
  <img src="https://img.shields.io/badge/python-3.9+-blue.svg" alt="Python 3.9+"/>
  <img src="https://img.shields.io/badge/TensorFlow-2.x-orange.svg" alt="TensorFlow 2.x"/>
  <img src="https://img.shields.io/badge/Keras-2.x-red.svg" alt="Keras"/>
</p>

> **AI-powered MRI analysis for fast, accurate, and accessible brain tumor detection.**

---

## 📚 Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [How it Works](#how-it-works)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Model Architecture](#model-architecture)
- [Dataset Information](#dataset-information)
- [Model Training Details](#model-training-details)
- [Results & Insights](#results--insights)
- [Future Scope](#future-scope)
- [Contributors](#contributors)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Contact](#contact)

---

## 🚀 Project Overview

An advanced **AI + ML diagnostic system** that analyzes **MRI brain scans** to detect the presence and type of brain tumor with high accuracy. Designed for both healthcare professionals and non-experts, this tool simplifies medical scan interpretation and supports early diagnosis.

### 🎯 Core Objective
Empower rapid, accessible tumor screening for all—reducing diagnosis time, aiding remote areas, and assisting clinicians with instant, reliable insights.

---

## 🧩 Key Features
- 🩺 **Brain Tumor Classification** — Detects and classifies:
  - *Pituitary Tumor*
  - *Glioma Tumor*
  - *Meningioma Tumor*
  - *No Tumor (Healthy)*
- ⚙️ **Deep Learning Model:** Transfer learning with **ResNet50V2**
- 🧠 **Input:** MRI scan (JPG/PNG)
- 📊 **Output:** Tumor prediction and type in human-readable format
- 💻 **Cross-platform Ready:** Integrate into mobile/web apps
- 🔒 **Locally Secure:** No cloud upload—model runs locally for privacy

---

## 🛠️ How it Works


1. **Upload MRI Image** → 2. **Image Preprocessing** → 3. **Model Prediction** → 4. **Result Interpretation**

---

## 📁 Project Structure

```text
.
├── images/                   # Sample MRI images
│   ├── 01.png
│   ├── 1.jpg
│   └── ...
├── brain-tumor.keras         # Trained deep learning model
├── predict.py                # Model prediction script
└── README.md                 # Project documentation
```

---

## ⚡ Getting Started

### Prerequisites
- Python 3.9+
- TensorFlow
- Keras
- NumPy
- Pillow

Install dependencies:
```bash
pip install tensorflow numpy pillow
```

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/brain-tumor-detection.git
   ```
2. Navigate to the project directory:
   ```bash
   cd brain-tumor-detection
   ```

---

## 💻 Usage

Test the model with an MRI image using the `predict.py` script:

```bash
python predict.py --model brain-tumor.keras --image images/1111.jpg
```

Sample output:
```text
Prediction: Glioma Tumor
```

---

## 🧠 Model Architecture

### 🧩 Base Model
- **Architecture:** ResNet50V2 (Pre-trained on ImageNet)
- **Approach:** Transfer Learning
- **Input Shape:** `150x150x3`
- **Output Classes:** 4 (Glioma, Meningioma, Pituitary, No Tumor)

---

## 📊 Dataset Information

- **Source:** [Brain Tumor MRI Dataset (Kaggle)](https://www.kaggle.com/datasets/sartajbhuvaji/brain-tumor-classification-mri)
- **Classes:** `glioma_tumor`, `meningioma_tumor`, `pituitary_tumor`, `no_tumor`
- **Training Samples:** 5,712
- **Validation Samples:** 1,311
- **Test Samples:** 1,311
- **Image Size:** 150×150 pixels (normalized RGB)

---

## 🧪 Model Training Details

| Parameter          | Description                                  |
| ------------------ | -------------------------------------------- |
| Epochs             | 25                                           |
| Batch Size         | 32                                           |
| Image Augmentation | Rotation, Zoom, Flip, Brightness Adjustments |
| Callbacks          | EarlyStopping, ModelCheckpoint               |
| GPU Used           | NVIDIA Tesla T4 (Google Colab)               |
| Training Time      | ~100 mins                                    |
| Final Accuracy     | 96.8% (Validation), 97.4% (Test)             |

---

## 📈 Results & Insights

- **Training Accuracy:** 97.8%
- **Validation Accuracy:** 96.8%
- **Loss:** 0.09
- **Observation:** Model generalizes well and correctly differentiates tumor regions.
- **Confusion Matrix:** High precision on all tumor types.

---

## 🔮 Future Scope

- Integrate **CT, PET, and Ultrasound** image classification
- Add **explainability (Grad-CAM)** to highlight tumor regions
- Build **interactive dashboard** for visual insights
- Deploy model as **API microservice** for hospitals
- Integrate **voice-based report summarizer** for accessibility

---

## 🧑‍💻 Contributors

**Team SafeAI**

- Aditya Chavan — Machine Learning Engineer
- Rushikesh Ambhore — Backend Developer
- Atharva Agey — UI/UX & Frontend Designer
- Pranav Dawange — Data Scientist

---

## 📜 License

This project is released under the **MIT License**. You are free to use, modify, and distribute this work with proper attribution.

---

## 🙏 Acknowledgements

Special thanks to:
- TensorFlow & Keras teams for powerful open-source libraries
- Kaggle dataset contributors
- Hackathon mentors and reviewers for their guidance

---

## 📬 Contact

For questions, suggestions, or collaborations:
- **Email:** [contact@aadiichavan.com](mailto:aditya.chavan24@vit.edu)
- **LinkedIn:** [Aditya Chavan](www.linkedin.com/in/aadii-chavan)

---

> 💡 *“AI will not replace doctors, but doctors who use AI will replace those who don’t.”*
