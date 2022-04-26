import React, { useState } from "react";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import * as tyron from "tyron";
import { useDispatch } from "react-redux";
import * as zcrypto from "@zilliqa-js/crypto";
import { $contract } from "../../../../../src/store/contract";
import { $net } from "../../../../../src/store/wallet-network";
import { updateModalTx } from "../../../../../src/store/modal";
import { ZilPayBase } from "../../../../ZilPay/zilpay-base";
import styles from "./styles.module.scss";
import { setTxId, setTxStatusLoading } from "../../../../../src/app/actions";

function Component() {
  const dispatch = useDispatch();
  const contract = useStore($contract);
  const net = useStore($net);

  const [menu, setMenu] = useState("");
  const [input, setInput] = useState("");
  const [inputB, setInputB] = useState("");
  const [legend, setLegend] = useState("save");
  const [button, setButton] = useState("button primary");

  const submitUpdateController = async () => {
    if (contract !== null) {
      try {
        const zilpay = new ZilPayBase();
        const tyron_ = await tyron.TyronZil.default.OptionParam(
          tyron.TyronZil.Option.none,
          "Uint128"
        );

        let params = Array();
        let transition;
        switch (menu) {
          case "username":
            transition = "UpdateUsername";
            const username_ = {
              vname: "username",
              type: "ByStr20",
              value: inputB,
            };
            params.push(username_);
            break;
          default:
            transition = "UpdateController";
            const addr_ = {
              vname: "addr",
              type: "ByStr20",
              value: input,
            };
            params.push(addr_);
            break;
        }

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
            transition: transition,
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

  const handleInput = (event: { target: { value: any; name: any } }) => {
    setInput("");
    setInputB("");
    setLegend("save");
    setButton("button primary");
    let input = event.target.value;

    if (event.target.name === "controller") {
      try {
        input = zcrypto.fromBech32Address(input);
        setInput(input);
        handleSave();
      } catch (error) {
        try {
          input = zcrypto.toChecksumAddress(input);
          setInput(input);
          handleSave();
        } catch {
          toast.error("wrong address.", {
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
    } else {
      setInputB(input);
    }
  };

  const handleOnKeyPress = async ({
    key,
  }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleSave();
    }
  };

  const handleSave = async () => {
    setLegend("saved");
    setButton("button");
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
              onClick={() => setMenu("controller")}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>CONTROLLER</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>DESC</p>
                </div>
              </div>
            </div>
          </h2>
          <h2>
            <div
              onClick={() => setMenu("username")}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>USERNAME</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>DESC</p>
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
                  <p className={styles.cardTitle3}>DEADLINE</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>DESC</p>
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
          Back
        </button>
      )}
      {menu === "controller" && (
        <>
          <div style={{ display: "flex" }}>
            <input
              name="controller"
              style={{
                width: "100%",
                marginLeft: "2%",
                marginRight: "2%",
              }}
              type="text"
              onChange={handleInput}
              onKeyPress={handleOnKeyPress}
              autoFocus
            />
            <input
              type="button"
              className={button}
              value={legend}
              onClick={() => {
                handleSave();
              }}
            />
          </div>
          <button
            onClick={submitUpdateController}
            style={{ marginTop: "10%" }}
            className="button secondary"
          >
            Update Controller
          </button>
        </>
      )}
      {menu === "username" && (
        <>
          <div style={{ display: "flex" }}>
            <input
              name="username"
              style={{
                width: "100%",
                marginLeft: "2%",
                marginRight: "2%",
              }}
              type="text"
              onChange={handleInput}
              onKeyPress={handleOnKeyPress}
              autoFocus
            />
            <input
              type="button"
              className={button}
              value={legend}
              onClick={() => {
                handleSave();
              }}
            />
          </div>
          <button
            onClick={submitUpdateController}
            style={{ marginTop: "10%" }}
            className="button secondary"
          >
            Update Username
          </button>
        </>
      )}
    </div>
  );
}

export default Component;
