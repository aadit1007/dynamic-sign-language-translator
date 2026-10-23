import type { UpcomingWord } from "../types";

/**
 * "Basic Words" is not implemented. This list only exists to preview the
 * planned vocabulary categories on the Coming Soon panel. No recognition
 * or lessons are provided for these entries.
 */
export const upcomingWordCategories: UpcomingWord[] = [
  { word: "Hello", category: "Greetings" },
  { word: "Thank you", category: "Greetings" },
  { word: "Please", category: "Greetings" },
  { word: "Yes", category: "Common responses" },
  { word: "No", category: "Common responses" },
  { word: "Help", category: "Common responses" },
  { word: "Family", category: "People" },
  { word: "Friend", category: "People" },
  { word: "Eat", category: "Everyday actions" },
  { word: "Drink", category: "Everyday actions" },
  { word: "Learn", category: "Everyday actions" },
  { word: "Practice", category: "Everyday actions" },
];
