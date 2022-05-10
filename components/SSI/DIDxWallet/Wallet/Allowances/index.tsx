import { useStore } from "effector-react";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import * as tyron from "tyron";
import { setTxId, setTxStatusLoading } from "../../../../../src/app/actions";
import { $contract } from "../../../../../src/store/contract";
import { updateModalTx } from "../../../../../src/store/modal";
import { $net } from "../../../../../src/store/wallet-network";
import { $donation, updateDonation } from "../../../../../src/store/donation";
import { ZilPayBase } from "../../../../ZilPay/zilpay-base";
import styles from "./styles.module.scss";
import { Donate } from "../../../..";

function Component() {
  const dispatch = useDispatch();
  const contract = useStore($contract);
  const net = useStore($net);
  const donation = useStore($donation);

  const [menu, setMenu] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [spender, setSpender] = useState("");
  const [legend, setLegend] = useState("save");
  const [button, setButton] = useState("button primary");
  const [legend2, setLegend2] = useState("save");
  const [button2, setButton2] = useState("button primary");
  const [legend3, setLegend3] = useState("save");
  const [button3, setButton3] = useState("button primary");

  const handleInput = (event: { target: { value: any; name: any } }) => {
    let input = event.target.value;

    if (event.target.name === "name") {
      setLegend("save");
      setButton("button primary");
      setName(input);
    } else if (event.target.name === "amount") {
      setLegend2("save");
      setButton2("button primary");
      setAmount(input);
    } else {
      setSpender("");
      setLegend3("save");
      setButton3("button primary");
      let value = tyron.Address.default.verification(event.target.value);
      if (value !== "") {
        setSpender(value);
        setLegend3("saved");
        setButton3("button");
      } else {
        toast.error(`Wrong address.`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          toastId: 5,
        });
      }
    }
  };

  const handleSave = (id) => {
    if (id === "name") {
      setLegend("saved");
      setButton("button");
    } else if (id === "amount") {
      setLegend2("saved");
      setButton2("button");
    }
  };

  const handleSubmit = async () => {
    if (contract !== null) {
      try {
        const zilpay = new ZilPayBase();
        let params = Array();
        let txId: string;
        txId = menu === "increase" ? "IncreaseAllowance" : "DecreaseAllowance";
        const addrName_ = {
          vname: "addrName",
          type: "String",
          value: name,
        };
        params.push(addrName_);
        const spender_ = {
          vname: "spender",
          type: "ByStr20",
          value: spender,
        };
        params.push(spender_);
        const amount_ = {
          vname: "amount",
          type: "Uint128",
          value: String(Number(amount) * 1e12), //todo-i amount times the decimals (the amount of decimals depends on the payment id - use tyron.js)
        };
        params.push(amount_);

        const tyron_ = await tyron.Donation.default.tyron(donation!);
        const tyron__ = {
          vname: "tyron",
          type: "Option Uint128",
          value: tyron_,
        };
        params.push(tyron__);

        dispatch(setTxStatusLoading("true"));
        updateModalTx(true);
        let tx = await tyron.Init.default.transaction(net);
        await zilpay
          .call({
            contractAddress: contract.addr,
            transition: txId,
            params: params as unknown as Record<string, unknown>[],
            amount: String(0),
          })
          .then(async (res) => {
            dispatch(setTxId(res.ID));
            dispatch(setTxStatusLoading("submitted"));
            try {
              tx = await tx.confirm(res.ID);
              if (tx.isConfirmed()) {
                dispatch(setTxStatusLoading("confirmed"));
                window.open(
                  `https://devex.zilliqa.com/tx/${res.ID
                  }?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                  }api.zilliqa.com`
                );
              } else if (tx.isRejected()) {
                dispatch(setTxStatusLoading("failed"));
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
              updateModalTx(false);
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
            }
          });
      } catch (error) {
        updateModalTx(false);
        dispatch(setTxStatusLoading("idle"));
        toast.error(String(error), {
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
    } else {
      toast.error("some data is missing.", {
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
    updateDonation(null);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
      }}
    >
      {menu === "" && (
        <>
          <h2>
            <div
              onClick={() => setMenu("increase")}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>INCREASE</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>Add spender allowance</p>
                </div>
              </div>
            </div>
          </h2>
          <h2>
            <div
              onClick={() => setMenu("decrease")}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>DECREASE</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>remove spender allowance</p>
                </div>
              </div>
            </div>
          </h2>
        </>
      )}
      {menu !== "" && (
        <>
          <button
            onClick={() => setMenu("")}
            style={{ marginBottom: "20%" }}
            className="button"
          >
            <p>Back</p>
          </button>
          <div className={styles.inputWrapper}>
            <div>
              <code>Name</code>
            </div>
            <input
              name="name"
              style={{
                width: "100%",
                marginLeft: "2%",
                marginRight: "2%",
              }}
              type="text"
              onChange={handleInput}
              onKeyPress={() => {
                setLegend("saved");
                setButton("button");
              }}
              autoFocus
            />
            <input
              type="button"
              className={button}
              value={legend}
              onClick={() => {
                handleSave("name");
              }}
            />
          </div>
          <div className={styles.inputWrapper}>
            <div>
              <code>Spender</code>
            </div>
            <input
              name="spender"
              style={{
                width: "100%",
                marginLeft: "2%",
                marginRight: "2%",
              }}
              type="text"
              onChange={handleInput}
              onKeyPress={() => {
                setLegend3("saved");
                setButton3("button");
              }}
              autoFocus
            />
            <input type="button" className={button3} value={legend3} />
          </div>
          <div className={styles.inputWrapper}>
            <div>
              <code>Amount</code>
            </div>
            <input
              name="amount"
              style={{
                width: "100%",
                marginLeft: "2%",
                marginRight: "2%",
              }}
              type="text"
              onChange={handleInput}
              onKeyPress={() => {
                setLegend2("saved");
                setButton2("button");
              }}
              autoFocus
            />
            <input
              type="button"
              className={button2}
              value={legend2}
              onClick={() => {
                handleSave("amount");
              }}
            />
          </div>
          <Donate />
          <button
            onClick={handleSubmit}
            style={{ marginTop: "10%" }}
            className="button secondary"
          >
            <p>{menu === "increase" ? "Increase" : "Decrease"} Allowance</p>
          </button>
        </>
      )}
    </div>
  );
}

export default Component;
