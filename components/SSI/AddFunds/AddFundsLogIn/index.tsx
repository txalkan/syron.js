import React, { useState, useRef, useEffect } from "react";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { fetchAddr } from "../../../SearchBar/utils";
import { ZilPayBase } from "../../../ZilPay/zilpay-base";
import { $zil_address } from "../../../../src/store/zil_address";
import { updateLoggedIn } from "../../../../src/store/loggedIn";
import * as zcrypto from "@zilliqa-js/crypto";
import { useStore } from "effector-react";
import { $net } from "../../../../src/store/wallet-network";

function Component() {
  const searchInput = useRef(null);
  function handleFocus() {
    if (searchInput !== null && searchInput.current !== null) {
      const si = searchInput.current as any;
      si.focus();
    }
  }
  useEffect(() => {
    // current property is refered to input element
    handleFocus();
  }, []);

  const zil_address = useStore($zil_address);
  const net = useStore($net);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [originator, setOriginator] = useState("");
  const [ssi, setSSI] = useState("");
  const [domain, setDomain] = useState("");
  const [input, setInput] = useState("");
  const [legend, setLegend] = useState("Save");
  const [button, setButton] = useState("button primary");

  const spinner = (
    <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
  );

  const handleSave = async () => {
    setLegend("saved");
    setButton("button");
  };

  const handleOnChange = (event: { target: { value: any } }) => {
    setError("");
    setSSI("");
    setDomain("");
    const login_ = event.target.value;
    if (zil_address === null) {
      setError("to continue, connect yor Zilliqa EOA (ZilPay)");
    } else {
      if (login_ === "zilpay") {
        updateLoggedIn({
          address: "zilpay",
        });
      }
      setOriginator(login_);
    }
  };

  const handleOnChange2 = (event: { target: { value: any } }) => {
    setError("");
    setDomain("");
    setSSI(event.target.value);
  };

  const handleOnChange3 = (event: { target: { value: any } }) => {
    setError("");
    setDomain(event.target.value);
  };

  const handleInput = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setInput(value.toLowerCase());
  };

  const handleContinue = async () => {
    if (domain === "") {
      setError("select a domain");
    } else {
      resolveUser();
    }
  };
  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleContinue();
    }
  };

  const resolveUser = async () => {
    setError("");
    setLoading(true);
    if (domain === "did") {
      await fetchAddr({ net, _username: input, _domain: domain })
        .then(async (addr) => {
          addr = zcrypto.toChecksumAddress(addr);
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
            throw error;
          } else {
            updateLoggedIn({
              username: input,
              address: addr,
            });
          }
        })
        .catch(() => {
          toast.error("you do not own this wallet.", {
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
    } else {
      toast('Coming soon!', {
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
    setLoading(false);
  };

  const handleInput2 = (event: { target: { value: any } }) => {
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
      resolveAddr();
    }
  };

  const resolveAddr = async () => {
    if (error === "") {
      const zilpay = new ZilPayBase();
      await zilpay
        .getSubState(input, "controller")
        .then((controller_) => {
          controller_ = zcrypto.toChecksumAddress(controller_);
          const zil_address = $zil_address.getState();
          if (zil_address === null) {
            toast.info('Connect to ZilPay to verify your EOA is the controller of this xWallet.', {
              position: "top-left",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'dark',
            });
          } else if (controller_ !== zil_address?.base16) {
            throw error;
          } else {
            updateLoggedIn({
              address: input,
            });
            handleSave();
          }
        })
        .catch(() => {
          toast.error("you do not own this wallet.", {
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
    }
  };
  return (
    <div style={{ textAlign: "center" }}>
      {zil_address !== null && (
        <div className={styles.container}>
          <select style={{ width: "70%" }} onChange={handleOnChange}>
            <option value="">Select originator</option>
            <option value="ssi">Self-sovereign identity</option>
            <option value="zilpay">ZilPay</option>
          </select>
        </div>
      )}
      {originator === "ssi" && (
        <div className={styles.container}>
          <select style={{ width: "70%" }} onChange={handleOnChange2}>
            <option value="">Log in</option>
            <option value="username">NFT Username</option>
            <option value="address">Address</option>
          </select>
        </div>
      )}
      {ssi === "username" && (
        <div className={styles.container}>
          <input
            ref={searchInput}
            type="text"
            style={{ width: "40%" }}
            onChange={handleInput}
            onKeyPress={handleOnKeyPress}
            placeholder="Type username"
            value={input}
            autoFocus
          />
          <select style={{ width: "30%" }} onChange={handleOnChange3}>
            <option value="">DID domain</option>
            <option value="did">.did</option>
            <option value="dex">.dex</option>
            <option value="stake">.stake</option>
          </select>
          <button onClick={handleContinue} className={styles.searchBtn}>
            {loading ? spinner : <i className="fa fa-search"></i>}
          </button>
        </div>
      )}
      {ssi === "address" && (
        <div className={styles.container}>
          <input
            ref={searchInput}
            type="text"
            style={{ width: "55%" }}
            placeholder="Type address"
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
              resolveAddr();
            }}
          />
        </div>
      )}
      {error !== "" && <p className={styles.error}>Error: {error}</p>}
    </div>
  );
}

export default Component;
