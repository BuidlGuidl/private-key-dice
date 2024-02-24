export interface Game {
  _id: string;
  adminAddress: string;
  status: "lobby" | "ongoing" | "paused" | "finished";
  inviteCode: string;
  diceCount: number;
  mode: "auto" | "manual" | "brute";
  privateKey: string;
  hiddenPrivateKey: string;
  hiddenChars: Record<string, any>;
  players: string[];
  winner?: string | null;
}
