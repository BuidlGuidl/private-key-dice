const useGameData = () => {
  const STORAGE_KEY = "game_sk";

  const saveGameState = (gameState: string) => {
    if (typeof window != "undefined" && window != null) {
      window.localStorage.setItem(STORAGE_KEY, gameState);
    }
  };

  const loadGameState = () => {
    if (typeof window != "undefined" && window != null) {
      const gameState = window.localStorage.getItem(STORAGE_KEY);
      if (gameState) {
        const gameStateObj = JSON.parse(gameState);
        return gameStateObj;
      }
    } else return { token: null, game: null };
  };

  const updateGameState = (game: string) => {
    if (typeof window != "undefined" && window != null) {
      let gameState = window.localStorage.getItem(STORAGE_KEY);

      if (gameState) {
        const gameStateObj = JSON.parse(gameState);
        gameStateObj.game = JSON.parse(game);
        gameState = JSON.stringify(gameStateObj);
        window.localStorage.setItem(STORAGE_KEY, gameState);
        return gameState;
      }
    }
  };

  return {
    saveGameState,
    loadGameState,
    updateGameState,
  };
};

export default useGameData;
