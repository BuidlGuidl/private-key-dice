"use client";

import React, { useState, useEffect } from "react";
import { Address, AddressInput, Balance, EtherInput } from "./scaffold-eth";
import { QRCodeSVG } from "qrcode.react";
import CopyToClipboard from "react-copy-to-clipboard";
import { createWalletClient, http, parseEther } from "viem";
import { Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { useAccount } from "wagmi";
import {
  CheckCircleIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  PaperAirplaneIcon,
  QrCodeIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { loadBurnerSK } from "~~/hooks/scaffold-eth/useBurnerWallet";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const getOrCreateBurnerWallet = () => {
  const existingKey = loadBurnerSK();

  if (existingKey === "0x" || existingKey.length < 66) {
    const newPrivateKey = generatePrivateKey();
    if (typeof window !== "undefined") {
      window.localStorage.setItem("burnerWallet.pk", newPrivateKey);
    }
    return newPrivateKey as `0x${string}`;
  }

  return existingKey as `0x${string}`;
};

export default function Wallet() {
  const [account, setAccount] = useState<ReturnType<typeof privateKeyToAccount> | null>(null);

  useEffect(() => {
    const sk = getOrCreateBurnerWallet();
    setAccount(privateKeyToAccount(sk));
  }, []);

  const { targetNetwork } = useTargetNetwork();

  const selectedAddress = account?.address;

  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState("");
  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [pk, setPK] = useState<Hex | string>("");
  const [pkCopied, setPkCopied] = useState(false);
  const [punkLinkCopied, setPunkLinkCopied] = useState(false);
  const [showPk, setShowPk] = useState(false);

  const walletClient = createWalletClient({
    chain: targetNetwork,
    transport: http(),
  });

  const { connector } = useAccount();

  const transferTx = useTransactor(walletClient);

  const providerSend = (
    <button
      onClick={() => {
        setOpen(!open);
      }}
      className="btn btn-secondary ml-1.5 btn-sm px-2 rounded-full"
    >
      <WalletIcon className="h-4 w-4" />
    </button>
  );

  if (!account) {
    return null;
  }

  let display;
  if (qr != "") {
    display = (
      <div className="my-6">
        <QRCodeSVG value={selectedAddress as string} className="h-full mx-auto mt-2 w-3/4" level="H" />
      </div>
    );
  } else if (pk != "") {
    const storedPk = typeof window !== "undefined" ? localStorage.getItem("burnerWallet.pk") : null;
    const wallet = storedPk ? privateKeyToAccount(storedPk as Hex) : null;

    if (!wallet || wallet.address !== selectedAddress) {
      display = (
        <div className="mt-4 rounded-2xl bg-base-200/80 px-4 py-3 text-sm">
          <p className="font-semibold text-base-content/80">Private key not available</p>
          <p className="mt-1 text-xs text-base-content/60">
            The connected account does not match the local burner key, so its private key can&apos;t be shown here.
          </p>
        </div>
      );
    } else {
      const extraPkDisplayAdded: {
        [key: string]: boolean;
      } = {};
      const extraPkDisplay: JSX.Element[] = [];
      extraPkDisplayAdded[wallet.address] = true;
      extraPkDisplay.push(
        <div className="my-1" key={wallet.address}>
          <span className="text-xs text-base-content/70">Current burner</span>
          <div>
            <Address address={wallet.address} />
          </div>
        </div>,
      );
      for (const key in localStorage) {
        if (key.indexOf("burnerWallet.pk_backup") >= 0) {
          const pastpk = localStorage.getItem(key);
          const pastwallet = privateKeyToAccount(pastpk as Hex);
          if (!extraPkDisplayAdded[pastwallet.address]) {
            extraPkDisplayAdded[pastwallet.address] = true;
            extraPkDisplay.push(
              <div className="mb-1" key={pastwallet.address}>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    const currentPrivateKey = window.localStorage.getItem("burnerWallet.pk");
                    if (currentPrivateKey) {
                      window.localStorage.setItem("burnerWallet.pk_backup" + Date.now(), currentPrivateKey);
                    }
                    window.localStorage.setItem("burnerWallet.pk", pastpk as string);
                    window.location.reload();
                  }}
                >
                  <Address disableAddressLink={true} address={pastwallet.address} />
                </span>
              </div>,
            );
          }
        }
      }

      const fullLink = storedPk ? "https://punkwallet.io/pk#" + storedPk : "";
      const maskedPk =
        storedPk && storedPk.length > 10
          ? `${storedPk.slice(0, 8)} • • • • • • • • • • • • ${storedPk.slice(-4)}`
          : storedPk;

      display = (
        <div className="mt-3 space-y-5">
          {/* Security warning */}
          <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="leading-snug">
              This is your burner wallet&apos;s private key. Anyone with this key can control these funds. Only reveal
              and copy it if you fully understand the risk.
            </p>
          </div>

          {/* Private key card */}
          <div className="space-y-2 rounded-2xl bg-base-200/80 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/60">
                Private key
              </span>
              <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={() => setShowPk(v => !v)}>
                {showPk ? <EyeSlashIcon className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
                <span className="text-[11px] font-medium">{showPk ? "Hide" : "Reveal"}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-base-100/90 px-3 py-2">
              <span className="w-full overflow-hidden break-all font-mono text-[11px]">
                {showPk ? storedPk : maskedPk}
              </span>
              {pkCopied ? (
                <CheckCircleIcon className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <CopyToClipboard
                  text={storedPk || ""}
                  onCopy={() => {
                    setPkCopied(true);
                    setTimeout(() => {
                      setPkCopied(false);
                    }, 800);
                  }}
                >
                  <button type="button" className="btn btn-ghost btn-xs px-1">
                    <DocumentDuplicateIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                  </button>
                </CopyToClipboard>
              )}
            </div>
          </div>

          {/* Punk Wallet card */}
          {fullLink && (
            <div className="space-y-3 rounded-2xl bg-base-200/80 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/60">
                  Punk Wallet link
                </span>
                {punkLinkCopied ? (
                  <CheckCircleIcon className="h-4 w-4 text-success" aria-hidden="true" />
                ) : (
                  <CopyToClipboard
                    text={fullLink}
                    onCopy={() => {
                      setPunkLinkCopied(true);
                      setTimeout(() => {
                        setPunkLinkCopied(false);
                      }, 800);
                    }}
                  >
                    <button type="button" className="btn btn-ghost btn-xs px-1">
                      <DocumentDuplicateIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                    </button>
                  </CopyToClipboard>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  target="_blank"
                  href={fullLink}
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-xs md:btn-sm normal-case"
                >
                  Open in Punk Wallet
                </a>
                <span className="text-[11px] text-base-content/60">Or scan the QR code below from your phone.</span>
              </div>
              <div
                className="cursor-pointer pt-1"
                onClick={() => {
                  const el = document.createElement("textarea");
                  el.value = fullLink;
                  document.body.appendChild(el);
                  el.select();
                  document.execCommand("copy");
                  document.body.removeChild(el);
                }}
              >
                <QRCodeSVG value={fullLink} className="mx-auto mt-1 h-full w-3/4" level="H" />
              </div>
            </div>
          )}

          {extraPkDisplay && extraPkDisplay.length > 0 && (
            <div className="mt-4 space-y-2 rounded-2xl bg-base-200/80 px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/60">
                Known burner keys
              </h2>
              <p className="text-[11px] text-base-content/60">
                Click an address below to switch this browser&apos;s burner wallet to that key.
              </p>
              <div className="space-y-1">{extraPkDisplay}</div>
            </div>
          )}
        </div>
      );
    }
  } else {
    display = (
      <div>
        <div className="mt-3">
          <AddressInput placeholder="to address" value={toAddress} onChange={setToAddress} />
        </div>
        <div className="mt-3 mb-6">
          <EtherInput
            value={amount}
            onChange={value => {
              setAmount(value);
            }}
          />
        </div>
      </div>
    );
  }

  if (connector?.name != "Burner Wallet") {
    return null;
  }

  return (
    <span>
      {providerSend}
      {open && (
        <div className=" overflow-hidden w-fit  h-full">
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20 md:text-base text-[0.8rem]">
            <div className="modal-box overflow-x-hidden">
              <label
                onClick={() => {
                  setQr("");
                  setPK("");
                  setOpen(!open);
                }}
                className="btn btn-sm btn-circle absolute right-2 top-2"
              >
                ✕
              </label>
              <div className="flex ">
                <Address address={selectedAddress} />
                <Balance className="text-xl " address={selectedAddress} />
              </div>
              {display}

              <div className="grid md:grid-cols-4 grid-cols-2 gap-2 mt-4">
                <button
                  className="btn btn-primary md:btn-sm btn-xs "
                  onClick={() => {
                    const currentPrivateKey = window.localStorage.getItem("burnerWallet.pk");
                    if (currentPrivateKey) {
                      window.localStorage.setItem("burnerWallet.pk_backup" + Date.now(), currentPrivateKey);
                    }
                    const privateKey = generatePrivateKey();
                    window.localStorage.setItem("burnerWallet.pk", privateKey);
                    window.location.reload();
                  }}
                >
                  Generate
                </button>
                <button
                  className="btn btn-primary md:btn-sm  btn-xs "
                  onClick={() => {
                    pk == "" && selectedAddress ? setPK(selectedAddress) : setPK("");
                    setQr("");
                  }}
                >
                  <KeyIcon className="w-4 h-4" />
                  {pk == "" ? "Key" : "Hide"}
                </button>
                <button
                  className="btn btn-primary md:btn-sm btn-xs"
                  onClick={() => {
                    qr == "" && selectedAddress ? setQr(selectedAddress) : setQr("");
                    setPK("");
                  }}
                >
                  <QrCodeIcon className="w-4 h-4" />
                  {qr == "" ? "Receive" : "Hide"}
                </button>
                <button
                  className="btn btn-primary md:btn-sm btn-xs"
                  key="submit"
                  disabled={!amount || !toAddress || pk != "" || qr != ""}
                  onClick={() => {
                    let value;
                    try {
                      value = parseEther("" + amount);
                    } catch (e) {
                      value = parseEther("" + parseFloat(amount).toFixed(8));
                    }
                    transferTx({
                      account: account,
                      to: toAddress,
                      value,
                      gas: BigInt("31500"),
                    });
                    setOpen(!open);
                    setQr("");
                  }}
                >
                  <PaperAirplaneIcon className="w-4 h-4" /> Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
