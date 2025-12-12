from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import torch
from ultralytics import YOLO
from PIL import Image, UnidentifiedImageError
import io
import numpy as np

app = Flask(__name__)
CORS(app)

# Load the YOLOv8 model
MODEL_PATH = 'yolov8_trained_model.pt'
model = None

def load_model():
    global model
    if model is None:
        try:
            model = YOLO(MODEL_PATH)
            print("Model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise

def preprocess_image(image_file):
    """Convert uploaded image file to format suitable for YOLO model"""
    try:
        # Read image file
        image_bytes = image_file.read()
        image = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')

        return image
    except UnidentifiedImageError:
        # Common case: non-image file or corrupted upload
        raise ValueError('Invalid image file')
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        raise

def predict(image):
    """Run prediction on the image using YOLO model"""
    try:
        # Run prediction
        results = model(image)

        # Process results
        predictions = []
        for result in results:
            boxes = result.boxes  # Boxes object for bbox outputs
            for box in boxes:
                # Get coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                # Get confidence
                confidence = box.conf[0].item()

                # Get class
                cls = int(box.cls[0].item())

                predictions.append({
                    'class': cls,
                    'confidence': confidence,
                    'bbox': [x1, y1, x2, y2]
                })

        return predictions
    except Exception as e:
        print(f"Error during prediction: {e}")
        raise

@app.route('/')
def home():
    return "YOLOv8 Detection API - Send POST request to /predict with image file"

@app.route('/predict', methods=['POST'])
def predict_endpoint():
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']

        # Check if file is empty
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        # Load model if not already loaded
        if model is None:
            load_model()

        # Preprocess image
        image = preprocess_image(file)

        # Run prediction
        predictions = predict(image)

        return jsonify({
            'success': True,
            'predictions': predictions,
            'message': 'Prediction completed successfully'
        })

    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Bad request'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Prediction failed'
        }), 500

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    # Load model when starting the server
    try:
        load_model()
        print("Starting YOLOv8 Detection API...")
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        print(f"Failed to start API: {e}")
