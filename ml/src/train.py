"""Train MobileNetV3-Small for V1 static ASL recognition."""

from __future__ import annotations

import argparse
import random
from pathlib import Path

import torch
from torch import nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

from .config import (
    ASL_CLASSES,
    DEFAULT_BATCH_SIZE,
    DEFAULT_EPOCHS,
    DEFAULT_LEARNING_RATE,
    DEFAULT_WEIGHT_DECAY,
    IMAGE_SIZE,
    MODEL_ARCHITECTURE,
    MODEL_DIR,
    NORMALIZATION_MEAN,
    NORMALIZATION_STD,
    RANDOM_SEED,
)
from .dataset import create_dataloaders
from .evaluate import evaluate_model
from .model import create_model, parameter_count


def select_device(requested_device: str | None) -> torch.device:
    """Choose an explicitly requested device or use CUDA when available."""
    return torch.device(requested_device or ("cuda" if torch.cuda.is_available() else "cpu"))


def set_seed(seed: int) -> None:
    """Set the random seeds used by this training process."""
    random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def train_one_epoch(model, loader, optimizer, device: torch.device) -> dict[str, float]:
    """Train one epoch and return mean loss and accuracy."""
    model.train()
    criterion = nn.CrossEntropyLoss()
    total_loss = 0.0
    correct = 0
    examples = 0
    for images, targets in loader:
        images = images.to(device, non_blocking=True)
        targets = targets.to(device, non_blocking=True)
        optimizer.zero_grad(set_to_none=True)
        outputs = model(images)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * targets.size(0)
        correct += (outputs.argmax(dim=1) == targets).sum().item()
        examples += targets.size(0)
    return {"loss": total_loss / examples, "accuracy": correct / examples}


def checkpoint_payload(model, epoch: int, training_config: dict, validation_metrics: dict) -> dict:
    """Create a self-describing checkpoint suitable for inference and resuming."""
    return {
        "model_state_dict": model.state_dict(),
        "class_names": list(ASL_CLASSES),
        "architecture": MODEL_ARCHITECTURE,
        "preprocessing": {
            "image_size": IMAGE_SIZE,
            "normalization_mean": NORMALIZATION_MEAN,
            "normalization_std": NORMALIZATION_STD,
        },
        "training_config": training_config,
        "epoch": epoch,
        "best_validation_metrics": validation_metrics,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Train V1 static ASL MobileNetV3-Small.")
    parser.add_argument("--epochs", type=int, default=DEFAULT_EPOCHS)
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    parser.add_argument("--learning-rate", type=float, default=DEFAULT_LEARNING_RATE)
    parser.add_argument("--weight-decay", type=float, default=DEFAULT_WEIGHT_DECAY)
    parser.add_argument("--num-workers", type=int, default=0)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    parser.add_argument("--device", default=None, help="for example: cpu, cuda, cuda:0")
    parser.add_argument("--no-pretrained", action="store_true", help="do not load ImageNet weights")
    parser.add_argument("--checkpoint", type=Path, default=MODEL_DIR / "best_mobilenetv3_small.pt")
    args = parser.parse_args()
    if args.epochs < 1 or args.batch_size < 1:
        parser.error("--epochs and --batch-size must both be positive")

    set_seed(args.seed)
    device = select_device(args.device)
    loaders = create_dataloaders(args.batch_size, args.num_workers)
    model = create_model(pretrained=not args.no_pretrained).to(device)
    optimizer = AdamW(model.parameters(), lr=args.learning_rate, weight_decay=args.weight_decay)
    scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs)
    training_config = {
        "epochs": args.epochs,
        "batch_size": args.batch_size,
        "learning_rate": args.learning_rate,
        "weight_decay": args.weight_decay,
        "seed": args.seed,
        "pretrained": not args.no_pretrained,
    }
    print(f"Device: {device}; parameters: {parameter_count(model):,}")

    best_accuracy = -1.0
    for epoch in range(1, args.epochs + 1):
        train_metrics = train_one_epoch(model, loaders["train"], optimizer, device)
        validation_metrics = evaluate_model(model, loaders["validation"], device)
        scheduler.step()
        print(
            f"Epoch {epoch}/{args.epochs} | "
            f"train loss={train_metrics['loss']:.4f} accuracy={train_metrics['accuracy']:.4f} | "
            f"validation loss={validation_metrics['loss']:.4f} "
            f"accuracy={validation_metrics['accuracy']:.4f} macro_f1={validation_metrics['macro_f1']:.4f}"
        )
        if validation_metrics["accuracy"] > best_accuracy:
            best_accuracy = validation_metrics["accuracy"]
            args.checkpoint.parent.mkdir(parents=True, exist_ok=True)
            torch.save(checkpoint_payload(model, epoch, training_config, validation_metrics), args.checkpoint)
            print(f"Saved best checkpoint: {args.checkpoint}")


if __name__ == "__main__":
    main()
