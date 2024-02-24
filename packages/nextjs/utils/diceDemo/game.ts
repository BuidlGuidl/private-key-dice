const STORAGE_KEY = "game_sk";

export const saveGameState = (gameState: string) => {
  if (typeof window != "undefined" && window != null) {
    window.localStorage.setItem(STORAGE_KEY, gameState);
  }
};

export const loadGameState = () => {
  if (typeof window != "undefined" && window != null) {
    const gameState = window.localStorage.getItem(STORAGE_KEY);
    if (gameState) return JSON.parse(gameState);
  } else return { token: null, game: null };
};

export const updateGameState = (game: string) => {
  if (typeof window != "undefined" && window != null) {
    let gameState = window.localStorage.getItem(STORAGE_KEY);

    if (gameState) {
      const gameStateObj = JSON.parse(gameState);
      gameStateObj.game = game;
      gameState = JSON.stringify(gameStateObj);
      window.localStorage.setItem(STORAGE_KEY, gameState);
      return gameState;
    }
  }
};
