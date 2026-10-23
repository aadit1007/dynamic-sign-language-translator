import { Link } from "react-router-dom";

interface SignCardProps {
  letter: string;
  masteryLabel?: string;
}

/**
 * Compact card representing a single alphabet sign, used in the Learn >
 * Alphabet grid. Links to that sign's individual lesson page.
 */
export default function SignCard({ letter, masteryLabel }: SignCardProps) {
  return (
    <Link
      to={`/learn/alphabet/${letter}`}
      className="card group flex flex-col items-center gap-2 p-4 text-center transition-colors hover:border-signal-500 focus-visible:border-signal-500"
    >
      <span className="font-serif text-3xl font-semibold text-ink group-hover:text-signal-600">
        {letter}
      </span>
      <span className="text-xs text-ink-muted">
        {masteryLabel ?? "View lesson"}
      </span>
    </Link>
  );
}
