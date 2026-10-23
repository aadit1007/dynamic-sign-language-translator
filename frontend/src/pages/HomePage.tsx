import { Link } from "react-router-dom";
import { BookOpen, Camera, ClipboardCheck, LineChart } from "lucide-react";

const CAPABILITIES = [
  {
    icon: <BookOpen size={20} aria-hidden="true" />,
    title: "Learn ASL alphabet signs",
    description:
      "Step-by-step instructions for forming each supported alphabet handshape, letter by letter.",
  },
  {
    icon: <Camera size={20} aria-hidden="true" />,
    title: "Practice with your webcam",
    description:
      "Select a sign, turn on your camera, and get feedback on whether your handshape matched.",
  },
  {
    icon: <ClipboardCheck size={20} aria-hidden="true" />,
    title: "Test yourself with quizzes",
    description:
      "Multiple-choice questions covering sign recognition and letter recall, with a score at the end.",
  },
  {
    icon: <LineChart size={20} aria-hidden="true" />,
    title: "Track your learning progress",
    description:
      "See which letters you've practiced and how your quiz results have gone over time.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Learn the ASL alphabet, sign by sign.
            </h1>
            <p className="mt-5 max-w-prose text-lg text-ink-soft">
              ASL Learn teaches the 25 static American Sign Language alphabet
              signs, A through Y, and lets you practice them in front of your
              webcam. Get instructions for each handshape, test yourself with
              quizzes, and track what you've practiced.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/learn" className="btn-primary">
                Start learning
              </Link>
              <Link to="/practice" className="btn-secondary">
                Go to practice
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="mb-8 font-serif text-2xl font-semibold">
          What you can do here
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((item) => (
            <div key={item.title} className="card p-5">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-signal-50 text-signal-600">
                {item.icon}
              </span>
              <h3 className="font-medium text-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="max-w-prose">
            <h2 className="font-serif text-xl font-semibold">
              What's supported right now
            </h2>
            <p className="mt-3 text-ink-soft">
              The recognition system currently identifies static alphabet
              handshapes, letters A through Y, from a single webcam frame at
              a time. It does not yet translate full words, sentences, or
              signs that involve motion. Vocabulary lessons for basic words
              are in development and marked as coming soon.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
