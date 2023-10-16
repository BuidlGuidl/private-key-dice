// pages/game/[id].js
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import Congrats from "~~/components/Congrats";
import { loadGameState, updateGameState } from "~~/utils/diceDemo/game";

function GamePage() {
  const router = useRouter();
  const { id } = router.query;

  const { token, game: gameState } = loadGameState();
  const { address } = useAccount();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rolled, setRolled] = useState(false);
  const [rolledResult, setRolledResult] = useState<string[]>([]);
  const [game, setGame] = useState(gameState);
  const [isOpen, setIsOpen] = useState(true);
  const congratulatoryMessage = "Congratulations! You won the game!";

  const calculateLength = () => {
    const maxLength = 300;
    const calculatedLength = Math.max(maxLength - (game?.diceCount - 1) * 3.8, 10);

    return calculatedLength;
  };

  // const isAdmin = address == game?.adminAddress;
  const isPlayer = game?.players?.includes(address);

  const generateRandomHex = () => {
    const hexDigits = "0123456789abcdef";
    const randomIndex = Math.floor(Math.random() * hexDigits.length);
    return hexDigits[randomIndex];
  };

  const rollTheDice = () => {
    // setRolled(false);
    setIsRolling(true);

    const rolls = [];
    for (let index = 0; index < game.diceCount; index++) {
      rolls.push(generateRandomHex());
    }
    setRolledResult(rolls);
    setIsRolling(false);
    if (!rolled) {
      setRolled(true);
    }
  };

  const length = calculateLength();

  const compareResult = () => {
    if (rolled && rolledResult.length > 0)
      return rolledResult.every((value, index) => value === Object.values(game?.hiddenChars)[index]);
  };

  const endGame = async () => {
    const response = await fetch(`http://localhost:4001/game/${game._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ winner: address }),
    });
    const endedGame = await response.json();

    updateGameState(JSON.stringify(endedGame));
    setGame(endedGame);
  };

  useEffect(() => {
    if (videoRef.current && !isRolling) {
      videoRef.current.currentTime = 9999;
    }
  }, [isRolling]);

  useEffect(() => {
    const isHiiddenChars = compareResult();
    if (isHiiddenChars) {
      endGame();
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolledResult]);

  if (!game || game == null || id != game.inviteCode) {
    return <>nuk</>;
  }

  return (
    <div>
      <div className="mt-10 2xl:px-40 lg:px-20 w-screen px-10">
        <div className="w-full  grid lg:grid-cols-4 md:grid-cols-2 gap-3">
          <div className="bg-base-300 p-4 rounded-box drop-shadow-lg">
            <p>Invite Code: {id}</p>
          </div>

          <div className="bg-base-300 p-4 rounded-box drop-shadow-lg">
            <p>Hidden Characters {JSON.stringify(game?.hiddenChars)}</p>
          </div>
          <div className="bg-base-300 p-4 rounded-box drop-shadow-lg">
            <p>DiceCount: {game.diceCount} </p>
            <p>Status: {game.status} </p>
            <p>Mode: {game.mode} </p>
            <p>Prize: {game.prize} ETH </p>
          </div>
          <div className="bg-base-300 p-4 rounded-box drop-shadow-lg overflow-hidden">
            <>Players</>
            {game?.players?.map((user: string) => (
              <p key={user}>{user}</p>
            ))}
          </div>
        </div>
        {isPlayer && (
          <div className="flex flex-col items-center mt-20">
            <button
              className="btn btn-primary px-10"
              onClick={() => {
                rollTheDice();
              }}
              disabled={isRolling || game.status == "finished" || game.mode == "auto"}
            >
              Roll
            </button>

            <div className="flex flex-wrap gap-2">
              {Object.entries(game.hiddenChars).map(([key], index) => (
                <div key={key}>
                  {rolled ? (
                    isRolling ? (
                      <video key="rolling" width={length} height={length} loop src="/rolls/Spin.webm" autoPlay />
                    ) : (
                      <video
                        key="rolled"
                        width={length}
                        height={length}
                        src={`/rolls/${rolledResult[index]}.webm`}
                        autoPlay
                      />
                    )
                  ) : (
                    <video ref={videoRef} key="last" width={length} height={length} src={`/rolls/0.webm`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {game?.winner == address && <Congrats isOpen={isOpen} setIsOpen={setIsOpen} message={congratulatoryMessage} />}
    </div>
  );
}

export default GamePage;
