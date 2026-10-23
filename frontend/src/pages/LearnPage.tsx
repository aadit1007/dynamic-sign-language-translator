import { Clock } from "lucide-react";
import { alphabetSigns } from "../data/alphabet";
import { upcomingWordCategories } from "../data/upcomingWords";
import SignCard from "../components/SignCard";

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-prose">
        <h1 className="font-serif text-3xl font-semibold">Learn</h1>
        <p className="mt-2 text-ink-soft">
          Start with the alphabet. Each sign has its own lesson with
          instructions for forming the handshape correctly.
        </p>
      </div>

      <section className="mt-10" aria-labelledby="alphabet-heading">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 id="alphabet-heading" className="font-serif text-xl font-semibold">
            Alphabet
          </h2>
          <span className="text-sm text-ink-muted">
            {alphabetSigns.length} signs supported
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {alphabetSigns.map((sign) => (
            <SignCard key={sign.letter} letter={sign.letter} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="words-heading">
        <div className="mb-5 flex items-center gap-3">
          <h2 id="words-heading" className="font-serif text-xl font-semibold">
            Basic Words
          </h2>
          <span className="badge border-ochre-500 bg-ochre-100 text-ochre-600">
            <Clock size={12} aria-hidden="true" />
            Coming soon
          </span>
        </div>
        <p className="mb-5 max-w-prose text-sm text-ink-soft">
          Vocabulary and word-level recognition are not available yet. The
          current model only recognizes static alphabet handshapes. Here's
          what's planned for this section:
        </p>
        <div
          aria-disabled="true"
          className="grid grid-cols-2 gap-3 opacity-60 sm:grid-cols-3 md:grid-cols-4"
        >
          {upcomingWordCategories.map((entry) => (
            <div
              key={entry.word}
              className="card flex flex-col gap-0.5 p-4"
            >
              <span className="font-medium text-ink">{entry.word}</span>
              <span className="text-xs text-ink-muted">{entry.category}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
