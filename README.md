# YOLOv8 Detection with Flask REST API

This project provides a Flask-based REST API for YOLOv8 object detection using a trained PyTorch model.

## Features

- REST API endpoint for image-based object detection
- Flask web server with CORS support
- YOLOv8 model integration using Ultralytics
- JSON response format with bounding boxes, confidence scores, and class predictions
- Health check endpoint

## Project Structure

```
.
├── yolov8_trained_model.pt      # Trained YOLOv8 model (not in Git)
├── app.py                      # Flask REST API
├── requirements.txt            # Python dependencies
├── test_api.py                 # API test script
├── yolov8.ipynb                # Original Jupyter notebook
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## Setup Instructions

### Prerequisites

- Python 3.7+
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/oussamaaxkos/YOLOv8-Detection-with-FiftyOne-Validation.git
   cd YOLOv8-Detection-with-FiftyOne-Validation
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Download or place your trained YOLOv8 model as `yolov8_trained_model.pt` in the project root.

### Running the API

Start the Flask server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### GET `/`
Home endpoint - returns basic API information

### POST `/predict`
Object detection endpoint

**Request:**
- Form-data with `file` field containing the image

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "class": 0,
      "confidence": 0.95,
      "bbox": [x1, y1, x2, y2]
    }
  ],
  "message": "Prediction completed successfully"
}
```

### GET `/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

## Usage Examples

### Using cURL

```bash
curl -X POST -F "file=@test_image.jpg" http://localhost:5000/predict
```

### Using Python

```python
import requests

url = 'http://localhost:5000/predict'
files = {'file': open('test_image.jpg', 'rb')}
response = requests.post(url, files=files)
print(response.json())
```

## Model Information

- The API uses a YOLOv8 model trained for object detection
- Input: Images in JPEG, PNG, or other common formats
- Output: Bounding boxes with coordinates, confidence scores, and class IDs

## Error Handling

The API handles various error scenarios:
- Missing file in request
- Invalid image format
- Model loading failures
- Prediction errors

## Deployment

For production deployment:
1. Use a production WSGI server like Gunicorn
2. Set up proper authentication if needed
3. Configure CORS settings appropriately
4. Consider using a reverse proxy like Nginx

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For issues or questions, please open a GitHub issue.