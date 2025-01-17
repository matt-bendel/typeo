import { Timestamp } from "firebase/firestore";
import { CharacterData } from "../race";

export interface RaceSchema {
  passage: string;
  wpm: number;
  accuracy: number;
  characterDataPoints: CharacterData[];
  testType: { name: string; amount?: number };
  timestamp: Timestamp;
}
