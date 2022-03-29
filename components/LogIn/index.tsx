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
import { LogIn } from "..";

function Component() {
  const net = useStore($net);
  const zil_address = useStore($zil_address);

  const [logIn, setLogIn] = useState("");
  const [input, setInput] = useState("");
  const [legend, setLegend] = useState("save");
  const [button, setButton] = useState("button primary");
  const [loading, setLoading] = useState(false);

  const spinner = (
    <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
  );

  const handleSave = async () => {
    setLegend("saved");
    setButton("button");
  };

  const handleOnChange = (event: { target: { value: any } }) => {
    setInput('');
    if (zil_address !== null) {
      setLogIn(event.target.value);
    } else {
      toast.warning('Connect your ZilPay wallet.', {
        position: "top-center",
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
        let network = tyron.DidScheme.NetworkNamespace.Mainnet;
        if (net === "testnet") {
          network = tyron.DidScheme.NetworkNamespace.Testnet;
        }
        const init = new tyron.ZilliqaInit.default(network);
        const state = await init.API.blockchain.getSmartContractState(addr);
        const get_controller = state.result.controller;
        alert(get_controller);
        const controller = zcrypto.toChecksumAddress(get_controller);
        if (controller !== zil_address?.base16) {
          toast.error(`Only ${input}'s DID Controller can log in to ${input}.`, {
            position: "top-right",
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
        toast.error(`Wrong username.`, {
          position: "top-right",
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
        toast.error(`Wrong address.`, {
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
    setLoading(true)
    const zilpay = new ZilPayBase();
    await zilpay
      .getSubState(input, "controller")
      .then((get_controller) => {
        const controller = zcrypto.toChecksumAddress(get_controller);
        if (controller !== zil_address?.base16) {
          toast.error(`Only ${input.slice(0, 7)}'s DID Controller can log in to this SSI.`, {
            position: "top-right",
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
        toast.error(`Wrong format.`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      })
    setLoading(false)
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div className={styles.container}>
        <select
          style={{ width: "30%" }}
          onChange={handleOnChange}
        /**
      @todo-checked show placeholder/value = Log in until the user has the DID Controller connected
     */
        >
          <option value="">Log in</option>
          {zil_address !== null ? (
            <>
              <option value="username">NFT Username</option>
              <option value="address">SSI address</option>
            </>
          ) : <></>}
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
            style={{ width: "70%", marginRight: '2%' }}
            onChange={handleInputB}
            onKeyPress={handleOnKeyPressB}
            placeholder="Type address"
            autoFocus
          />
          <button onClick={resolveAddr} className={button}>
            {loading ? spinner : legend}
          </button>
        </div>
      )}
    </div>
  );
}

export default Component;
