"""Image transforms for static ASL classification."""

from torchvision import transforms

from .config import IMAGE_SIZE, NORMALIZATION_MEAN, NORMALIZATION_STD


def training_transform():
    """Return conservative augmentation for training images only.

    Horizontal flips are intentionally omitted because they can alter hand
    orientation and potentially change the meaning of a sign.
    """
    return transforms.Compose(
        [
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.RandomAffine(degrees=8, translate=(0.04, 0.04), scale=(0.95, 1.05)),
            transforms.ColorJitter(brightness=0.10, contrast=0.10),
            transforms.ToTensor(),
            transforms.Normalize(NORMALIZATION_MEAN, NORMALIZATION_STD),
        ]
    )


def evaluation_transform():
    """Return deterministic validation and test preprocessing."""
    return transforms.Compose(
        [
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(NORMALIZATION_MEAN, NORMALIZATION_STD),
        ]
    )
