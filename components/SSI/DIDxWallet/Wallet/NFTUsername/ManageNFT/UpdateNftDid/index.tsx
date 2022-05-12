import React, { useState, useRef, useEffect } from "react";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { ZilPayBase } from "../../../../../../ZilPay/zilpay-base";
import { $user } from "../../../../../../../src/store/user";
import { $contract } from "../../../../../../../src/store/contract";
import { $net } from "../../../../../../../src/store/wallet-network";
import { $doc } from "../../../../../../../src/store/did-doc";
import { updateModalTx } from "../../../../../../../src/store/modal";
import {
  setTxStatusLoading,
  setTxId,
} from "../../../../../../../src/app/actions";
import { Donate } from "../../../../../..";
import {
  $donation,
  updateDonation,
} from "../../../../../../../src/store/donation";
import controller from "../../../../../../../src/hooks/isController";

function Component() {
  const dispatch = useDispatch();
  const Router = useRouter();
  const searchInput = useRef(null);
  const { isController } = controller();
  function handleFocus() {
    if (searchInput !== null && searchInput.current !== null) {
      const si = searchInput.current as any;
      si.focus();
    }
  }

  useEffect(() => {
    isController();
    // current property is refered to input element
    handleFocus();
  });

  const user = useStore($user);
  const contract = useStore($contract);
  const doc = useStore($doc);
  const net = useStore($net);
  const donation = useStore($donation);

  const [usernameType, setUsernameType] = useState("");
  const [username, setUsername] = useState("");
  const [currency, setCurrency] = useState("");

  const handleSubmit = async () => {
    if (contract !== null && donation !== null) {
      try {
        const zilpay = new ZilPayBase();
        let txID = "UpdateNftDid";

        const tx_params = Array();
        const tx_username = {
          vname: "username",
          type: "String",
          value: usernameType === "default" ? user?.name! : username, // @todo-i-checked add username as input parameter with default option user.name
          // username can either be the contract (user.name) or an input value given by the user
        };
        tx_params.push(tx_username);

        const id = currency.toLowerCase();
        const tx_id = {
          vname: "id",
          type: "String",
          value: id,
        };
        tx_params.push(tx_id);

        const tx_did = {
          vname: "dID",
          type: "ByStr20",
          value: contract?.addr,
        };
        tx_params.push(tx_did);

        const tyron_ = await tyron.Donation.default.tyron(donation!);
        const tyron__ = {
          vname: "tyron",
          type: "Option Uint128",
          value: tyron_,
        };
        tx_params.push(tyron__);

        dispatch(setTxStatusLoading("true"));
        updateModalTx(true);
        let tx = await tyron.Init.default.transaction(net);

        await zilpay
          .call({
            contractAddress: contract.addr,
            transition: txID,
            params: tx_params as unknown as Record<string, unknown>[],
            amount: String(donation),
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
                updateDonation(null);
              } else if (tx.isRejected()) {
                dispatch(setTxStatusLoading("failed"));
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

  const handleOnChangeUsername = (event: { target: { value: any } }) => {
    setUsernameType(event.target.value);
  };

  const handleOnChangeCurrency = (event: { target: { value: any } }) => {
    updateDonation(null);
    setCurrency(event.target.value);
  };

  const handleInputUsername = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(value.toLowerCase());
  };

  return (
    <div style={{ marginBottom: "14%", textAlign: "center" }}>
      <button
        onClick={() => {
          Router.push(`/${user?.name}/did/wallet/nft/manage`);
        }}
        className="button"
        style={{ marginBottom: "50%" }}
      >
        <p>BACK</p>
      </button>
      <h3 style={{ marginBottom: "7%" }}>
        Update{" "}
        <span className={styles.username}>
          {usernameType === "default"
            ? user?.name
            : usernameType === "input"
              ? username
              : ""}
        </span>{" "}
        NFT Username
      </h3>
      <select onChange={handleOnChangeUsername}>
        <option value="">Select Username</option>
        <option value="default">{user?.name}</option>
        <option value="input">Input Username</option>
      </select>
      {usernameType === "input" && (
        <div className={styles.container}>
          <input
            ref={searchInput}
            type="text"
            style={{ width: "50%" }}
            onChange={handleInputUsername}
            placeholder="Type username"
            value={username}
            autoFocus
          />
        </div>
      )}
      {usernameType === "default" ||
        (usernameType === "input" && username !== "") ? (
        <div>
          <div style={{ marginTop: "14%" }}>
            <h4>payment</h4>
            <select onChange={handleOnChangeCurrency}>
              <option value="">Select Currency</option>
              <option value="TYRON">15 TYRON</option>
              {/* <option value="$SI">$SI</option>
                <option value="zUSDT">zUSDT</option>
                <option value="XSGD">XSGD</option>
                <option value="PIL">PIL</option> */}
              <option value="FREE">Free</option>
            </select>
          </div>
          {currency !== "" && <Donate />}
          {donation !== null && (
            <div style={{ marginTop: "14%", textAlign: "center" }}>
              <button className="button" onClick={handleSubmit}>
                <p>
                  Transfer{" "}
                  <span className={styles.username}>
                    {usernameType === "default" ? user?.name! : username}
                  </span>{" "}
                  NFT Username
                </p>
              </button>
              <h5 style={{ marginTop: "3%" }}>gas around 14 ZIL</h5>
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Component;
