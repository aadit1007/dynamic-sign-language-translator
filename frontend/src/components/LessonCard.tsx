import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";

interface LessonCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  to?: string;
  linkLabel?: string;
  comingSoon?: boolean;
}

export default function LessonCard({
  title,
  description,
  icon,
  to,
  linkLabel = "Start",
  comingSoon = false,
}: LessonCardProps) {
  const content = (
    <div className="card flex h-full flex-col gap-4 p-6">
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-signal-50 text-signal-600">
          {icon}
        </span>
        {comingSoon && (
          <span className="badge border-ochre-500 bg-ochre-100 text-ochre-600">
            <Clock size={12} aria-hidden="true" />
            Coming soon
          </span>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-ink-soft">{description}</p>
      </div>
      {!comingSoon && (
        <span className="inline-flex items-center gap-1 text-sm font-medium text-signal-600">
          {linkLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </span>
      )}
    </div>
  );

  if (comingSoon || !to) {
    return <div aria-disabled="true">{content}</div>;
  }

  return (
    <Link to={to} className="block h-full rounded-md focus-visible:outline-none">
      {content}
    </Link>
  );
}
