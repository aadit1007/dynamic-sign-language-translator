"""Run a tiny forward/backward check without a full training session."""

from __future__ import annotations

import argparse

import torch
from torch import nn
from torch.optim import AdamW

from .config import DEFAULT_LEARNING_RATE, NUM_CLASSES
from .dataset import create_dataloaders
from .model import create_model, parameter_count
from .train import select_device


def main() -> None:
    parser = argparse.ArgumentParser(description="Smoke test the V1 ASL training pipeline.")
    parser.add_argument("--batch-size", type=int, default=2)
    parser.add_argument("--batches", type=int, default=1)
    parser.add_argument("--device", default=None, help="for example: cpu, cuda, cuda:0")
    parser.add_argument(
        "--pretrained",
        action="store_true",
        help="use cached/downloadable ImageNet weights; off by default to keep this test offline",
    )
    args = parser.parse_args()
    if args.batch_size < 1 or args.batches < 1:
        parser.error("--batch-size and --batches must both be positive")

    device = select_device(args.device)
    loader = create_dataloaders(batch_size=args.batch_size)["train"]
    model = create_model(pretrained=args.pretrained).to(device)
    optimizer = AdamW(model.parameters(), lr=DEFAULT_LEARNING_RATE)
    criterion = nn.CrossEntropyLoss()

    processed = 0
    for images, targets in loader:
        images = images.to(device)
        targets = targets.to(device)
        optimizer.zero_grad(set_to_none=True)
        outputs = model(images)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()
        processed += 1
        print(f"input shape: {tuple(images.shape)}")
        print(f"output shape: {tuple(outputs.shape)}")
        print(f"target shape: {tuple(targets.shape)}")
        print(f"loss: {loss.item():.6f}")
        if processed == args.batches:
            break
    print(f"device: {device}")
    print(f"architecture: mobilenet_v3_small")
    print(f"parameters: {parameter_count(model):,}")
    print(f"batches completed: {processed}")
    print(f"output classes: {NUM_CLASSES}")


if __name__ == "__main__":
    main()
