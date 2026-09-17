# Machine Learning

This directory contains the machine-learning code, data layout, and model artifacts for the dynamic sign-language translator.

## V1 scope

V1 recognizes static American Sign Language (ASL) alphabet signs: 24 static letters (A-I and K-Y), plus `SPACE`, `DELETE`, and `NOTHING`. `J` and `Z` are excluded because their ASL forms involve movement and require a temporal model.

## Dataset and preparation

The manually downloaded ASL Alphabet dataset is kept at `data/raw/asl-alphabet.zip`. The preparation pipeline reads training images directly from that ZIP and never extracts or duplicates the image files. When requested, it writes small CSV manifests in `data/processed/`; each row records a ZIP member path, its V1 label, and its assigned split.

The source dataset has 29 training folders: `A`–`Z`, `del`, `nothing`, and `space`, with 3,000 images per folder. V1 selects 27 classes. `J` and `Z` are excluded completely because their signs require movement. Source names map as follows: `del` → `DELETE`, `nothing` → `NOTHING`, and `space` → `SPACE`.

Each selected class is independently shuffled with the fixed seed `42`, then split into 2,400 training, 300 validation, and 300 test images. This produces balanced, reproducible 80/10/10 splits of 64,800 / 8,100 / 8,100 images. The archive's separate 28-image test folder is not used.

To check the dataset and split without creating files, run from `ml/`:

```powershell
python -m src.verify_dataset
```

To create the CSV manifests only (no image extraction), run:

```powershell
python -m src.preparation --write-manifests
```

`src.dataset` provides `ZipImageDataset` and `create_dataloaders`. Training transforms use modest affine and color augmentation; validation and test transforms are deterministic. Raw data, generated manifests, and trained models are excluded from Git.

## Model, training, and evaluation

V1 uses torchvision's `mobilenet_v3_small` with ImageNet weights by default. Its final classifier is replaced with exactly 27 output units, using the `ASL_CLASSES` order in `src.config` as the single class-index source of truth. Training uses cross-entropy loss, AdamW, and a cosine learning-rate schedule. CUDA is selected automatically when available, with CPU fallback.

### Environment setup

The supported package pair is `torch==2.14.0` and `torchvision==0.29.0`. This pairing is verified by torchvision's package metadata, which requires `torch==2.14.0`. The local virtual environment currently uses their CPU builds (`2.14.0+cpu` and `0.29.0+cpu`), so it runs on CPU without a CUDA installation.

For a fresh local CPU environment, activate the project virtual environment and install the pinned requirements:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install -r ml/requirements.txt
```

For Kaggle or another CUDA-enabled environment, retain its CUDA-enabled PyTorch installation when it provides the same `2.14.0` / `0.29.0` package pair. The training code detects CUDA automatically; verify it with `python -c "import torch; print(torch.cuda.is_available())"`. Do not install a CPU-only wheel into a CUDA environment.

The first actual training run may download torchvision's ImageNet MobileNetV3-Small weights if they are not already cached. The smoke test intentionally uses random weights unless `--pretrained` is passed.

Run the lightweight pipeline smoke test from `ml/` (one batch, random weights by default, no checkpoint):

```powershell
python -m src.smoke_test --batch-size 2 --batches 1
```

Run a training session only when ready. It saves the validation-accuracy-best checkpoint in `models/`:

```powershell
python -m src.train --epochs 15 --batch-size 32
```

Evaluate a saved checkpoint on the ZIP-backed test manifest:

```powershell
python -m src.evaluate --checkpoint models/best_mobilenetv3_small.pt --batch-size 64
```

Checkpoints store the model state, architecture, ordered class names, preprocessing configuration, training settings, epoch, and best validation metrics. Evaluation reports test accuracy, per-class precision/recall/F1, macro F1, and a rows=true/columns=predicted confusion matrix.
