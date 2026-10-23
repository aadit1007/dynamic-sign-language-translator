import { NavLink } from "react-router-dom";
import { Hand } from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/learn", label: "Learn" },
  { to: "/practice", label: "Practice" },
  { to: "/quiz", label: "Quiz" },
  { to: "/progress", label: "Progress" },
];

export default function Navbar() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink
          to="/"
          className="flex items-center gap-2 text-lg font-semibold text-ink"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-signal-500 text-paper">
            <Hand size={18} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="font-serif">ASL Learn</span>
        </NavLink>

        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    [
                      "rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-signal-50 text-signal-700"
                        : "text-ink-soft hover:bg-white hover:text-ink",
                    ].join(" ")
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
