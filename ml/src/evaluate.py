"""Model evaluation and checkpoint loading for V1 ASL recognition."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import torch
from torch import nn

from .config import ASL_CLASSES, MODEL_ARCHITECTURE
from .dataset import create_dataloaders
from .metrics import classification_metrics, confusion_matrix
from .model import create_model


@torch.inference_mode()
def evaluate_model(model: nn.Module, loader, device: torch.device) -> dict[str, object]:
    """Evaluate a model and return loss, accuracy, per-class metrics, and matrix."""
    model.eval()
    criterion = nn.CrossEntropyLoss()
    total_loss = 0.0
    total_examples = 0
    matrices = []
    for images, targets in loader:
        images = images.to(device, non_blocking=True)
        targets = targets.to(device, non_blocking=True)
        outputs = model(images)
        total_loss += criterion(outputs, targets).item() * targets.size(0)
        total_examples += targets.size(0)
        matrices.append(confusion_matrix(outputs.argmax(dim=1).cpu(), targets.cpu(), len(ASL_CLASSES)))
    matrix = sum(matrices, torch.zeros((len(ASL_CLASSES), len(ASL_CLASSES)), dtype=torch.int64))
    metrics = classification_metrics(matrix)
    metrics["loss"] = total_loss / total_examples if total_examples else 0.0
    return metrics


def load_checkpoint(checkpoint_path: Path, device: torch.device) -> tuple[nn.Module, dict]:
    """Load a V1 checkpoint after validating architecture and class ordering."""
    checkpoint = torch.load(checkpoint_path, map_location=device)
    if checkpoint["architecture"] != MODEL_ARCHITECTURE:
        raise ValueError(f"Unsupported architecture: {checkpoint['architecture']}")
    if checkpoint["class_names"] != list(ASL_CLASSES):
        raise ValueError("Checkpoint class order does not match the V1 configuration.")
    model = create_model(pretrained=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    return model.to(device), checkpoint


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate a V1 ASL checkpoint on the test manifest.")
    parser.add_argument("--checkpoint", type=Path, required=True)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--num-workers", type=int, default=0)
    parser.add_argument("--device", default=None, help="for example: cpu, cuda, cuda:0")
    args = parser.parse_args()
    device = torch.device(args.device or ("cuda" if torch.cuda.is_available() else "cpu"))
    loaders = create_dataloaders(args.batch_size, args.num_workers)
    model, checkpoint = load_checkpoint(args.checkpoint, device)
    metrics = evaluate_model(model, loaders["test"], device)
    print(json.dumps({"checkpoint_epoch": checkpoint["epoch"], **metrics}, indent=2))


if __name__ == "__main__":
    main()
