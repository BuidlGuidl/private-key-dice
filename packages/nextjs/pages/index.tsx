import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import GameCreationForm from "~~/components/GameCreateForm";
import GameJoinForm from "~~/components/GameJoinForm";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  const [gameState, setGameState] = useState("createGame");
  return (
    <>
      <MetaHeader />
      <div className="flex flex-col items-center 2xl:px-40 lg:px-20 px-10">
        <ul className="menu menu-horizontal bg-base-300 rounded-box activemenu m-10">
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
    </>
  );
};

export default Home;
