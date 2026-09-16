# Machine Learning

This directory contains the machine-learning code, data layout, and model artifacts for the dynamic sign-language translator.

## V1 scope

V1 recognizes static American Sign Language (ASL) alphabet signs: 24 static letters (A-I and K-Y), plus `SPACE`, `DELETE`, and `NOTHING`. `J` and `Z` are excluded because their ASL forms involve movement and require a temporal model.

Raw datasets belong in `data/raw/`, processed data in `data/processed/`, and trained model artifacts in `models/`. Their contents are excluded from Git.
