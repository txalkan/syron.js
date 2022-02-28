import React, { useState } from "react";
import * as tyron from "tyron";
import styles from "./styles.module.scss";
import { fetchAddr } from "../SearchBar/utils";
import { ZilPayBase } from "../ZilPay/zilpay-base";
import { $zil_address } from "../../src/store/zil_address";
import { updateLoggedIn } from "../../src/store/loggedIn";
import * as zcrypto from "@zilliqa-js/crypto";
import { useStore } from "effector-react";
import { $net } from "../../src/store/wallet-network";
import { toast } from "react-toastify";

function Component() {
  const net = useStore($net);
  const zil_address = useStore($zil_address);
  const [loading, setLoading] = useState(false);

  const [logIn, setLogIn] = useState("");
  const [input, setInput] = useState("");
  const [legend, setLegend] = useState("save");
  const [button, setButton] = useState("button primary");

  const spinner = (
    <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
  );

  const handleSave = async () => {
    setLegend("saved");
    setButton("button");
  };

  const handleOnChange = (event: { target: { value: any } }) => {
    if (zil_address !== null) {
      setLogIn(event.target.value);
    } else {
      toast.warning('Connect your ZilPay wallet', {
        position: "top-right",
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

  const handleInput = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setInput(value.toLowerCase());
  };

  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      resolveUser();
    }
  };

  const resolveUser = async () => {
    setLoading(true);
    await fetchAddr({ net, _username: input, _domain: "did" })
      .then(async (addr) => {
        let init = new tyron.ZilliqaInit.default(
          tyron.DidScheme.NetworkNamespace.Testnet
        );
        switch (net) {
          case "mainnet":
            init = new tyron.ZilliqaInit.default(
              tyron.DidScheme.NetworkNamespace.Mainnet
            );
        }
        const state = await init.API.blockchain.getSmartContractState(addr);
        const controller = state.result.controller;
        const controller_ = zcrypto.toChecksumAddress(controller);
        const zil_address = $zil_address.getState();
        if (controller_ !== zil_address?.base16) {
          toast.error(`Only ${input}'s DID Controller can access this wallet.`, {
            position: "top-left",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'dark',
          });
        } else {
          updateLoggedIn({
            username: input,
            address: addr,
          });
        }
      })
      .catch(() => {
        toast.error(`Wrong username`, {
          position: "top-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      })
    setLoading(false);
  };

  const handleInputB = (event: { target: { value: any } }) => {
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
        toast.error(`Wrong address`, {
          position: "top-left",
          autoClose: 3000,
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

  const handleOnKeyPressB = async ({
    key,
  }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      resolveAddr();
    }
  };

  const resolveAddr = async () => {
    const zilpay = new ZilPayBase();
    await zilpay
      .getSubState(input, "controller")
      .then((did_controller) => {
        did_controller = zcrypto.toChecksumAddress(did_controller);
        const zil_address = $zil_address.getState();
        if (did_controller !== zil_address?.base16) {
          toast.error(`Only ${input.slice(0, 9)}'s DID Controller can access this wallet.`, {
            position: "top-left",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'dark',
          });
        } else {
          updateLoggedIn({
            address: input,
          });
          handleSave();
        }
      })
      .catch(() => {
        toast.error(`Wrong format`, {
          position: "top-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      })
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div className={styles.container}>
        <select style={{ width: "30%" }} onChange={handleOnChange}>
          <option value="">Log in</option>
          <option value="username">NFT Username</option>
          <option value="address">SSI address</option>
        </select>
      </div>
      {logIn === "username" && (
        <div className={styles.container}>
          <input
            type="text"
            style={{ width: "40%" }}
            onChange={handleInput}
            onKeyPress={handleOnKeyPress}
            value={input}
            placeholder="Type username"
            autoFocus
          />
          <span className={styles.did}>.did</span>
          <button onClick={resolveUser} className={styles.searchBtn}>
            {loading ? spinner : <i className="fa fa-search"></i>}
          </button>
        </div>
      )}
      {logIn === "address" && (
        <div className={styles.container}>
          <input
            type="text"
            style={{ width: "70%" }}
            onChange={handleInputB}
            onKeyPress={handleOnKeyPressB}
            placeholder="Type address"
            autoFocus
          />
          <input
            style={{ marginLeft: "2%" }}
            type="button"
            className={button}
            value={legend}
            onClick={() => {
              resolveAddr();
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Component;
