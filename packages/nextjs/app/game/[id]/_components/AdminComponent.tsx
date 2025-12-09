import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import CopyToClipboard from "react-copy-to-clipboard";
import {
  CheckCircleIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { loadBurnerSK } from "~~/hooks/scaffold-eth/useBurnerWallet";
import { kickPlayer, pauseResumeGame, toggleMode, varyHiddenPrivatekey } from "~~/utils/diceDemo/apiUtils";
import { Game } from "@prisma/client";
import HostAnnouncement from "~~/components/dicedemo/HostAnnouncement";
import RestartWithNewPk from "~~/components/dicedemo/RestartWithNewPk";

interface AdminComponentProps {
  game: Game;
  token: string;
  screenwidth: number;
}

export const AdminComponent = ({ game, token, screenwidth }: AdminComponentProps) => {
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteUrlCopied, setInviteUrlCopied] = useState(false);
  const [hostAnnOpen, setHostAnnOpen] = useState(true);
  const [restartOpen, setRestartOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      setInviteUrl(currentUrl);
    }
  }, []);

  return (
    <div className="flex w-full">
      <div className="md:w-1/3 w-full">
        <div className="py-2">
          <div className="p-2 bg-base-200 mt-2 rounded-md px-4 w-[95%] mx-auto">
            <div className="flex items-center justify-center">
              <span>Copy Invite Url</span>
              {inviteUrlCopied ? (
                <CheckCircleIcon
                  className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                  aria-hidden="true"
                />
              ) : (
                <CopyToClipboard
                  text={inviteUrl?.toString() || ""}
                  onCopy={() => {
                    setInviteUrlCopied(true);
                    setTimeout(() => {
                      setInviteUrlCopied(false);
                    }, 800);
                  }}
                >
                  <DocumentDuplicateIcon
                    className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                    aria-hidden="true"
                  />
                </CopyToClipboard>
              )}
            </div>
            <div>
              <QRCodeSVG value={inviteUrl?.toString() || ""} className="h-full mx-auto mt-2 w-3/4" level="H" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 bg-base-200 mt-2 rounded-md w-[95%] mx-auto px-4 py-2">
            <div className="flex gap-2 justify-center">
              <span>Status: {game.status}</span>
              <input
                id="mode-toggle"
                type="checkbox"
                className="toggle toggle-primary bg-primary tooltip tooltip-bottom tooltip-primary"
                data-tip={game?.status === "ongoing" ? "pause" : game?.status === "paused" ? "resume" : ""}
                onChange={() => pauseResumeGame(game, token)}
                checked={game?.status === "ongoing"}
              />
            </div>
            <div className="flex flex-col gap-2 bg-secondary mt-2 rounded-md w-full px-4 py-2 items-center">
              <span>Mode: {game.mode}</span>
              <div className="flex justify-around w-full flex-wrap gap-1">
                <label className="flex cursor-pointer gap-2">
                  <span>Auto</span>
                  <input
                    type="radio"
                    name="radio-10"
                    className="radio checked:bg-blue-500"
                    checked={game?.mode === "auto"}
                    onChange={() => {
                      if (game?.mode !== "auto") toggleMode(game, "auto", token);
                    }}
                  />
                </label>
                <label className="flex cursor-pointer gap-2">
                  <span>Manual</span>
                  <input
                    type="radio"
                    name="radio-10"
                    className="radio checked:bg-blue-500"
                    checked={game?.mode === "manual"}
                    onChange={() => {
                      if (game?.mode !== "manual") toggleMode(game, "manual", token);
                    }}
                  />
                </label>
                <label className="flex cursor-pointer gap-2">
                  <span>Brute</span>
                  <input
                    type="radio"
                    name="radio-10"
                    className="radio checked:bg-blue-500"
                    checked={game?.mode === "brute"}
                    onChange={() => {
                      if (game?.mode !== "brute") toggleMode(game, "brute", token);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          {screenwidth <= 768 && (
            <div>
              <div className="font-bold mt-3 flex items-center px-4 justify-center">
                <h1 className="tracking-wide">PRIVATE KEY:</h1>
              </div>
              <div className="flex items-center px-2">
                <p className="whitespace-normal break-words blur transition duration-500 ease-in-out hover:blur-none cursor-pointer w-[90%]">
                  {Object.values(game?.hiddenPrivateKey)}
                </p>
                <div>
                  <button
                    className="btn btn-sm btn-ghost tooltip tooltip-left"
                    data-tip="increase"
                    onClick={() => {
                      varyHiddenPrivatekey(game, token, "increase", loadBurnerSK().toString().substring(2));
                    }}
                  >
                    <ChevronDoubleUpIcon className="text-xl font-bold h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    className="btn btn-sm btn-ghost tooltip tooltip-left"
                    data-tip="decrease"
                    onClick={() => {
                      varyHiddenPrivatekey(game, token, "decrease", loadBurnerSK().toString().substring(2));
                    }}
                  >
                    <ChevronDoubleDownIcon className="text-xl font-bold h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {game.winner && (
          <div className="flex gap-2 bg-base-300 rounded-md px-4 mt-2 mb-2 py-2 justify-center w-[95%] mx-auto">
            Winner <Address address={game?.winner} />
          </div>
        )}

        {screenwidth <= 768 && game.players.length > 0 && (
          <div className="md:w-2/3 rounded-xl overflow-hidden mt-5">
            <div className="divider"></div>
            <div>
              <div className="mt-2 px-4">
                <h1 className="font-bold md:text-xl text-lg tracking-wide md:text-left text-center">PLAYERS:</h1>
              </div>
              <div className="p-4 max-h-[30rem] overflow-scroll">
                {game.players.map(player => (
                  <div key={player} className="mb-4 flex justify-between">
                    <Address format="short" address={player} />
                    <button className="btn btn-xs btn-error" onClick={() => kickPlayer(game, token, player)}>
                      kick
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {game.winner && (
          <div>
            <HostAnnouncement game={game} setIsOpen={setHostAnnOpen} isOpen={hostAnnOpen} />
          </div>
        )}

        {game.winner && <RestartWithNewPk isOpen={restartOpen} setIsOpen={setRestartOpen} />}
      </div>
      {screenwidth > 768 && (
        <div className="md:w-2/3">
          <div>
            <div className="font-bold mt-2 flex items-center px-4">
              <h1 className="tracking-wide md:text-xl text-lg md:text-left text-center">PRIVATE KEY</h1>
            </div>
            <div className="flex items-center">
              <p className="whitespace-normal break-words px-2 blur transition duration-500 ease-in-out hover:blur-none text-lg cursor-pointer w-[90%]">
                {Object.values(game?.hiddenPrivateKey)}
              </p>
              <div>
                <button
                  className="btn btn-sm btn-ghost tooltip tooltip-left"
                  data-tip="increase"
                  onClick={() => {
                    varyHiddenPrivatekey(game, token, "increase", loadBurnerSK().toString().substring(2));
                  }}
                >
                  <ChevronDoubleUpIcon className="text-xl font-bold h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  className="btn btn-sm btn-ghost tooltip tooltip-left"
                  data-tip="decrease"
                  onClick={() => {
                    varyHiddenPrivatekey(game, token, "decrease", loadBurnerSK().toString().substring(2));
                  }}
                >
                  <ChevronDoubleDownIcon className="text-xl font-bold h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <>
            <div className="divider"></div>
            <div>
              <div className="py-2 px-4">
                <h1 className="font-bold md:text-xl text-lg tracking-wide md:text-left text-center">
                  PLAYERS: {game?.players.length}
                </h1>
              </div>
              <div className="p-4 overflow-scroll" style={{ maxHeight: "28rem" }}>
                {game?.players?.map((player: string) => (
                  <div key={player} className="mb-4 flex justify-between">
                    <Address format="long" address={player} />
                    <button className="btn btn-xs btn-error" onClick={() => kickPlayer(game, token, player)}>
                      kick
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        </div>
      )}
    </div>
  );
};
