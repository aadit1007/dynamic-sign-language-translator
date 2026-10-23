import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { alphabetSigns, getSignByLetter } from "../data/alphabet";

export default function AlphabetLessonPage() {
  const { letter } = useParams<{ letter: string }>();
  const sign = letter ? getSignByLetter(letter) : undefined;

  if (!sign) {
    return <Navigate to="/learn" replace />;
  }

  const index = alphabetSigns.findIndex((s) => s.letter === sign.letter);
  const prev = alphabetSigns[index - 1];
  const next = alphabetSigns[index + 1];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        to="/learn"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Alphabet
      </Link>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <div className="card flex aspect-square items-center justify-center overflow-hidden p-4">
          <img
            src={sign.image}
            alt={`ASL sign for the letter ${sign.letter}`}
            className="h-full w-full object-contain"
          />
        </div>

        <div>
          <h1 className="font-serif text-3xl font-semibold">
            Sign for "{sign.name}"
          </h1>

          <h2 className="mt-6 text-sm font-medium uppercase tracking-wide text-ink-muted">
            How to form this sign
          </h2>
          <ol className="mt-3 space-y-2">
            {sign.instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-ink-soft">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border border-line text-xs text-ink-muted">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {sign.tip && (
            <div className="mt-4 flex gap-2 rounded-md border border-line bg-signal-50 p-3 text-sm text-signal-700">
              <Info size={16} className="mt-0.5 flex-none" aria-hidden="true" />
              <p>{sign.tip}</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={`/practice/${sign.letter}`} className="btn-primary">
              Practice this sign
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-line pt-6">
        {prev ? (
          <Link
            to={`/learn/alphabet/${prev.letter}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {prev.letter}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/learn/alphabet/${next.letter}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
          >
            {next.letter}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
