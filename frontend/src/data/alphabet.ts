import type { AlphabetSign } from "../types";

/**
 * The static alphabet signs currently supported by the V1 recognition model.
 *
 * Supported letters:
 * A-I, K-Y
 *
 * J and Z are excluded because their ASL forms involve movement rather
 * than a single static handshape.
 *
 * The trained model also contains three non-letter classes:
 * SPACE, DELETE, and NOTHING. These are used by the recognition system
 * but are not presented as alphabet lessons.
 */
export const alphabetSigns: AlphabetSign[] = [
  {
    letter: "A",
    name: "A",
    image: "/signs/A.png",
    instructions: [
      "Make a fist with your dominant hand.",
      "Rest your thumb against the side of your fist, not across the front.",
      "Keep your knuckles facing forward.",
    ],
    tip: "Keep the thumb on the side, not tucked across the fingers like a plain fist.",
  },
  {
    letter: "B",
    name: "B",
    image: "/signs/B.png",
    instructions: [
      "Hold your hand flat with fingers together, pointing up.",
      "Tuck your thumb across your palm.",
      "Keep your palm facing forward.",
    ],
  },
  {
    letter: "C",
    name: "C",
    image: "/signs/C.png",
    instructions: [
      "Curve your fingers and thumb into a C shape.",
      "Keep an open gap between your thumb and fingers.",
      "Hold your hand sideways, as if gripping a cup.",
    ],
  },
  {
    letter: "D",
    name: "D",
    image: "/signs/D.png",
    instructions: [
      "Point your index finger straight up.",
      "Touch your thumb to your middle finger.",
      "Curl your ring and pinky fingers into your palm.",
    ],
    tip: "Compare with F: in D only the index finger is raised.",
  },
  {
    letter: "E",
    name: "E",
    image: "/signs/E.png",
    instructions: [
      "Curl all four fingers down toward your palm.",
      "Rest your thumb across the front of your fingertips.",
      "Keep your hand facing forward, fingers bent, not a full fist.",
    ],
  },
  {
    letter: "F",
    name: "F",
    image: "/signs/F.png",
    instructions: [
      "Touch your thumb and index finger together to form a circle.",
      "Extend your middle, ring, and pinky fingers straight up.",
      "Keep your palm facing forward.",
    ],
    tip: "Compare with D: in F it's the index finger and thumb that touch.",
  },
  {
    letter: "G",
    name: "G",
    image: "/signs/G.png",
    instructions: [
      "Point your index finger and thumb out to the side, like a small gun shape.",
      "Curl your other fingers into your palm.",
      "Keep your hand turned sideways, not facing forward.",
    ],
  },
  {
    letter: "H",
    name: "H",
    image: "/signs/H.png",
    instructions: [
      "Extend your index and middle fingers together, side by side.",
      "Curl your remaining fingers into your palm.",
      "Turn your hand sideways, fingers pointing across your body.",
    ],
  },
  {
    letter: "I",
    name: "I",
    image: "/signs/I.png",
    instructions: [
      "Make a fist.",
      "Extend only your pinky finger straight up.",
      "Keep your palm facing forward.",
    ],
  },
  {
    letter: "K",
    name: "K",
    image: "/signs/K.png",
    instructions: [
      "Point your index and middle fingers up in a V shape.",
      "Rest your thumb between the index and middle fingers.",
      "Keep your ring and pinky fingers curled into your palm.",
    ],
  },
  {
    letter: "L",
    name: "L",
    image: "/signs/L.png",
    instructions: [
      "Point your index finger straight up.",
      "Point your thumb straight out to the side.",
      "Curl your remaining fingers into your palm, forming an L shape.",
    ],
  },
  {
    letter: "M",
    name: "M",
    image: "/signs/M.png",
    instructions: [
      "Tuck your thumb under your index, middle, and ring fingers.",
      "Fold those three fingers down over your thumb.",
      "Keep your pinky tucked in as well.",
    ],
    tip: "Compare with N: M tucks the thumb under three fingers, N tucks it under two.",
  },
  {
    letter: "N",
    name: "N",
    image: "/signs/N.png",
    instructions: [
      "Tuck your thumb under your index and middle fingers.",
      "Fold those two fingers down over your thumb.",
      "Keep your ring and pinky fingers curled into your palm.",
    ],
  },
  {
    letter: "O",
    name: "O",
    image: "/signs/O.png",
    instructions: [
      "Curve all your fingers and thumb to touch at the tips.",
      "Form a rounded O shape with your whole hand.",
      "Keep the shape closed, without a gap.",
    ],
  },
  {
    letter: "P",
    name: "P",
    image: "/signs/P.png",
    instructions: [
      "Form the K handshape, with index and middle fingers in a V.",
      "Point your fingers down instead of up.",
      "Let your middle finger touch your thumb, hand angled downward.",
    ],
  },
  {
    letter: "Q",
    name: "Q",
    image: "/signs/Q.png",
    instructions: [
      "Form the G handshape, index finger and thumb extended.",
      "Point your fingers down toward the floor.",
      "Keep your other fingers curled into your palm.",
    ],
  },
  {
    letter: "R",
    name: "R",
    image: "/signs/R.png",
    instructions: [
      "Extend your index and middle fingers upward.",
      "Cross your middle finger over your index finger.",
      "Keep your ring and pinky fingers curled into your palm.",
    ],
  },
  {
    letter: "S",
    name: "S",
    image: "/signs/S.png",
    instructions: [
      "Make a fist.",
      "Wrap your thumb across the front of your fingers.",
      "Keep your knuckles facing forward.",
    ],
    tip: "Compare with A: in S the thumb lies across the front of the fingers, not the side.",
  },
  {
    letter: "T",
    name: "T",
    image: "/signs/T.png",
    instructions: [
      "Make a fist.",
      "Tuck your thumb between your index and middle fingers.",
      "Keep your other fingers curled closed.",
    ],
  },
  {
    letter: "U",
    name: "U",
    image: "/signs/U.png",
    instructions: [
      "Extend your index and middle fingers together, pointing up.",
      "Keep them touching, side by side.",
      "Curl your remaining fingers into your palm.",
    ],
  },
  {
    letter: "V",
    name: "V",
    image: "/signs/V.png",
    instructions: [
      "Extend your index and middle fingers.",
      "Spread them apart in a V shape.",
      "Curl your remaining fingers into your palm.",
    ],
    tip: "Compare with U: in V the two fingers are spread apart, in U they stay together.",
  },
  {
    letter: "W",
    name: "W",
    image: "/signs/W.png",
    instructions: [
      "Extend your index, middle, and ring fingers.",
      "Spread them apart evenly.",
      "Hold your thumb and pinky together against your palm.",
    ],
  },
  {
    letter: "X",
    name: "X",
    image: "/signs/X.png",
    instructions: [
      "Make a fist.",
      "Bend your index finger into a hook shape.",
      "Keep your other fingers and thumb closed.",
    ],
  },
  {
    letter: "Y",
    name: "Y",
    image: "/signs/Y.png",
    instructions: [
      "Extend your thumb and pinky finger out to the sides.",
      "Curl your index, middle, and ring fingers into your palm.",
      "Hold your hand steady, forming a Y shape.",
    ],
  },
];

export function getSignByLetter(letter: string): AlphabetSign | undefined {
  return alphabetSigns.find(
    (sign) => sign.letter.toLowerCase() === letter.toLowerCase(),
  );
}
