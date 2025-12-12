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

## Run with Docker (recommended)

This repo includes a [`Dockerfile`](Dockerfile:1) and [`docker-compose.yml`](docker-compose.yml:1).

### Prerequisites

- Docker Desktop installed and running
- A trained model file available on your host at `./yolov8_trained_model.pt` (it is usually not committed because it can be large)

### Option A: Docker Compose

From the project root:

```bash
docker compose up --build
```

This will:

- build the image
- publish the API on `http://localhost:5000`
- mount `./yolov8_trained_model.pt` into the container at `/app/yolov8_trained_model.pt`

### Option B: Docker build + run

```bash
docker build -t yolov8-api .
docker run --rm -p 5000:5000 \
  -v "%cd%\yolov8_trained_model.pt:/app/yolov8_trained_model.pt:ro" \
  yolov8-api
```

If the container fails at startup with a model loading error, confirm the model file exists on the host and is named exactly `yolov8_trained_model.pt`.

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

---

## Web UI (Node.js + React)

This repo now includes a simple, professional web interface that lets you:

- upload an image
- run detection
- see a preview with bounding boxes
- review predictions in a table

### Architecture

- React (Vite) UI
- Node.js (Express) server that:
  - proxies requests to the Flask API (`/api/predict` → `http://localhost:5000/predict`)
  - can serve the built React app in production

### Run (development)

1) Start the YOLO API (Flask / Docker):

```bash
docker compose up --build
```

2) Start the Node server (API gateway):

```bash
cd web/server
npm install
npm run dev
```

3) Start the React UI:

```bash
cd web/client
npm install
npm run dev
```

Open the UI at `http://localhost:5173`.

> Note (Windows): if you don't have Node.js installed locally, use the Docker option below.

### Run (production-like)

Build the React app, then serve it from the Node server:

```bash
cd web/client
npm install
npm run build

cd ../server
npm install
npm start
```

Open `http://localhost:3001`.

### Run with Docker Compose (no local Node.js needed)

The default [`docker-compose.yml`](docker-compose.yml:1) now includes a `yolov8-ui` service.

```bash
docker compose up --build
```

Open `http://localhost:3001`.

### Configuration

The Node server reads environment variables (see [`web/server/.env.example`](web/server/.env.example:1)):

- `PORT` (default: `3001`)
- `YOLO_API_URL` (default: `http://localhost:5000`)
