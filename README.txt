ASL Learn FastAPI backend files

Copy the backend folder into the root of your dynamic-sign-language-translator project.
Keep the existing ml folder and checkpoint in place.

From the project root, in Windows Command Prompt:

.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000

Open these URLs:
http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs

In /docs, expand POST /predict, choose an image file containing a visible hand, and execute.

Notes:
- This reuses the project's checkpoint class order and evaluation_transform.
- The checkpoint must exist at ml/models/best_mobilenetv3_small_v1.pth.
- Keep model/data/checkpoint files out of Git if they are ignored already.
- If startup fails, inspect /health and the terminal output.
