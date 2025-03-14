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
    const pk = localStorage.getItem("burnerWallet.pk");
    const wallet = privateKeyToAccount(pk as Hex);

    console.log(wallet.address, selectedAddress);

    if (wallet.address !== selectedAddress) {
      display = (
        <div>
          <b>*injected account*, private key unknown</b>
        </div>
      );
    } else {
      const extraPkDisplayAdded: {
        [key: string]: boolean;
      } = {};
      const extraPkDisplay = [];
      extraPkDisplayAdded[wallet.address] = true;
      extraPkDisplay.push(
        <div className="my-2" key={wallet.address}>
          <span>
            <Address address={wallet.address} />
          </span>
        </div>,
      );
      for (const key in localStorage) {
        if (key.indexOf("burnerWallet.pk_backup") >= 0) {
          const pastpk = localStorage.getItem(key);
          const pastwallet = privateKeyToAccount(pastpk as Hex);
          if (!extraPkDisplayAdded[pastwallet.address] /* && selectedAddress!=pastwallet.address */) {
            extraPkDisplayAdded[pastwallet.address] = true;
            extraPkDisplay.push(
              <div className="mb-2" key={pastwallet.address}>
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

      const fullLink = "https://punkwallet.io/pk#" + pk;

      display = (
        <div className="mt-3">
          <div>
            <b>Private Key:</b>
            <div className="flex items-center">
              <span className="overflow-hidden overflow-ellipsis w-11/12 text-xs font-semibold">{pk}</span>
              {pkCopied ? (
                <CheckCircleIcon
                  className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                  aria-hidden="true"
                />
              ) : (
                <CopyToClipboard
                  text={pk || ""}
                  onCopy={() => {
                    setPkCopied(true);
                    setTimeout(() => {
                      setPkCopied(false);
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

            <div className="text-clip">
              <div>
                <b>Punk Wallet:</b>
              </div>
              <div className="flex items-center">
                <span className="overflow-hidden overflow-ellipsis w-11/12 text-xs font-semibold">{fullLink}</span>
                {punkLinkCopied ? (
                  <CheckCircleIcon
                    className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                    aria-hidden="true"
                  />
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
                    <DocumentDuplicateIcon
                      className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                      aria-hidden="true"
                    />
                  </CopyToClipboard>
                )}
              </div>
            </div>

            <br />
            <i>
              Point your phone camera at qr code to open in &nbsp;
              <a target="_blank" href={fullLink} rel="noopener noreferrer" className="underline text-blue-500">
                Punk Wallet
              </a>
              :
            </i>

            <div
              style={{ cursor: "pointer" }}
              onClick={() => {
                const el = document.createElement("textarea");
                el.value = fullLink;
                document.body.appendChild(el);
                el.select();
                document.execCommand("copy");
                document.body.removeChild(el);
              }}
            >
              <QRCodeSVG value={fullLink} className="h-full mx-auto mt-2 w-3/4" level="H" />
            </div>
          </div>

          {extraPkDisplay ? (
            <div className="mt-6">
              <h2>Known Private Keys:</h2>
              {extraPkDisplay}
            </div>
          ) : (
            ""
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
