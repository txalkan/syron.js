import React, { useState } from "react";
import { useStore } from "effector-react";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import { $donation, updateDonation } from "../../src/store/donation";
import { Donate } from "..";
import { ZilPayBase } from "../ZilPay/zilpay-base";
import styles from "./styles.module.scss";
import { $net } from "../../src/store/wallet-network";
import { $contract } from "../../src/store/contract";

function Component() {
  const contract = useStore($contract);
  const donation = useStore($donation);
  const net = useStore($net);

  const [error, setError] = useState("");
  const [selection, setSelection] = useState("");
  const [input, setInput] = useState(0); // the amount to transfer
  const [legend, setLegend] = useState("continue");
  const [button, setButton] = useState("button primary");

  const [hideDonation, setHideDonation] = useState(true);
  const [hideSubmit, setHideSubmit] = useState(true);
  const [txID, setTxID] = useState("");

  const handleOnChange = (event: { target: { value: any } }) => {
    setError("");
    setSelection(event.target.value);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(0);
    setHideSubmit(true);
    setLegend("continue");
    setButton("button primary");
    let input = event.target.value;
    const re = /,/gi;
    input = input.replace(re, ".");
    const input_ = Number(input);
    if (!isNaN(input_)) {
      setInput(input_);
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
    if (contract !== null && donation !== null) {
      const zilpay = new ZilPayBase();
      const txID = "ConfigureSocialRecovery";

      let tyron_;
      const donation_ = donation * 1e12;
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

      const tx_params: tyron.TyronZil.TransitionValue[] = [tyron_];
      const _amount = String(donation);

      toast.info(`You're about to submit a transaction to configure social recovery. You're also donating ${donation} ZIL to donate.did, which gives you ${donation} xPoints!`, {
        position: "top-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
      await zilpay
        .call({
          contractAddress: contract.addr,
          transition: txID,
          params: tx_params as unknown as Record<string, unknown>[],
          amount: _amount, //@todo-ux would u like to top up your wallet as well?
        })
        .then((res) => {
          setTxID(res.ID);
          updateDonation(null);
        })
        .catch((err) => setError(err));
    }
  };

  return (
    <div style={{ marginTop: "14%", textAlign: "center" }}>
      <h2 style={{ color: "lightblue", marginBottom: "7%" }}>title</h2>
      {txID === "" && (
        <>
          {
            <>
              <select style={{ width: "30%" }} onChange={handleOnChange}>
                <option value="">Select</option>
                <option value="TYRON">TYRON</option>
              </select>
              <code>{selection}</code>
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
          }
          {!hideDonation && <Donate />}
          {!hideSubmit && donation !== null && (
            <button className={styles.button} onClick={handleSubmit}>
              Configure <span className={styles.x}>did social recovery</span>
            </button>
          )}
        </>
      )}
      {txID !== "" && (
        <code>
          Transaction ID:{" "}
          <a
            href={`https://viewblock.io/zilliqa/tx/${txID}?network=${net}`}
            rel="noreferrer"
            target="_blank"
          >
            {txID.slice(0, 11)}...
          </a>
        </code>
      )}
      {error !== "" && <p className={styles.error}>Error: {error}</p>}
    </div>
  );
}

export default Component;
