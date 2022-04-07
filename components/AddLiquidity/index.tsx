import * as tyron from "tyron";
import * as zcrypto from "@zilliqa-js/crypto";
import * as zutil from "@zilliqa-js/util";
import { useStore } from "effector-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { randomBytes, toChecksumAddress } from "@zilliqa-js/crypto";
import { useDispatch } from "react-redux";
import { HTTPProvider } from "@zilliqa-js/core";
import { Transaction } from "@zilliqa-js/account";
import { BN, Long } from "@zilliqa-js/util";
import { $contract } from "../../src/store/contract";
import { $arconnect } from "../../src/store/arconnect";
import { ZilPayBase } from "../ZilPay/zilpay-base";
import styles from "./styles.module.scss";
import { Donate } from "..";
import { $donation, updateDonation } from "../../src/store/donation";
import { $net } from "../../src/store/wallet-network";
import { $doc } from "../../src/store/did-doc";
import { decryptKey } from "../../src/lib/dkms";
import { AddLiquidity, HashDexOrder } from "../../src/lib/util";
import {
  setTxStatusLoading,
  showTxStatusModal,
  setTxId,
  hideTxStatusModal,
} from "../../src/app/actions";

function Component() {
  const dispatch = useDispatch();
  const arConnect = useStore($arconnect);
  const contract = useStore($contract);
  const dkms = useStore($doc)?.dkms;
  const net = useStore($net);
  const donation = useStore($donation);

  const [currency, setCurrency] = useState("");
  const [input, setInput] = useState(0); //the amount to add into the pool
  const [legend, setLegend] = useState("continue");
  const [button, setButton] = useState("button primary");
  const [hideDonation, setHideDonation] = useState(true);
  const [hideSubmit, setHideSubmit] = useState(true);

  const handleOnChange = (event: { target: { value: any } }) => {
    setCurrency(event.target.value);
  };

  const handleInput = (event: { target: { value: any } }) => {
    setInput(0);
    setHideSubmit(true);
    setLegend("continue");
    setButton("button primary");
    let input = event.target.value;
    const re = /,/gi;
    input = input.replace(re, ".");
    input = Number(input);
    if (!isNaN(input)) {
      setInput(input);
    }
  };
  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleSave();
    }
  };
  const handleSave = async () => {
    if (input !== 0) {
      setLegend("saved");
      setButton("button");
      setHideDonation(false);
      setHideSubmit(false);
    }
  };

  const handleSubmit = async () => {
    if (arConnect !== null && contract !== null && donation !== null) {
      if (dkms.get("dex")) {
        const encrypted_key = dkms.get("dex"); //@todo-hand-checked if not, throw err
        const did_private_key = await decryptKey(arConnect, encrypted_key);
        const did_public_key = zcrypto.getPubKeyFromPrivateKey(did_private_key);

        const elements = Array();
        const txID = "AddLiquidity";
        elements.push(txID);

        const zilpay = new ZilPayBase();
        const txnumber = (await zilpay.getState(contract.addr)).tx_number;
        const txnumber_bn = new zutil.BN(txnumber);
        const uint_txnumber = Uint8Array.from(
          txnumber_bn.toArrayLike(Buffer, undefined, 16)
        );
        elements.push(uint_txnumber);

        const currency_ = currency.toLowerCase();
        elements.push(currency_);
        elements.push(currency_);

        const amount = input * 1e12;
        const amount_bn = new zutil.BN(amount);
        const uint_amt = Uint8Array.from(
          amount_bn.toArrayLike(Buffer, undefined, 16)
        );

        elements.push(uint_amt);
        elements.push(uint_amt);
        elements.push(uint_amt);

        const donation_ = donation * 1e12;
        const donation_bn = new zutil.BN(txnumber);
        const uint_donation = Uint8Array.from(
          donation_bn.toArrayLike(Buffer, undefined, 16)
        );

        elements.push(uint_donation);

        const hash = (await HashDexOrder(elements)) as string;

        const signature = zcrypto.sign(
          Buffer.from(hash, "hex"),
          did_private_key,
          did_public_key
        );

        let tyron_;
        switch (donation) {
          case 0:
            tyron_ = await tyron.TyronZil.default.OptionParam(
              tyron.TyronZil.Option.none,
              "Uint128"
            );
            break;
          default:
            tyron_ = await tyron.TyronZil.default.OptionParam(
              tyron.TyronZil.Option.some,
              "Uint128",
              donation_
            );
            break;
        }
        const tx_params = await AddLiquidity(
          await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.some,
            "ByStr64",
            "0x" + signature
          ),
          currency_,
          String(amount),
          tyron_
        );

        toast.info(
          `You're about to submit a transaction to add liquidity on ${currency}. You're also donating ${donation} ZIL to donate.did, which gives you ${donation} xPoints!`,
          {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          }
        );

        const _amount = String(donation);

        dispatch(setTxStatusLoading("true"));
        dispatch(showTxStatusModal());
        const generateChecksumAddress = () =>
          toChecksumAddress(randomBytes(20));
        let tx = new Transaction(
          {
            version: 0,
            toAddr: generateChecksumAddress(),
            amount: new BN(0),
            gasPrice: new BN(1000),
            gasLimit: Long.fromNumber(1000),
          },
          new HTTPProvider("https://dev-api.zilliqa.com/")
        );
        await zilpay
          .call({
            contractAddress: contract.addr,
            transition: txID,
            params: tx_params as unknown as Record<string, unknown>[],
            amount: _amount,
          })
          .then(async (res) => {
            dispatch(setTxId(res.ID));
            dispatch(setTxStatusLoading("submitted"));
            try {
              tx = await tx.confirm(res.ID);
              if (tx.isConfirmed()) {
                dispatch(setTxStatusLoading("confirmed"));
                updateDonation(null);
                window.open(
                  `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                );
              } else if (tx.isRejected()) {
                dispatch(hideTxStatusModal());
                dispatch(setTxStatusLoading("idle"));
                setTimeout(() => {
                  toast.error("Transaction failed.", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                  });
                }, 1000);
              }
            } catch (err) {
              dispatch(hideTxStatusModal());
              throw err;
            }
          });
      } else {
        toast.error("Could not fetch dex.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    }
  };

  return (
    <>
      <div className={styles.container2}>
        <select style={{ width: "30%" }} onChange={handleOnChange}>
          <option value="">Select coin</option>
          <option value="TYRON">TYRON</option>
          <option value="zWBTC">BTC</option>
          <option value="zETH">ETH</option>
          <option value="zUSDT">USD</option>
        </select>
        {currency !== "" && (
          <>
            <code>{currency}</code>
            <input
              style={{ width: "30%" }}
              type="text"
              placeholder="Type amount"
              onChange={handleInput}
              onKeyPress={handleOnKeyPress}
              autoFocus
            />
            <input
              style={{ marginLeft: "2%" }}
              type="button"
              className={button}
              value={legend}
              onClick={() => {
                handleSave();
              }}
            />
          </>
        )}
      </div>
      {!hideDonation && <Donate />}
      {!hideSubmit && donation !== null && (
        <div style={{ marginTop: "6%" }}>
          <button className={styles.button} onClick={handleSubmit}>
            <span className={styles.x}>add liquidity</span>
          </button>
        </div>
      )}
    </>
  );
}

export default Component;
