import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line py-6">
        <div className="mx-auto max-w-6xl px-6 text-sm text-ink-muted">
          ASL Learn teaches the static alphabet signs A through Y. Basic
          words are in development.
        </div>
      </footer>
    </div>
  );
}
