import type { NextPage } from "next";
import GameCreationForm from "~~/components/dicedemo/GameCreateForm";
import WelcomeRoll from "~~/components/dicedemo/WelcomeRoll";

const Home: NextPage = () => {
  // const quote = "Every key is a boundless whisper from the unknown and each guess a brushstroke on the infinite canvas of possibility, our journey weaves through the lattice of chance and destiny, illuminating paths in the cosmic dance of uncharted realms, where the thrill of discovery echoes in the heartbeats of the bold, crafting a universe with every daring leap into the silence of the never-before-seen."

  return (
    <main className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-primary/30 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/25 blur-3xl animate-float" />
        <div className="absolute inset-x-10 top-1/3 h-40 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 blur-2xl" />
      </div>

      <div className="w-full max-w-4xl mx-auto sm:text-base text-sm">
        <div className="mx-auto mt-4 rounded-3xl bg-base-100/80 border border-primary/30 shadow-glow-primary backdrop-blur-xl p-6 md:p-10">
          <div className="mb-6 text-center space-y-2 md:space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-1 text-xs md:text-sm uppercase tracking-[0.2em] text-secondary-content/80">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" />
              Multiplayer crypto puzzle
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-300 bg-clip-text text-transparent">
                Private Key Dice
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm md:text-base text-base-content/70">
              Race your friends to guess the hidden characters of a private key. Each roll reveals the odds, and only one hacker
              drains the prize wallet.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
            <div className="order-2 md:order-1">
              <div className="rounded-2xl bg-secondary/60 border border-secondary/40 p-4 md:p-5 shadow-center">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="text-base md:text-lg font-semibold text-secondary-content">Host a new game</h2>
                  <span className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-secondary-content/60">
                    Choose difficulty · hide chars · invite players
                  </span>
                </div>
                <GameCreationForm />
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="rounded-2xl bg-secondary/60 border border-primary/40 shadow-glow-accent p-3 md:p-4 animate-tilt-slow">
                <WelcomeRoll />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
