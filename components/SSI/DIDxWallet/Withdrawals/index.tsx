import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { useRouter } from "next/router";
import React, { useState, useCallback } from "react";
import { $net } from "../../../../src/store/wallet-network";
import { Headline, Donate } from "../../..";
import * as zcrypto from "@zilliqa-js/crypto";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import { $donation, updateDonation } from "../../../../src/store/donation";
import { $contract } from "../../../../src/store/contract";
import { ZilPayBase } from "../../../ZilPay/zilpay-base";
import { $user } from "../../../../src/store/user";
import { updateIsController } from "../../../../src/store/controller";

function Component() {
  const callbackRef = useCallback((inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const Router = useRouter();
  const username = useStore($user)?.name;
  const net = useStore($net);
  const donation = useStore($donation);
  const contract = useStore($contract);

  const [txID, setTxID] = useState("");
  const [currency, setCurrency] = useState("");
  const [input, setInput] = useState(0); // the amount to transfer
  const [inputB, setInputB] = useState("");
  const [input2, setInput2] = useState(""); // the amount to transfer

  const [legend, setLegend] = useState("continue");
  const [button, setButton] = useState("button primary");
  const [hideDonation, setHideDonation] = useState(true);
  const [hideSubmit, setHideSubmit] = useState(true);

  const handleOnChange = (event: { target: { value: any } }) => {
    setCurrency(event.target.value);
  };
  const handleOnChangeB = (event: { target: { value: any } }) => {
    setInputB(event.target.value);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(0);
    setHideDonation(true);
    setHideSubmit(true);
    setLegend("continue");
    setButton("button primary");
    let input = event.target.value;
    const re = /,/gi;
    input = input.replace(re, ".");
    const input_ = Number(input);
    if (!isNaN(input_)) {
      if (input_ === 0) {
        toast.error("the amount cannot be zero", {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      } else {
        setInput(input_);
      }
    } else {
      toast.error("the input it not a number", {
        position: "top-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    }
  };

  const handleInput2 = (event: { target: { value: any } }) => {
    setInput2("");
    setHideDonation(true);
    setHideSubmit(true);
    setLegend("continue");
    setButton("button primary");
    let input = event.target.value;
    try {
      input = zcrypto.fromBech32Address(input);
      setInput2(input);
    } catch (error) {
      try {
        input = zcrypto.toChecksumAddress(input);
        setInput2(input);
      } catch {
        toast.error("wrong address.", {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      }
    }
  };
  const handleOnKeyPress2 = async ({
    key,
  }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleSave();
    }
  };

  const handleSave = async () => {
    if (input === 0) {
      toast.error("the amount cannot be zero", {
        position: "top-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    } else if (input2 === "") {
      toast.error("the recipient address cannot be null", {
        position: "top-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    } else {
      if (currency === "ZIL" && inputB === "") {
        toast.error("choose type of recipient", {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      } else {
        setLegend("saved");
        setButton("button");
        setHideDonation(false);
        setHideSubmit(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (contract !== null && donation !== null) {
      const zilpay = new ZilPayBase();
      const addr_name = currency.toLowerCase();

      let txID = "Transfer";
      let amount = 0;

      switch (addr_name) {
        case "zil":
          txID = "SendFunds";
          amount = input * 1e12;
          break;
        case "tyron":
          amount = input * 1e12;
          break;
        case "xcad":
          amount = input * 1e18;
          break;
        case "xsgd":
          amount = input * 1e6;
          break;
        case "port":
          amount = input * 1e4;
          break;
        case "gzil":
          amount = input * 1e15;
          break;
        case "swth":
          amount = input * 1e8;
          break;
        case "lunr":
          amount = input * 1e4;
          break;
        case "carb":
          amount = input * 1e8;
          break;
        case "zwap":
          amount = input * 1e12;
          break;
        case "zusdt":
          amount = input * 1e6;
          break;
        case "sco":
          amount = input * 1e4;
          break;
        case "xidr":
          amount = input * 1e6;
          break;
        case "zwbtc":
          amount = input * 1e8;
          break;
        case "zeth":
          amount = input * 1e18;
          break;
        case "fees":
          amount = input * 1e4;
          break;
        case "blox":
          amount = input * 1e2;
          break;
      }

      const beneficiary = {
        constructor: tyron.TyronZil.BeneficiaryConstructor.Recipient,
        addr: input2,
      };

      try {
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

        const addr = contract.addr;
        let tx_params;
        switch (txID) {
          case "SendFunds":
            {
              let tag = "";
              if (inputB === "contract") {
                tag = "AddFunds";
              }
              tx_params = await tyron.TyronZil.default.SendFunds(
                addr,
                tag,
                beneficiary,
                String(amount),
                tyron_
              );
            }
            break;
          default:
            tx_params = await tyron.TyronZil.default.Transfer(
              addr,
              addr_name,
              beneficiary,
              String(amount),
              tyron_
            );
            break;
        }

        toast.info(`You're about to submit a transaction to transfer ${input} ${currency} to ${zcrypto.toBech32Address(input2)}. You're also donating ${donation} ZIL to donate.did, which gives you ${donation} xPoints!`, {
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
            contractAddress: addr,
            transition: txID,
            params: tx_params as unknown as Record<string, unknown>[],
            amount: String(donation), //@todo-ux would u like to top up your wallet as well?
          })
          .then((res: any) => {
            setTxID(res.ID);
            updateDonation(null);
          })
          .catch((err: any) => {
            toast.error(String(err), {
              position: "top-left",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'dark',
            });
          });
      } catch (error) {
        toast.error("issue found", {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '100px', textAlign: 'center' }}> {/* @todo-1 define major container style to avoid repetition in each component */}
      <Headline />
      <div>
        <button
          type="button"
          className={styles.buttonBack}
          onClick={() => {
            updateIsController(true);
            Router.push(`/${username}/xwallet`);
          }}
        >
          <p className={styles.buttonText}>wallet menu</p>
        </button>
      </div>
      <div style={{ marginTop: "70px", textAlign: "center" }}>
        <h2 style={{ color: '#ffff32', marginBottom: "70px" }}>withdrawals</h2>
        {txID === "" && (
          <>
            <div className={styles.container}>
              <select style={{ width: "70%" }} onChange={handleOnChange}>
                <option value="">Select coin</option>
                <option value="TYRON">TYRON</option>
                <option value="ZIL">ZIL</option>
                <option value="XCAD">XCAD</option>
                <option value="XSGD">SGD</option>
                <option value="PORT">PORT</option>
                <option value="gZIL">gZIL</option>
                <option value="SWTH">SWTH</option>
                <option value="Lunr">Lunr</option>
                <option value="CARB">CARB</option>
                <option value="ZWAP">ZWAP</option>
                <option value="zUSDT">USD</option>
                <option value="SCO">SCO</option>
                <option value="XIDR">IDR</option>
                <option value="zWBTC">BTC</option>
                <option value="zETH">ETH</option>
                <option value="FEES">FEES</option>
                <option value="BLOX">BLOX</option>
              </select>
            </div>
            {currency !== "" && (
              <>
                <div className={styles.container}>
                  <code>{currency}</code>
                  <input
                    ref={callbackRef}
                    style={{ width: "30%" }}
                    type="text"
                    placeholder="Type amount"
                    onChange={handleInput}
                    autoFocus
                  />
                </div>
                <p style={{ textAlign: "left", marginTop: "10%" }}>Recipient:</p>
                {currency === "ZIL" && (
                  <div className={styles.container}>
                    <select style={{ width: "40%" }} onChange={handleOnChangeB}>
                      <option value="">Select type</option>
                      <option value="EOA">EOA</option>
                      <option value="contract">Smart contract</option>
                    </select>
                  </div>
                )}
                <div className={styles.containerInput}>
                  <input
                    ref={callbackRef}
                    type="text"
                    style={{ width: "100%" }}
                    placeholder="Type beneficiary address"
                    onChange={handleInput2}
                    onKeyPress={handleOnKeyPress2}
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
              </>
            )}
            {!hideDonation && <Donate />}
            {!hideSubmit && donation !== null && (
              <div style={{ marginTop: "10%" }}>
                <button className={styles.button} onClick={handleSubmit}>
                  Transfer{" "}
                  <span className={styles.x}>
                    {input} {currency}
                  </span>
                </button>
                {currency === "ZIL" && (
                  <p className={styles.gascost}>Gas: around 2 ZIL</p>
                )}
                {currency !== "ZIL" && (
                  <p className={styles.gascost}>Gas: 4-6 ZIL</p>
                )}
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
              {txID.slice(0, 11)}...
            </a>
          </code>
        )}
      </div>
    </div>
  );
}

export default Component;
