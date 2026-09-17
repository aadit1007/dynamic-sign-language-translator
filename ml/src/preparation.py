"""Create deterministic V1 split manifests from the ASL Alphabet ZIP archive.

The archive remains the single source of image bytes.  Generated manifests only
store ZIP member paths, labels, and split names; no images are extracted.
"""

from __future__ import annotations

import argparse
import csv
import random
import zipfile
from collections import Counter, defaultdict
from pathlib import PurePosixPath

from .config import (
    ASL_CLASSES,
    DATASET_CLASS_TO_V1,
    EXCLUDED_DATASET_CLASSES,
    PROCESSED_DATA_DIR,
    RANDOM_SEED,
    RAW_DATASET_ARCHIVE,
    SPLIT_NAMES,
    SPLIT_RATIOS,
)

IMAGE_SUFFIXES = frozenset({".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp"})
MANIFEST_FIELDS = ("member_path", "label", "split")
TRAINING_ROOT = ("asl_alphabet_train", "asl_alphabet_train")


def _source_class_from_member(member_path: str) -> str | None:
    """Return the source class for a training image, otherwise ``None``."""
    path = PurePosixPath(member_path)
    if path.suffix.lower() not in IMAGE_SUFFIXES or path.parts[:2] != TRAINING_ROOT:
        return None
    if len(path.parts) != 4:
        return None
    return path.parts[2]


def discover_v1_images(archive_path=RAW_DATASET_ARCHIVE) -> dict[str, list[str]]:
    """Read V1 training-image paths from an archive without extracting images."""
    archive_path = archive_path
    if not archive_path.is_file():
        raise FileNotFoundError(f"ASL archive not found: {archive_path}")

    images_by_class: dict[str, list[str]] = defaultdict(list)
    source_classes: set[str] = set()
    with zipfile.ZipFile(archive_path) as archive:
        for member in archive.infolist():
            if member.is_dir():
                continue
            source_class = _source_class_from_member(member.filename)
            if source_class is None:
                continue
            source_classes.add(source_class)
            v1_class = DATASET_CLASS_TO_V1.get(source_class)
            if v1_class is not None:
                images_by_class[v1_class].append(member.filename)

    expected_source_classes = set(DATASET_CLASS_TO_V1) | EXCLUDED_DATASET_CLASSES
    unexpected = source_classes - expected_source_classes
    missing = expected_source_classes - source_classes
    if unexpected or missing:
        raise ValueError(
            f"Unexpected source classes: {sorted(unexpected)}; "
            f"missing source classes: {sorted(missing)}"
        )
    if set(images_by_class) != set(ASL_CLASSES):
        raise ValueError("Archive does not contain every configured V1 class.")
    return {label: sorted(images_by_class[label]) for label in ASL_CLASSES}


def build_split_records(
    images_by_class: dict[str, list[str]], seed: int = RANDOM_SEED
) -> list[dict[str, str]]:
    """Create an exact, deterministic 80/10/10 stratified split."""
    records: list[dict[str, str]] = []
    rng = random.Random(seed)
    for label in ASL_CLASSES:
        members = list(images_by_class[label])
        rng.shuffle(members)
        total = len(members)
        train_end = int(total * SPLIT_RATIOS["train"])
        validation_end = train_end + int(total * SPLIT_RATIOS["validation"])
        assignments = (
            ("train", members[:train_end]),
            ("validation", members[train_end:validation_end]),
            ("test", members[validation_end:]),
        )
        for split, split_members in assignments:
            records.extend(
                {"member_path": member, "label": label, "split": split}
                for member in split_members
            )
    return records


def split_counts(records: list[dict[str, str]]) -> dict[str, Counter[str]]:
    """Return per-split class counts for records."""
    counts = {split: Counter() for split in SPLIT_NAMES}
    for record in records:
        counts[record["split"]][record["label"]] += 1
    return counts


def write_manifests(
    records: list[dict[str, str]], output_dir=PROCESSED_DATA_DIR
) -> dict[str, object]:
    """Write small CSV manifests only; the image archive is never extracted."""
    output_dir.mkdir(parents=True, exist_ok=True)
    paths: dict[str, object] = {}
    for split in SPLIT_NAMES:
        path = output_dir / f"{split}_manifest.csv"
        with path.open("w", newline="", encoding="utf-8") as manifest:
            writer = csv.DictWriter(manifest, fieldnames=MANIFEST_FIELDS)
            writer.writeheader()
            writer.writerows(record for record in records if record["split"] == split)
        paths[split] = path
    return paths


def prepare_manifests() -> dict[str, object]:
    """Build and write reproducible ZIP-backed manifests for V1."""
    return write_manifests(build_split_records(discover_v1_images()))


def main() -> None:
    parser = argparse.ArgumentParser(description="Create V1 ASL split manifests.")
    parser.add_argument(
        "--write-manifests",
        action="store_true",
        help="write CSV manifests under ml/data/processed (no image extraction)",
    )
    args = parser.parse_args()
    if not args.write_manifests:
        parser.error("pass --write-manifests to create manifests")
    paths = prepare_manifests()
    print("Created ZIP-backed manifests:")
    for split, path in paths.items():
        print(f"  {split}: {path}")


if __name__ == "__main__":
    main()
