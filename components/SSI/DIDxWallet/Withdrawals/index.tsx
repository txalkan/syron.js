import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { randomBytes, toChecksumAddress } from "@zilliqa-js/crypto";
import { useDispatch } from "react-redux";
import { HTTPProvider } from "@zilliqa-js/core";
import { Transaction } from "@zilliqa-js/account";
import { BN, Long } from "@zilliqa-js/util";
import React, { useState, useCallback } from "react";
import { $net } from "../../../../src/store/wallet-network";
import { Donate } from "../../..";
import * as zcrypto from "@zilliqa-js/crypto";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import { $donation, updateDonation } from "../../../../src/store/donation";
import { $contract } from "../../../../src/store/contract";
import { ZilPayBase } from "../../../ZilPay/zilpay-base";
import {
  setTxStatusLoading,
  showTxStatusModal,
  setTxId,
  hideTxStatusModal,
} from "../../../../src/app/actions";

function Component() {
  const callbackRef = useCallback((inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const dispatch = useDispatch();
  const net = useStore($net);
  const donation = useStore($donation);
  const contract = useStore($contract);

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
        toast.error("The amount cannot be zero.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      } else {
        setInput(input_);
      }
    } else {
      toast.error("The input is not a number.", {
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
        toast.error("Wrong address format.", {
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
  const handleOnKeyPress2 = async ({
    key,
  }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleSave();
    }
  };

  const handleSave = async () => {
    if (input === 0) {
      toast.error("The amount cannot be zero.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else if (input2 === "") {
      toast.error("The recipient address cannot be null.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      if (currency === "ZIL" && inputB === "") {
        toast.error("Choose the type of recipient.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
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
      const _currency = await tyron.Currency.default.tyron(currency, input);
      const txID = _currency.txID;
      const amount = _currency.amount;
      const addr_name = _currency.addr_name;

      const beneficiary = {
        constructor: tyron.TyronZil.BeneficiaryConstructor.Recipient,
        addr: input2,
      };

      try {
        const tyron_ = await tyron.Donation.default.tyron(donation)

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
              addr_name!,
              beneficiary,
              String(amount),
              tyron_
            );
            break;
        }

        toast.info(
          `You're about to submit a transaction to transfer ${input} ${currency} to ${zcrypto.toBech32Address(
            input2
          )}. You're also donating ${donation} ZIL to donate.did, which gives you ${donation} xPoints!`,
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
            contractAddress: addr,
            transition: txID,
            params: tx_params as unknown as Record<string, unknown>[],
            amount: String(donation),
          })
          .then(async (res: any) => {
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
          })
          .catch((err: any) => {
            toast.error(String(err), {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          });
      } catch (error) {
        toast.error("issue found", {
          position: "top-right",
          autoClose: 2000,
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
    <div>
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
              style={{ width: "40%" }}
              type="text"
              placeholder="Type amount"
              onChange={handleInput}
              autoFocus
            />
          </div>
          <p style={{ textAlign: "left", marginTop: "10%" }}>Recipient:</p>
          {currency === "ZIL" && (
            <div className={styles.container}>
              <select style={{ width: "60%" }} onChange={handleOnChangeB}>
                <option value="">Select type:</option>
                <option value="contract">Smart contract</option>
                <option value="EOA">Regular address</option>
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
        <div
          style={{
            marginTop: "10%",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <button className={styles.button} onClick={handleSubmit}>
            Transfer{" "}
            <span className={styles.x}>
              {input} {currency}
            </span>
          </button>
          {currency === "ZIL" && (
            <p className={styles.gascost}>Gas: around 2 ZIL</p>
          )}
          {currency !== "ZIL" && <p className={styles.gascost}>Gas: 4-6 ZIL</p>}
        </div>
      )}
    </div>
  );
}

export default Component;
