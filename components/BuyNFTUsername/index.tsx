import React, { useState } from "react";
import * as tyron from "tyron";
import * as zcrypto from "@zilliqa-js/crypto";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import { ZilPayBase } from "../ZilPay/zilpay-base";
import { $new_wallet, updateNewWallet } from "../../src/store/new-wallet";
import { $user } from "../../src/store/user";
import { LogIn, NewWallet, Donate } from "..";
import { $loggedIn } from "../../src/store/loggedIn";
import { $net } from "../../src/store/wallet-network";
import { $donation, updateDonation } from "../../src/store/donation";

function Component() {
  const user = $user.getState();
  const new_wallet = useStore($new_wallet);
  const logged_in = useStore($loggedIn);
  const net = useStore($net);
  const donation = useStore($donation);

  const [input, setInput] = useState("");

  const [error, setError] = useState("");
  const [txID, setTxID] = useState("");

  const handleOnChange = async (event: { target: { value: any } }) => {
    setError("");
    setInput("");
    updateDonation(null);
    const selection = event.target.value;
    setInput(selection);
  };

  const handleSubmit = async () => {
    try {
      toast.info(`You're about to buy ${user?.name} as your NFT Username!`, {
        position: "top-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
      const zilpay = new ZilPayBase();
      const username = user?.name as string;
      const id = input.toLowerCase();

      const params = Array();
      const username_ = {
        vname: "username",
        type: "String",
        value: username,
      };
      params.push(username_);
      const id_ = {
        vname: "id",
        type: "String",
        value: id,
      };
      params.push(id_);

      let addr;
      if (new_wallet !== null) {
        addr = new_wallet;
        toast.info('You have to make sure that your contract address got confirmed on the blockchain. Otherwise, ZilPay will say its address is null.', {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      } else {
        addr = logged_in?.address as string;
      }
      const guardianship = await tyron.TyronZil.default.OptionParam(
        tyron.TyronZil.Option.some,
        "ByStr20",
        addr
      );
      const guardianship_ = {
        vname: "guardianship",
        type: "Option ByStr20",
        value: guardianship,
      };
      params.push(guardianship_);

      let amount_ = {
        vname: "amount",
        type: "Uint128",
        value: "0",
      };
      let _amount = String(0);
      if (id === "zil") {
        const cost = 144;
        amount_ = {
          vname: "amount",
          type: "Uint128",
          value: `${cost * 1e12}`,
        };
        _amount = String(cost);
      }
      params.push(amount_);

      let tyron_ = await tyron.TyronZil.default.OptionParam(
        tyron.TyronZil.Option.none,
        "Uint128"
      );
      if (id === "free" && donation !== null) {
        const donation_ = String(donation * 1e12);
        tyron_ = await tyron.TyronZil.default.OptionParam(
          tyron.TyronZil.Option.some,
          "Uint128",
          donation_
        );
        _amount = String(donation);
      }
      const tyron__ = {
        vname: "tyron",
        type: "Option Uint128",
        value: tyron_,
      };
      params.push(tyron__);

      const res = await zilpay.call({
        contractAddress: addr,
        transition: "BuyNFTUsername",
        params: params,
        amount: _amount,
      });
      setTxID(res.ID);
      updateNewWallet(null);
      updateDonation(null);
    } catch (error) {
      const err = error as string;
      setError(err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "7%" }}>
      <h1 style={{ marginBottom: "7%" }}>
        Buy <span className={styles.username}>{user?.name}</span> NFT Username
      </h1>
      {txID === "" && (
        <>
          {new_wallet === null && logged_in === null && (
            <div style={{ textAlign: "center" }}>
              <h4 style={{ marginTop: '70px', marginBottom: '50px' }}>
                You can buy this NFT Username with your self-sovereign identity
              </h4>
              <LogIn />
              <h4 style={{ color: 'silver', marginTop: '70px', marginBottom: '50px' }}>
                Or create a new one
              </h4>
              <NewWallet />
            </div>
          )}
          {new_wallet !== null && logged_in === null && (
            //@todo-net wait until contract deployment got confirmed
            <h3>
              You have a new self-sovereign account at this address:{" "}
              <a
                href={`https://viewblock.io/zilliqa/address/${new_wallet}?network=${net}`}
                rel="noreferrer"
                target="_blank"
              >
                <span className={styles.x}>
                  {zcrypto.toBech32Address(new_wallet)}
                </span>
              </a>
            </h3>
          )}
          {logged_in !== null && logged_in.username && (
            <h3>
              You are logged in with{" "}
              <span className={styles.x}>{logged_in?.username}.did</span>
            </h3>
          )}
          {logged_in !== null &&
            !logged_in.username &&
            logged_in.address !== undefined && (
              <h3>
                You are logged in with{" "}
                <a
                  className={styles.x}
                  href={`https://viewblock.io/zilliqa/address/${logged_in?.address}?network=${net}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className={styles.x}>
                    {zcrypto.toBech32Address(logged_in.address)}
                  </span>
                </a>
              </h3>
            )}
          {(new_wallet !== null || logged_in !== null) && (
            <>
              <div className={styles.container}>
                <select style={{ width: "30%" }} onChange={handleOnChange}>
                  <option value="">Select payment</option>
                  <option value="TYRON">TYRON</option>
                  <option value="FREE">Free</option>
                </select>
                {input === "TYRON" && <code>Cost: 12 TYRON</code>}
                {input === "ZIL" && <code>Cost: 144 ZIL</code>}
                {input === "FREE" && (
                  <code>Only valid for NFT Username winners</code>
                )}
              </div>
              {input === "FREE" && <Donate />}
            </>
          )}
          {(new_wallet !== null || logged_in !== null) &&
            input !== "" &&
            (donation !== null || input === "TYRON" || input === "ZIL") && (
              <div style={{ marginTop: "10%" }}>
                <button className={styles.button} onClick={handleSubmit}>
                  Buy <span className={styles.username}>{user?.name}</span> NFT
                  Username
                </button>
                {input === "TYRON" && (
                  <p className={styles.gascost}>Gas: around 13 ZIL</p>
                )}
                {input === "ZIL" && (
                  <p className={styles.gascost}>Gas: around 20 ZIL</p>
                )}
                {input === "FREE" && (
                  <p className={styles.gascost}>Gas: around 5.5 ZIL</p>
                )}
              </div>
            )}
        </>
      )}
      {txID !== "" && (
        <code>
          Transaction ID:{" "}
          <a
            href={`https://viewblock.io/zilliqa/tx/${txID}?network=${net}`}
            rel="noreferrer"
            target="_blank"
          >
            {txID.slice(0, 11)}...
          </a>
        </code>
      )}
      {error !== "" && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export default Component;
