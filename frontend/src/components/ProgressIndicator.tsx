interface ProgressIndicatorProps {
  label: string;
  value: number;
  total: number;
  unit?: string;
}

export default function ProgressIndicator({
  label,
  value,
  total,
  unit,
}: ProgressIndicatorProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="font-medium text-ink">
          {value}
          {unit ? ` ${unit}` : ""} / {total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-line/60"
      >
        <div
          className="h-full rounded-full bg-signal-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
