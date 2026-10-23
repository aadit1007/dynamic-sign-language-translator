import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LearnPage from "./pages/LearnPage";
import AlphabetLessonPage from "./pages/AlphabetLessonPage";
import PracticePage from "./pages/PracticePage";
import QuizPage from "./pages/QuizPage";
import ProgressPage from "./pages/ProgressPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/learn/alphabet/:letter" element={<AlphabetLessonPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/practice/:letter" element={<PracticePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
