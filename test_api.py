import requests
import os

def test_api():
    try:
        # Test health endpoint
        response = requests.get('http://localhost:5000/health')
        print(f"Health check: {response.status_code} - {response.json()}")

        # Test prediction with a sample image (you would need to provide an actual image)
        # This is just a template - you'll need to provide a real image file
        try:
            with open('test_image.jpg', 'rb') as f:
                files = {'file': f}
                response = requests.post('http://localhost:5000/predict', files=files)
                print(f"Prediction: {response.status_code} - {response.json()}")
        except FileNotFoundError:
            print("No test image found - prediction endpoint not tested")

    except Exception as e:
        print(f"API test failed: {e}")

if __name__ == '__main__':
    test_api()