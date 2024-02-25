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

  const quote =
    "Every key is a boundless whisper from the unknown and each guess a brushstroke on the infinite canvas of possibility, our journey weaves through the lattice of chance and destiny, illuminating paths in the cosmic dance of uncharted realms, where the thrill of discovery echoes in the heartbeats of the bold, crafting a universe with every daring leap into the silence of the never-before-seen.";

  return (
    <>
      <MetaHeader />
      <div className="flex flex-col gap-4 xs:w-4/5 xl:w-[50%] w-full mx-auto sm:text-base text-sm">
        <div className="flex flex-col items-center p-10">
          <p className="text-center italic text-2xl" style={{ color: "#9ffefe" }}>
            {quote}
          </p>
        </div>
        <div className="p-4">
          <div className="mb-10 p-4">
            <div className="p-6 font-semibold"></div>
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
