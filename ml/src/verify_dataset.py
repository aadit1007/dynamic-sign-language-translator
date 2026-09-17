"""Verify the V1 ZIP-based dataset split without writing manifests or images."""

from .config import ASL_CLASSES, EXCLUDED_DATASET_CLASSES
from .preparation import build_split_records, discover_v1_images, split_counts


def main() -> None:
    images_by_class = discover_v1_images()
    records = build_split_records(images_by_class)
    counts = split_counts(records)

    print(f"V1 classes present: {len(images_by_class)} / {len(ASL_CLASSES)}")
    print(f"J and Z excluded: {not (set(EXCLUDED_DATASET_CLASSES) & set(images_by_class))}")
    for split, class_counts in counts.items():
        print(f"{split}: {sum(class_counts.values())} images")
        print("  " + ", ".join(f"{label}={class_counts[label]}" for label in ASL_CLASSES))


if __name__ == "__main__":
    main()
