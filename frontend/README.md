# ASL Learn - Frontend

React + Vite + TypeScript + Tailwind CSS frontend for the ASL Learn platform.

This directory is self-contained and does not touch the existing ML
pipeline, model files, or Python backend elsewhere in this repository.

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`).

To type-check and build for production:

```bash
npm run build
```

## What's real vs. mocked

| Area | Status |
| --- | --- |
| Alphabet lessons (A-Y) | Real content, instructions written for this app |
| Practice page camera feed | Real webcam access via `getUserMedia` |
| Sign recognition predictions | **Mocked** - see below |
| Quiz questions and scoring | Real (generated client-side, scored live) |
| Progress dashboard | Real, derived from actual practice/quiz activity stored in `localStorage` on this device |
| Basic Words | Not implemented, shown as "Coming Soon" |

## Connecting the real FastAPI backend

All mock prediction logic lives in one place:
`src/services/recognitionService.ts`

Every component that needs a prediction (the Practice page and the
webcam-based quiz question) calls `recognizeSign()` and only ever handles
the `PredictionResult` type:

```ts
interface PredictionResult {
  prediction: string;
  confidence: number;
}
```

To connect the real backend, replace the body of `recognizeSign` with a
`fetch` call to the FastAPI prediction endpoint (a sample implementation
is included as a comment in that file). No other file needs to change,
since every consumer is already typed against `PredictionResult` rather
than the mock's internals.

## Project structure

```
src/
├── components/   Reusable UI building blocks (cards, webcam view, quiz UI, feedback states)
├── pages/        Route-level views (Home, Learn, Practice, Quiz, Progress)
├── layouts/       Page chrome (nav + footer) shared across routes
├── data/         Static content: alphabet instructions, upcoming words list
├── hooks/        useWebcam (camera lifecycle), usePracticeSession (practice state machine)
├── services/     recognitionService (mock, backend seam), quizService, progressService
├── types/        Shared TypeScript interfaces, including PredictionResult
└── App.tsx       Route definitions
```
