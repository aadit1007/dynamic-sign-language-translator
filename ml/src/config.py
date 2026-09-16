"""Configuration for the V1 static ASL alphabet classifier."""

# J and Z are intentionally excluded: their ASL signs require movement.
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
