"""Configuration for the V1 static ASL alphabet data pipeline."""

from pathlib import Path


# J and Z are intentionally excluded because their ASL signs require movement.
ASL_CLASSES = (
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "SPACE",
    "DELETE",
    "NOTHING",
)

NUM_CLASSES = len(ASL_CLASSES)

# The ASL Alphabet archive uses lowercase names for its three non-letter signs.
DATASET_CLASS_TO_V1 = {
    **{letter: letter for letter in "ABCDEFGHIKLMNOPQRSTUVWXY"},
    "del": "DELETE",
    "nothing": "NOTHING",
    "space": "SPACE",
}

EXCLUDED_DATASET_CLASSES = frozenset({"J", "Z"})

ML_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ML_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
RAW_DATASET_ARCHIVE = RAW_DATA_DIR / "asl-alphabet.zip"
MODEL_DIR = ML_DIR / "models"

RANDOM_SEED = 42
SPLIT_RATIOS = {"train": 0.80, "validation": 0.10, "test": 0.10}
SPLIT_NAMES = tuple(SPLIT_RATIOS)

# ImageNet normalization is appropriate for torchvision models with ImageNet weights.
IMAGE_SIZE = 224
NORMALIZATION_MEAN = (0.485, 0.456, 0.406)
NORMALIZATION_STD = (0.229, 0.224, 0.225)

MODEL_ARCHITECTURE = "mobilenet_v3_small"
DEFAULT_BATCH_SIZE = 32
DEFAULT_EPOCHS = 15
DEFAULT_LEARNING_RATE = 1e-3
DEFAULT_WEIGHT_DECAY = 1e-4
