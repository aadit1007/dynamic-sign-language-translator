# ASL Learn

**An interactive American Sign Language learning and practice platform powered by computer vision and machine learning.**

ASL Learn helps beginners learn static ASL alphabet handshapes through illustrated lessons, webcam-based practice, interactive quizzes, and local progress tracking.

## Features

- **Alphabet lessons:** Learn supported ASL letters with hand-sign images, instructions, and tips.
- **Webcam practice:** Select a target letter and receive feedback from the trained recognition model.
- **Interactive quizzes:** Test your knowledge using multiple-choice and webcam-practice questions.
- **Progress tracking:** Review practice attempts, accuracy, quiz results, and alphabet coverage.
- **Hand detection:** MediaPipe identifies the hand before the image is passed to the classifier.

## Tech Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI, Uvicorn |
| Machine learning | PyTorch, Torchvision, MobileNetV3-Small |
| Computer vision | OpenCV, MediaPipe |
| Image processing | Pillow, NumPy |

## Recognition Scope

The current model has 27 output classes:

- 24 static alphabet letters: A–I and K–Y
- `SPACE`
- `DELETE`
- `NOTHING`

The letters J and Z are excluded because their ASL forms involve movement. This version does not provide full sentence translation or dynamic-sign recognition.

## Project Structure

```text
dynamic-sign-language-translator/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── __init__.py
├── frontend/
│   ├── public/
│   │   └── signs/
│   ├── src/
│   ├── package.json
│   └── README.md
├── ml/
│   ├── src/
│   ├── notebooks/
│   └── models/
├── .gitignore
└── README.md
```

## Requirements

- Python 3.11 recommended
- Node.js and npm
- Git
- A webcam for practice features
- The trained model checkpoint

The checkpoint is excluded from Git and must be available locally at:

```text
ml/models/best_mobilenetv3_small_v1.pth
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/aadit1007/dynamic-sign-language-translator.git
cd dynamic-sign-language-translator
```

### 2. Set up the backend

From the project root, create a Python virtual environment:

```cmd
python -m venv .venv
.venv\Scripts\activate
```

Install the backend dependencies:

```cmd
python -m pip install -r backend\requirements.txt
```

Ensure the trained checkpoint exists at `ml/models/best_mobilenetv3_small_v1.pth`.

Start the API from the project root:

```cmd
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:

- Health check: http://127.0.0.1:8000/health
- Interactive API documentation: http://127.0.0.1:8000/docs

The health endpoint reports whether the model loaded successfully. Check `model_loaded` before testing predictions.

### 3. Set up the frontend

Open a second terminal:

```cmd
cd frontend
npm install
```

Create or update `frontend/.env.local` with:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the development server:

```cmd
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173.

Keep both the frontend and backend terminals running during development.

## API Endpoints

### `GET /health`

Returns the API status, model-loading status, compute device, supported classes, checkpoint path, and any model-loading error.

### `POST /predict`

Accepts an uploaded image and attempts to detect a hand and classify its static sign.

The response includes hand-detection status, prediction, confidence, acceptance status, and top predictions. If no hand is detected, the API returns an explanatory message.

The model uses a confidence threshold of `0.60`. Predictions below this threshold are not accepted as final predictions.

## Model and Evaluation

The classifier uses MobileNetV3-Small with a custom output layer for the 27 classes. Input images are resized to 224 × 224 pixels and normalized using ImageNet mean and standard deviation.

The inference pipeline detects a hand with MediaPipe, extracts a padded hand crop, and passes it to the classifier.

High accuracy on a held-out dataset does not guarantee equivalent performance in real-world conditions. Lighting, hand position, background, and camera quality can affect predictions.

## Current Limitations

- Only supported static alphabet signs are classified.
- Dynamic signs and continuous ASL translation are not implemented.
- Basic-word recognition requires additional model development.
- Webcam recognition depends on hand visibility and image quality.
- Progress is stored locally on the device rather than synchronized to a user account.
- The trained model checkpoint and dataset are not included in the repository.  

## Future Improvements

- Improve webcam recognition robustness and feedback.
- Validate instructional images against reliable ASL references.
- Expand lessons and quizzes.
- Add vocabulary recognition and dynamic-sign support.
- Explore account-based progress synchronization.

## Repository

GitHub: https://github.com/aadit1007/dynamic-sign-language-translator
