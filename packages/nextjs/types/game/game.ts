export interface Game {
  _id: string;
  adminAddress: string;
  status: "lobby" | "ongoing" | "paused" | "finished";
  inviteCode: string;
  diceCount: number;
  mode: "auto" | "manual" | "brute";
  privateKey: string;
  hiddenPrivateKey: string;
  players: string[];
  winner?: string | null;
}
