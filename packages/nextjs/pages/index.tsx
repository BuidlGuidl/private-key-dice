import { useState } from "react";
import type { NextPage } from "next";
import GameCreationForm from "~~/components/GameCreateForm";
import GameJoinForm from "~~/components/GameJoinForm";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  const [gameState, setGameState] = useState("createGame");
  return (
    <>
      <MetaHeader />
      <div className="flex mt-5 flex-col gap-4 xs:w-4/5 xl:w-[50%] w-11/12 mx-auto">
        <div className="md:grid md:grid-cols-2 md:gap-2 mt-5">
          <div className="mb-10 p-4">
            <div className="px-6 py-10 rounded-xl shadow-xl font-semibold">
              <p>
                Welcome to &ldquo;Crypto Dice Hunt&rdquo; - a crypto treasure hunt where you will race against others,
                rolling dices, to beat the security of private keys.
              </p>
              <br />
              <p>
                A user starts by creating a game, selecting the characters to be concealed in the private key. Upto 30
                daring warriors can join the quest for glory.
              </p>
              <br />
              <p>
                Your objective as a player? Decode these hidden characters and seize the crypto riches concealed within
                the wallet before your opponent does.
              </p>
              Are you ready to roll and race to wealth? Roll the dice, solve the puzzles, and claim the jackpot!!!
            </div>
          </div>
          <div className="mx-auto w-4/5">
            <ul className="menu menu-horizontal menu-sm bg-base-300 rounded-box activemenu mb-8">
              <li onClick={() => setGameState("createGame")}>
                <a className={gameState == "createGame" ? "active" : ""}>Create Game</a>
              </li>
              <li onClick={() => setGameState("joinGame")}>
                <a className={gameState == "joinGame" ? "active" : ""}>Join Game</a>
              </li>
            </ul>
            {gameState == "createGame" && <GameCreationForm />}
            {gameState == "joinGame" && <GameJoinForm />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
