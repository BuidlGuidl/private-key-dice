import type { NextPage } from "next";
import GameCreationForm from "~~/components/dicedemo/GameCreateForm";
import WelcomeRoll from "~~/components/dicedemo/WelcomeRoll";

const Home: NextPage = () => {
  // const quote = "Every key is a boundless whisper from the unknown and each guess a brushstroke on the infinite canvas of possibility, our journey weaves through the lattice of chance and destiny, illuminating paths in the cosmic dance of uncharted realms, where the thrill of discovery echoes in the heartbeats of the bold, crafting a universe with every daring leap into the silence of the never-before-seen."

  return (
    <>
      <div className="flex flex-col gap-4 w-full max-w-lg mx-auto sm:text-base text-sm ">
        {/* <div className="flex flex-col items-center p-10">
          <p className="text-center italic text-2xl" style={{ color: "#9ffefe" }}>
            {quote}
          </p>
        </div> */}

        <div>
          <div className="mx-auto mt-5  p-6 rounded-md bg-base-100 shadow-2xl flex flex-col">
            <div className="box">
              <WelcomeRoll />
            </div>
            <div className="flex justify-center mt-10"></div>

            <div className=" w-full mx-auto flex ">
              <GameCreationForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
