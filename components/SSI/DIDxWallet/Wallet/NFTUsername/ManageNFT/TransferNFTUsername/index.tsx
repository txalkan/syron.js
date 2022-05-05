import React, { useState, useRef, useEffect } from "react";
import * as tyron from "tyron";
import * as zcrypto from "@zilliqa-js/crypto";
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

function Component() {
  const dispatch = useDispatch();
  const Router = useRouter();
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

  const user = $user.getState();
  const contract = useStore($contract);
  const doc = useStore($doc);
  const net = useStore($net);
  const donation = useStore($donation);

  const [input, setInput] = useState(""); // the recipient address
  const [legend, setLegend] = useState("save");
  const [button, setButton] = useState("button primary");
  const [button2, setButton2] = useState("button primary");

  const [inputAddr, setInputAddr] = useState("");
  const [address, setAddress] = useState("");
  const [legend2, setLegend2] = useState("save");
  const [legend3, setLegend3] = useState("save");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [usernameType, setUsernameType] = useState("");
  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("");
  const [currency, setCurrency] = useState("");

  const handleSave = async () => {
    setLegend("saved");
    setButton("button");
  };
  const handleInput = (event: { target: { value: any } }) => {
    setInput("");
    setSelectedAddress("");
    setInputAddr("");
    setAddress("");
    updateDonation(null);
    setLegend("save");
    setButton("button primary");
    let input = event.target.value;
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
  };
  const handleOnKeyPress = async ({
    key,
  }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleSave();
    }
  };

  const handleSubmit = async () => {
    if (contract !== null && donation !== null) {
      try {
        const zilpay = new ZilPayBase();
        let txID = "TransferNftUsername";

        const tx_params = Array();
        const tx_username = {
          vname: "username",
          type: "String",
          value: usernameType === "default" ? user?.name! : username, // @todo-i-checked add username as input parameter with default option user.name
          // username can either be the contract (user.name) or an input value given by the user
        };
        tx_params.push(tx_username);

        if (Number(doc?.version.slice(8, 9)) < 5) {
          txID = "TransferNFTUsername";
          const tx_newAddr = {
            vname: "newAddr",
            type: "ByStr20",
            value: input,
          };
          tx_params.push(tx_newAddr);

          const guardianship = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.some,
            "ByStr20",
            input
          );
          const tx_guardianship = {
            vname: "guardianship",
            type: "Option ByStr20",
            value: guardianship,
          };
          tx_params.push(tx_guardianship);

          if (
            (Number(doc?.version.slice(8, 9)) >= 4 &&
              Number(doc?.version.slice(10, 11)) <= 6) ||
            doc?.version.slice(0, 3) === "dao"
          ) {
            const id = "tyron";
            const tx_id = {
              vname: "id",
              type: "String",
              value: id,
            };
            tx_params.push(tx_id);

            const amount_ = {
              vname: "amount",
              type: "Uint128",
              value: "0", //0 because ID is tyron
            };
            tx_params.push(amount_);
          }
        } else {
          const id = currency.toLowerCase(); // @todo-i-checked add payment id as input parameter (idem buy nft payment options)
          const tx_id = {
            vname: "id",
            type: "String",
            value: id,
          };
          tx_params.push(tx_id);

          // the recipient address of the username
          const tx_addr = {
            vname: "addr",
            type: "ByStr20",
            value: input,
          };
          tx_params.push(tx_addr);

          const tx_did = {
            vname: "dID",
            type: "ByStr20",
            value:
              selectedAddress === "SSI"
                ? contract?.addr
                : selectedAddress === "ADDR"
                ? address
                : input,
          };
          tx_params.push(tx_did);
        }

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

        toast.info(`You're about to transfer the ${user?.name} NFT Username`, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
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
                  `https://devex.zilliqa.com/tx/${
                    res.ID
                  }?network=https%3A%2F%2F${
                    net === "mainnet" ? "" : "dev-"
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

  const handleOnChangeSelectedAddress = (event: { target: { value: any } }) => {
    setAddress("");
    setInputAddr("");
    setSelectedAddress(event.target.value);
  };

  const handleInputAddr = (event: { target: { value: any } }) => {
    setAddress("");
    setLegend2("save");
    setInputAddr(event.target.value);
  };

  const handleOnKeyPress2 = ({
    key,
  }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      validateInputAddr();
    }
  };

  const validateInputAddr = () => {
    try {
      const addr = zcrypto.fromBech32Address(inputAddr);
      setAddress(addr);
      setLegend2("saved");
    } catch (error) {
      try {
        const addr = zcrypto.toChecksumAddress(inputAddr);
        setAddress(addr);
        setLegend2("saved");
      } catch {
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

  const handleOnChangeUsername = (event: { target: { value: any } }) => {
    setUsernameType(event.target.value);
  };

  const handleOnChangeCurrency = (event: { target: { value: any } }) => {
    setCurrency(event.target.value);
  };

  const handleInputUsername = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setLegend3("continue");
    setButton2("button primary");
    setUsername(value.toLowerCase());
  };

  const handleOnChangeDomain = (event: { target: { value: any } }) => {
    setLegend3("continue");
    setButton2("button primary");
    setDomain(event.target.value);
  };

  const handleContinue = () => {
    setLegend3("saved");
    setButton2("button");
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
        Transfer{" "}
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
            style={{ width: "40%" }}
            onChange={handleInputUsername}
            placeholder="Type username"
            value={username}
            autoFocus
          />
          <select
            style={{ width: "30%", marginLeft: "3%", marginRight: "5%" }}
            onChange={handleOnChangeDomain}
          >
            <option value="">Domain</option>
            <option value="did">.did</option>
            <option value="defi">.defi</option>
          </select>
          {username !== "" && domain !== "" && (
            <button onClick={handleContinue} className={button2}>
              <p>{legend3}</p>
            </button>
          )}
        </div>
      )}
      {usernameType !== "" && (
        <p className={styles.containerInput}>
          Recipient:
          <input
            ref={searchInput}
            type="text"
            style={{ width: "100%", marginLeft: "2%" }}
            placeholder="Type address"
            onChange={handleInput}
            onKeyPress={handleOnKeyPress}
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
        </p>
      )}
      {input !== "" && (
        <div>
          <select
            style={{ marginBottom: "5%" }}
            className={styles.select}
            onChange={handleOnChangeSelectedAddress}
            value={selectedAddress}
          >
            <option value="">Select Recipient DID</option>
            <option value="SSI">This SSI</option>
            <option value="RECIPIENT">Recipient address</option>
            <option value="ADDR">Another address</option>
          </select>
        </div>
      )}
      {selectedAddress === "ADDR" && (
        <div className={styles.wrapperInputAddr}>
          <input
            type="text"
            style={{ marginRight: "3%" }}
            onChange={handleInputAddr}
            onKeyPress={handleOnKeyPress2}
            placeholder="Type address"
            autoFocus
          />
          <button
            onClick={validateInputAddr}
            className={
              legend2 === "save" ? "button primary" : "button secondary"
            }
          >
            <p>{legend2}</p>
          </button>
        </div>
      )}
      {input !== "" &&
        (selectedAddress === "SSI" ||
          selectedAddress === "RECIPIENT" ||
          (selectedAddress === "ADDR" && address !== "")) && (
          <div>
            <select onChange={handleOnChangeCurrency}>
              <option value="">Select Currency</option>
              <option value="TYRON">TYRON</option>
              <option value="$SI">$SI</option>
              <option value="zUSDT">zUSDT</option>
              <option value="XSGD">XSGD</option>
              <option value="PIL">PIL</option>
              <option value="FREE">Free</option>
            </select>
            <Donate />
            {donation !== null && (
              <div style={{ marginTop: "14%", textAlign: "center" }}>
                <button className={button} onClick={handleSubmit}>
                  <p>
                    Transfer{" "}
                    <span className={styles.username}>{user?.name}</span> NFT
                    Username
                  </p>
                </button>
                <h5 style={{ marginTop: "3%" }}>gas around 14 ZIL</h5>
              </div>
            )}
          </div>
        )}
    </div>
  );
}

export default Component;
