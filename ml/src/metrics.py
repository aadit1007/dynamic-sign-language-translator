"""Dependency-free multiclass classification metrics."""

from __future__ import annotations

import torch


def confusion_matrix(predictions: torch.Tensor, targets: torch.Tensor, num_classes: int) -> torch.Tensor:
    """Build a rows=true, columns=predicted confusion matrix."""
    indices = targets.to(torch.int64) * num_classes + predictions.to(torch.int64)
    return torch.bincount(indices, minlength=num_classes**2).reshape(num_classes, num_classes)


def classification_metrics(matrix: torch.Tensor) -> dict[str, object]:
    """Calculate accuracy and per-class precision, recall, and F1 from a matrix."""
    matrix = matrix.to(torch.float64)
    true_positives = matrix.diag()
    predicted_totals = matrix.sum(dim=0)
    actual_totals = matrix.sum(dim=1)
    precision = torch.where(predicted_totals > 0, true_positives / predicted_totals, 0.0)
    recall = torch.where(actual_totals > 0, true_positives / actual_totals, 0.0)
    f1 = torch.where(precision + recall > 0, 2 * precision * recall / (precision + recall), 0.0)
    total = matrix.sum()
    accuracy = (true_positives.sum() / total).item() if total > 0 else 0.0
    return {
        "accuracy": accuracy,
        "precision": precision.tolist(),
        "recall": recall.tolist(),
        "f1": f1.tolist(),
        "macro_f1": f1.mean().item(),
        "confusion_matrix": matrix.to(torch.int64).tolist(),
    }
