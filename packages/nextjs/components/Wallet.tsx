import React, { useState } from "react";
import { Address, AddressInput, Balance, EtherInput } from "./scaffold-eth";
import QR from "qrcode.react";
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
import { loadBurnerSK } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

export default function Wallet() {
  const account = privateKeyToAccount(loadBurnerSK());
  const configuredNetwork = getTargetNetwork();

  const selectedAddress = account?.address;

  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState("");
  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [pk, setPK] = useState<Hex | string>("");
  const [pkCopied, setPkCopied] = useState(false);
  const [punkLinkCopied, setPunkLinkCopied] = useState(false);

  const walletClient = createWalletClient({
    chain: configuredNetwork,
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

  let display;
  if (qr != "") {
    display = (
      <div className="my-6">
        <QR
          value={selectedAddress as string}
          className="w-full h-full mt-4"
          level="H"
          renderAs="svg"
          imageSettings={{
            src: "",
            height: 0,
            width: 0,
            excavate: false,
          }}
        />
      </div>
    );
  } else if (pk != "") {
    const pk = localStorage.getItem("scaffoldEth2.burnerWallet.sk");
    const wallet = privateKeyToAccount(pk as Hex);

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
        <div className="my-2">
          <a href={"/pk#" + pk}>
            <Address address={wallet.address} />
          </a>
        </div>,
      );
      for (const key in localStorage) {
        if (key.indexOf("scaffoldEth2.burnerWallet.sk_backup") >= 0) {
          const pastpk = localStorage.getItem(key);
          const pastwallet = privateKeyToAccount(pastpk as Hex);
          if (!extraPkDisplayAdded[pastwallet.address] /* && selectedAddress!=pastwallet.address */) {
            extraPkDisplayAdded[pastwallet.address] = true;
            extraPkDisplay.push(
              <div className="mb-2">
                <a href={"/pk#" + pastpk}>
                  <Address address={pastwallet.address} />
                </a>
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
              Point your camera phone at qr code to open in &nbsp;
              <a target="_blank" href={fullLink} rel="noopener noreferrer">
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
              <QR value={fullLink} className="w-full mt-4 h-full " level="H" renderAs="svg" />
            </div>
          </div>

          {extraPkDisplay ? (
            <div className="mt-6">
              <h2>Known Private Keys:</h2>
              {extraPkDisplay}
              <button
                className="btn btn-primary btn-sm my-2"
                onClick={() => {
                  const currentPrivateKey = window.localStorage.getItem("scaffoldEth2.burnerWallet.sk");
                  if (currentPrivateKey) {
                    window.localStorage.setItem("scaffoldEth2.burnerWallet.sk_backup" + Date.now(), currentPrivateKey);
                  }
                  const privateKey = generatePrivateKey();
                  window.localStorage.setItem("scaffoldEth2.burnerWallet.sk", privateKey);
                  window.location.reload();
                }}
              >
                Generate
              </button>
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

              <div className="flex justify-end gap-2 ">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    pk == "" && selectedAddress ? setPK(selectedAddress) : setPK("");
                    setQr("");
                  }}
                >
                  <KeyIcon className="w-4 h-4" />
                  {pk == "" ? "Private Key" : "Hide"}
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    qr == "" && selectedAddress ? setQr(selectedAddress) : setQr("");
                    setPK("");
                  }}
                >
                  <QrCodeIcon className="w-4 h-4" />
                  {qr == "" ? "Receive" : "Hide"}
                </button>
                <button
                  className="btn btn-primary btn-sm"
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
                      chain: configuredNetwork,
                      // gas: BigInt("21000"),
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
