"""MobileNetV3-Small model definition for V1 static ASL recognition."""

import torch.nn as nn
from torchvision.models import MobileNet_V3_Small_Weights, mobilenet_v3_small

from .config import MODEL_ARCHITECTURE, NUM_CLASSES


def create_model(pretrained: bool = True, num_classes: int = NUM_CLASSES) -> nn.Module:
    """Create MobileNetV3-Small with a classifier sized for V1 classes."""
    weights = MobileNet_V3_Small_Weights.IMAGENET1K_V1 if pretrained else None
    model = mobilenet_v3_small(weights=weights)
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    return model


def parameter_count(model: nn.Module) -> int:
    """Return the number of trainable and non-trainable model parameters."""
    return sum(parameter.numel() for parameter in model.parameters())


def architecture_name() -> str:
    """Return the checkpoint architecture identifier."""
    return MODEL_ARCHITECTURE
