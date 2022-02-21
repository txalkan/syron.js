import React, { useState } from "react";
import { useStore } from "effector-react";
import * as tyron from "tyron";
import * as zcrypto from "@zilliqa-js/crypto";
import { toast } from "react-toastify";
import { $donation, updateDonation } from "../../../../src/store/donation";
import styles from "./styles.module.scss";
import { $net } from "../../../../src/store/wallet-network";
import { $contract } from "../../../../src/store/contract";
import { TyronDonate } from "../../..";
import { ZilPayBase } from "../../../ZilPay/zilpay-base";
import { $doc } from "../../../../src/store/did-doc";
import { $user } from "../../../../src/store/user";

function Component() {
  const user = useStore($user);
  const _guardians = useStore($doc)?.guardians.length as number;

  let min_guardians = parseInt(String(_guardians / 2 + 1));
  if (min_guardians < 3) {
    min_guardians = 3;
  }
  const contract = useStore($contract);
  const donation = useStore($donation);
  const net = useStore($net);

  const [error, setError] = useState("");
  const input_ = Array(min_guardians);
  const select_input = Array();
  for (let i = 0; i < input_.length; i += 1) {
    select_input[i] = i;
  }
  const guardians_: string[][] = [];
  const [guardians, setGuardians] = useState(guardians_);

  const empty_tx_value = [
    {
      argtypes: ["String", "ByStr64"],
      arguments: ["", ""],
      constructor: "Pair",
    },
  ];
  const [txvalue, setTxValue] = useState(empty_tx_value);

  const [legendB, setLegendB] = useState("continue");
  const [buttonB, setButtonB] = useState("button primary");

  const [hideDonation, setHideDonation] = useState(true);
  const [hideSubmit, setHideSubmit] = useState(true);
  const [txID, setTxID] = useState("");

  const [input, setInput] = useState(""); //the new address
  const [legend, setLegend] = useState("Save");
  const [button, setButton] = useState("button primary");

  const handleInput = (event: { target: { value: any } }) => {
    setError("");
    setInput("");
    setLegend("save");
    setButton("button primary");
    let value = event.target.value;
    try {
      value = zcrypto.fromBech32Address(value);
      setInput(value);
    } catch (error) {
      try {
        value = zcrypto.toChecksumAddress(value);
        setInput(value);
      } catch {
        setError("wrong address.");
      }
    }
  };
  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleSave();
    }
  };
  const handleSave = async () => {
    if (input !== "") {
      setLegend("saved");
      setButton("button");
    }
  };

  const handleReset = async () => {
    setError("");
    setButtonB("button primary");
    setLegendB("continue");
    setHideDonation(true);
    setHideSubmit(true);
  };
  const handleContinue = async () => {
    setError("");
    const signatures: any[] = [];
    if (guardians.length !== 0) {
      for (let i = 0; i < guardians.length; i += 1) {
        const this_input = guardians[i];
        if (this_input[0] !== "" && this_input[1] !== "") {
          signatures.push({
            argtypes: ["String", "ByStr64"],
            arguments: [`${this_input[0]}`, `${this_input[1]}`],
            constructor: "Pair",
          });
        }
      }
    }
    if (signatures.length !== min_guardians) {
      setError("the input is incomplete.");
    } else {
      setTxValue(signatures);
      setButtonB("button");
      setLegendB("saved");
      setHideDonation(false);
      setHideSubmit(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (contract !== null && donation !== null) {
      const zilpay = new ZilPayBase();
      const txID = "SocialRecovery";
      let tyron_;
      const donation_ = String(donation * 1e12);
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

      const params = Array();
      const _addr: tyron.TyronZil.TransitionParams = {
        vname: "addr",
        type: "ByStr20",
        value: input,
      };
      params.push(_addr);
      const _guardians: tyron.TyronZil.TransitionParams = {
        vname: "signatures",
        type: "List( Pair String ByStr64 )",
        value: txvalue,
      };
      params.push(_guardians);
      const _tyron: tyron.TyronZil.TransitionParams = {
        vname: "tyron",
        type: "Option Uint128",
        value: tyron_,
      };
      params.push(_tyron);

      //const tx_params: tyron.TyronZil.TransitionValue[] = [tyron_];
      const _amount = String(donation);

      toast.info(`You're about to submit a transaction to execute social recovery. You're also donating ${donation} ZIL to donate.did, which gives you ${donation} xPoints!`, {
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
          params: params as unknown as Record<string, unknown>[],
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
    <div style={{ marginTop: "14%" }}>
      {txID === "" && (
        <>
          <h3 style={{ marginBottom: "7%", color: "lightblue" }}>
            recover account
          </h3>
          <section className={styles.container}>
            <code>
              <ul>
                <li>
                  Update {user?.name}&apos;s DID Controller address with the
                  help of their guardians.
                </li>
              </ul>
            </code>
            <div className={styles.containerInput}>
              <input
                type="text"
                placeholder="Type new address"
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
            </div>
          </section>
          {input !== "" && legend === "saved" && (
            <>
              <p style={{ marginTop: "7%" }}>
                You need {min_guardians} guardian signatures:
              </p>
              {select_input.map((res: number) => {
                return (
                  <section key={res} className={styles.containerX}>
                    <input
                      style={{ width: "40%" }}
                      type="text"
                      placeholder="Guardian's NFT Username"
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        handleReset();
                        const value = event.target.value;
                        if (guardians[res] === undefined) {
                          guardians[res] = ["", ""];
                        }
                        guardians[res][0] = value.toLowerCase();
                        setGuardians(guardians);
                      }}
                    />
                    <input
                      style={{ width: "80%" }}
                      type="text"
                      placeholder="Paste guardian's signature"
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        handleReset();
                        const value = event.target.value;
                        if (guardians[res] === undefined) {
                          guardians[res] = ["", ""];
                        }
                        guardians[res][1] = value.toLowerCase();
                        setGuardians(guardians);
                      }}
                    />
                  </section>
                );
              })}
              {
                <input
                  type="button"
                  className={buttonB}
                  value={legendB}
                  onClick={() => {
                    handleContinue();
                  }}
                />
              }
            </>
          )}
          {!hideDonation && <TyronDonate />}
          {!hideSubmit && donation !== null && txvalue !== empty_tx_value && (
            <div style={{ marginTop: "10%" }}>
              <button className={styles.button} onClick={handleSubmit}>
                Execute <span className={styles.x}>did social recovery</span>
              </button>
              <p className={styles.gascost}>Gas: around 1.5 ZIL</p>
            </div>
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
            {txID.substr(0, 11)}...
          </a>
        </code>
      )}
      {error !== "" && <p className={styles.error}>Error: {error}</p>}
    </div>
  );
}

export default Component;
