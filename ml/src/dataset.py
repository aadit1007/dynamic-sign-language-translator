"""ZIP-backed PyTorch datasets and DataLoaders for V1 ASL manifests."""

from __future__ import annotations

import csv
import zipfile
from pathlib import Path

import torch
from PIL import Image
from torch.utils.data import DataLoader, Dataset

from .config import ASL_CLASSES, PROCESSED_DATA_DIR, RAW_DATASET_ARCHIVE, SPLIT_NAMES
from .transforms import evaluation_transform, training_transform


class ZipImageDataset(Dataset):
    """Load RGB images directly from the ASL ZIP using a CSV manifest."""

    def __init__(self, manifest_path: Path, transform=None, archive_path=RAW_DATASET_ARCHIVE):
        self.manifest_path = Path(manifest_path)
        self.archive_path = Path(archive_path)
        self.transform = transform
        self.class_to_index = {label: index for index, label in enumerate(ASL_CLASSES)}
        self.records = self._read_manifest()
        self._archive: zipfile.ZipFile | None = None

    def _read_manifest(self) -> list[dict[str, str]]:
        if not self.manifest_path.is_file():
            raise FileNotFoundError(
                f"Manifest not found: {self.manifest_path}. "
                "Run `python -m src.preparation --write-manifests` first."
            )
        with self.manifest_path.open(newline="", encoding="utf-8") as manifest:
            records = list(csv.DictReader(manifest))
        invalid = {record["label"] for record in records} - set(ASL_CLASSES)
        if invalid:
            raise ValueError(f"Manifest contains unsupported labels: {sorted(invalid)}")
        return records

    def _get_archive(self) -> zipfile.ZipFile:
        if self._archive is None:
            self._archive = zipfile.ZipFile(self.archive_path)
        return self._archive

    def __getstate__(self):
        state = self.__dict__.copy()
        state["_archive"] = None
        return state

    def __len__(self) -> int:
        return len(self.records)

    def __getitem__(self, index: int):
        record = self.records[index]
        with self._get_archive().open(record["member_path"]) as image_file:
            with Image.open(image_file) as image:
                image = image.convert("RGB")
        if self.transform is not None:
            image = self.transform(image)
        return image, self.class_to_index[record["label"]]


def create_datasets(manifest_dir=PROCESSED_DATA_DIR) -> dict[str, ZipImageDataset]:
    """Create train, validation, and test datasets from generated manifests."""
    manifest_dir = Path(manifest_dir)
    return {
        "train": ZipImageDataset(manifest_dir / "train_manifest.csv", training_transform()),
        "validation": ZipImageDataset(
            manifest_dir / "validation_manifest.csv", evaluation_transform()
        ),
        "test": ZipImageDataset(manifest_dir / "test_manifest.csv", evaluation_transform()),
    }


def create_dataloaders(
    batch_size: int = 32, num_workers: int = 0, manifest_dir=PROCESSED_DATA_DIR
) -> dict[str, DataLoader]:
    """Create DataLoaders; only the training loader shuffles its samples."""
    datasets = create_datasets(manifest_dir)
    return {
        split: DataLoader(
            dataset,
            batch_size=batch_size,
            shuffle=split == "train",
            num_workers=num_workers,
            pin_memory=torch.cuda.is_available(),
            persistent_workers=num_workers > 0,
        )
        for split, dataset in datasets.items()
        if split in SPLIT_NAMES
    }
