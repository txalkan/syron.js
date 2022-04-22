import React, { useState, useRef, useEffect } from "react";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import styles from "./styles.module.scss";
import { fetchAddr } from "../../../SearchBar/utils";
import { ZilPayBase } from "../../../ZilPay/zilpay-base";
import * as zcrypto from "@zilliqa-js/crypto";
import { useStore } from "effector-react";
import { $net } from "../../../../src/store/wallet-network";
import { updateOriginatorAddress } from "../../../../src/store/originatorAddress";
import { RootState } from "../../../../src/app/reducers";

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

  const zilAddr = useSelector((state: RootState) => state.modal.zilAddr);
  const net = useStore($net);

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
    setOriginator("");
    setSSI("");
    setDomain("");
    const login_ = event.target.value;
    if (zilAddr === null) {
      toast.error("To continue, log in.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      if (login_ === "zilpay") {
        updateOriginatorAddress({
          value: "zilpay",
        });
      }
      setOriginator(login_);
    }
  };

  const handleOnChange2 = (event: { target: { value: any } }) => {
    setDomain("");
    setSSI(event.target.value);
  };

  const handleOnChange3 = (event: { target: { value: any } }) => {
    setDomain(event.target.value);
  };

  const handleInput = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setInput(value.toLowerCase());
  };

  const handleContinue = async () => {
    if (domain === "") {
      toast.error("Select a domain.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
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
          const controller = zcrypto.toChecksumAddress(state.result.controller);
          const zil_address = zilAddr.getState();

          if (controller !== zil_address?.base16) {
            throw Error("Failed DID Controller authentication.");
          } else {
            updateOriginatorAddress({
              username: input,
              value: addr,
            });
          }
        })
        .catch((error) => {
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
        });
    } else {
      toast("Coming soon!", {
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
    setLoading(false);
  };

  const handleInput2 = (event: { target: { value: any } }) => {
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
        toast.error("Wrong address.", {
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
  const handleOnKeyPress2 = async ({
    key,
  }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      resolveAddr();
    }
  };
  const resolveAddr = async () => {
    const zilpay = new ZilPayBase();
    setLoading(true);
    await zilpay
      .getSubState(input, "controller")
      .then((did_controller) => {
        const controller = zcrypto.toChecksumAddress(did_controller);
        const zil_address = zilAddr.getState();
        if (zil_address === null) {
          toast.info("To continue, log in.", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        } else if (controller !== zil_address?.base16) {
          setLoading(false);
          throw Error("Failed DID Controller authentication.");
        } else {
          updateOriginatorAddress({
            value: input,
          });
          handleSave();
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
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
      });
  };

  return (
    <div style={{ textAlign: "center" }}>
      {zilAddr !== null && (
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
            <option value="">Domain</option>
            <option value="did">.did</option>
            <option value="defi">.defi</option>
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
            style={{ width: "100%" }}
            placeholder="Type address"
            onChange={handleInput2}
            onKeyPress={handleOnKeyPress2}
            autoFocus
          />
          <button
            onClick={resolveAddr}
            style={{ marginLeft: "2%" }}
            className={button}
          >
            {loading ? spinner : legend}
          </button>
        </div>
      )}
    </div>
  );
}

export default Component;
