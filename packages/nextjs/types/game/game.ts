export interface Game {
  adminAddress: string;
  status: "lobby" | "ongoing" | "paused" | "finished";
  inviteCode: string;
  maxPlayers: number;
  diceCount: number;
  mode: "auto" | "manual";
  privateKey: string;
  hiddenChars: Record<string, any>;
  prize: number;
  players: string[];
  winner?: string | null;
}
