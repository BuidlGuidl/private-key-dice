import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import GameCreationForm from "~~/components/dicedemo/GameCreateForm";
import GameJoinForm from "~~/components/dicedemo/GameJoinForm";

const Home: NextPage = () => {
  const router = useRouter();

  const { invite } = router.query;
  const [gameState, setGameState] = useState<"createGame" | "joinGame">("joinGame");
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    if (invite) {
      setGameState("joinGame");
      setInviteCode(invite as string);
    }
  }, [invite]);

  return (
    <>
      <MetaHeader />
      <div className="flex flex-col gap-4 xs:w-4/5 xl:w-[50%] w-full mx-auto sm:text-base text-sm">
        <div className="md:grid md:grid-cols-2 md:gap-2 mt-5">
          <div className="mb-10 p-4">
            <div className="p-6  rounded-xl shadow-xl font-semibold">
              <p>
                Welcome to &ldquo;Crypto Dice Hunt&rdquo; - where you will race against others, rolling dices, to beat
                the security of private keys.
              </p>
              <p>
                A user starts by creating a game, selecting the characters to be concealed in the private key. Upto 30
                opponents can join the quest.
              </p>
              <p>
                Your objective as a player? Decode these hidden characters and seize the prize concealed within the
                wallet before your opponent does.
              </p>
              Are you ready to race to wealth? Roll the dice, hack the private key, and claim the Prize!
            </div>
          </div>

          <div className="mx-auto w-4/5">
            <ul className="menu menu-horizontal justify-center w-fit p-2 bg-base-300 rounded-full mb-8">
              <li onClick={() => setGameState("joinGame")}>
                <a
                  className={
                    gameState == "joinGame"
                      ? "bg-accent px-3 rounded-full py-1 cursor-pointer "
                      : "px-3 rounded-full py-1 cursor-pointer hover:bg-base-100"
                  }
                >
                  Join Game
                </a>
              </li>
              <li onClick={() => setGameState("createGame")}>
                <a
                  className={
                    gameState == "createGame"
                      ? "bg-accent px-3 rounded-full py-1 cursor-pointer  transition ease-in-out delay-150"
                      : "px-3 rounded-full py-1 cursor-pointer hover:bg-base-100"
                  }
                >
                  Start Game
                </a>
              </li>
            </ul>
            {gameState == "createGame" && <GameCreationForm />}
            {gameState == "joinGame" && <GameJoinForm inviteCode={inviteCode} setInviteCode={setInviteCode} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
