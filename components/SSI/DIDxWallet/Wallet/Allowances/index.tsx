import { useStore } from "effector-react";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import * as tyron from "tyron";
import { setTxId, setTxStatusLoading } from "../../../../../src/app/actions";
import { $contract } from "../../../../../src/store/contract";
import { updateModalTx } from "../../../../../src/store/modal";
import { $net } from "../../../../../src/store/wallet-network";
import { ZilPayBase } from "../../../../ZilPay/zilpay-base";
import styles from "./styles.module.scss";

function Component() {
  const dispatch = useDispatch();
  const contract = useStore($contract);
  const net = useStore($net);

  const [menu, setMenu] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [legend, setLegend] = useState("save");
  const [button, setButton] = useState("button primary");
  const [legend2, setLegend2] = useState("save");
  const [button2, setButton2] = useState("button primary");

  const handleInput = (event: { target: { value: any; name: any } }) => {
    let input = event.target.value;

    if (event.target.name === "name") {
      setLegend("save");
      setButton("button primary");
      setName("");
      setName(input);
    } else {
      setLegend2("save");
      setButton2("button primary");
      setAmount("");
      setAmount(input);
    }
  };

  const handleSave = (id) => {
    if (id === "name") {
      setLegend("saved");
      setButton("button");
    } else {
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
        txId = "IncreaseAllowance";
        const addrName_ = {
          vname: "addrName",
          type: "String",
          value: name,
        };
        params.push(addrName_);
        const spender_ = {
          vname: "spender",
          type: "ByStr20",
          value: "0x54eabb9766259dac5a57ae4f2aa48b2a0208177c", //@todo-i add input address for spender
        };
        params.push(spender_);
        const amount_ = {
          vname: "amount",
          type: "Uint128",
          value: amount, //todo-i amount times the decimals
        };
        params.push(amount_);

        const donation = 0; //@todo-i add Donation
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
                  `https://devex.zilliqa.com/tx/${
                    res.ID
                  }?network=https%3A%2F%2F${
                    net === "mainnet" ? "" : "dev-"
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
              onClick={() => {
                // updateIsController(true);
                // Router.push(`/${username}/did/wallet/crud/create`);
              }}
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
        <button
          onClick={() => setMenu("")}
          style={{ marginBottom: "20%" }}
          className="button"
        >
          <p>Back</p>
        </button>
      )}
      {menu === "increase" && (
        <>
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
          <button
            onClick={handleSubmit}
            style={{ marginTop: "10%" }}
            className="button secondary"
          >
            <p>Increase Allowance</p>
          </button>
        </>
      )}
    </div>
  );
}

export default Component;
