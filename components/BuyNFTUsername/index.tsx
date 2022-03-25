import React, { useState, useCallback } from "react";
import * as tyron from "tyron";
import * as zcrypto from "@zilliqa-js/crypto";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { ZilPayBase } from "../ZilPay/zilpay-base";
import { $new_wallet, updateNewWallet } from "../../src/store/new-wallet";
import { $user } from "../../src/store/user";
import { LogIn, Donate } from "..";
import { $loggedIn } from "../../src/store/loggedIn";
import { $net } from "../../src/store/wallet-network";
import { $donation, updateDonation } from "../../src/store/donation";
import { fetchAddr } from "../SearchBar/utils";

function Component() {
  const callbackRef = useCallback((inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);
  const Router = useRouter();
  const username = $user.getState()?.name;
  const new_wallet = useStore($new_wallet);
  const logged_in = useStore($loggedIn);
  const net = useStore($net);
  const donation = useStore($donation);

  const [currency, setCurrency] = useState("");
  const [tokenAddr, setTokenAddr] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isEnough, setIsEnough] = useState(true);
  const [inputA, setInputA] = useState(0); // add funds input


  const [txID, setTxID] = useState("");
  const [loading, setLoading] = useState(false); /** @todo load until tx gets confirmed */

  const handleOnChange = async (event: { target: { value: any } }) => {
    setCurrency("");
    setInputA(0);
    updateDonation(null);
    setIsEnough(true);

    const selection = (event.target.value).toLowerCase();
    setCurrency(selection);

    let network = tyron.DidScheme.NetworkNamespace.Mainnet;
    if (net === "testnet") {
      network = tyron.DidScheme.NetworkNamespace.Testnet;
    }
    const init = new tyron.ZilliqaInit.default(network);
    const init_addr = await fetchAddr({
      net,
      _username: "init",
      _domain: "did",
    });
    const services =
      await init.API.blockchain.getSmartContractSubState(
        init_addr,
        "services"
      );
    const services_ = await tyron.SmartUtil.default.intoMap(
      services.result.services
    );
    switch (selection) {
      case '$si':
        try {
          const token_addr = services_.get('$si000');
          setTokenAddr(token_addr);
          const balances = await init.API.blockchain.getSmartContractSubState(
            token_addr,
            "balances"
          );
          const balances_ = await tyron.SmartUtil.default.intoMap(
            balances.result.balances
          );
          const balance = balances_.get(logged_in?.address!);
          setCurrentBalance(balance);
          if (balance < 10e12) {
            setIsEnough(false)
          }
        } catch (error) {
          toast.error('It could not fetch balances.', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'dark',
          });
        }
        break;
    }
  };

  const handleInputA = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputA(0);
    let input = event.target.value;
    const re = /,/gi;
    input = input.replace(re, ".");
    const input_ = Number(input);
    if (!isNaN(input_)) {
      if (input_ === 0) {
        toast.error("The amount cannot be zero.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      } else {
        setInputA(input_);
      }
    } else {
      toast.error("The input it not a number.", {
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

  const handleAddFunds = async () => {
    const zilpay = new ZilPayBase();
    const txID = "Transfer";

    // Set amount
    let amount = 0;
    const addr_name = currency.toLowerCase();
    switch (addr_name) {
      case "$si":
        amount = inputA * 1e12;
        break;
      case "xsgd":
        amount = inputA * 1e6;
        break;
      case "zusdt":
        amount = inputA * 1e6;
        break;
      case "pil":
        amount = inputA * 1e6;
        break;
    }

    const params = Array();
    const to = {
      vname: "to",
      type: "ByStr20",
      value: '@todo contract.addr',
    };
    params.push(to);
    const amount_ = {
      vname: "amount",
      type: "Uint128",
      value: String(amount),
    };
    params.push(amount_);

    toast.info(`You're about to transfer ${inputA} ${currency}.`, {
      position: "top-center",
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
    });
    await zilpay
      .call({
        contractAddress: tokenAddr,
        transition: txID,
        params: params,
        amount: "0",
      })
      .then((res) => {
        setTxID(res.ID);
      })
      .catch((err) => {
        toast.error(String(err), {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      });
  };

  const handleSubmit = async () => {
    try {
      toast.info(`You're about to buy the NFT Username ${username}!`, {
        position: "top-center",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
      const zilpay = new ZilPayBase();
      const id = currency.toLowerCase();

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
          position: "top-center",
          autoClose: 6000,
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

      await zilpay.call({
        contractAddress: addr,
        transition: "BuyNFTUsername",
        params: params,
        amount: _amount,
      })
        .then(res => {
          setTxID(res.ID);
          updateNewWallet(null);
          updateDonation(null);

          /** @todo the timeout has to be as long as the loading/spinner */
          setTimeout(() => {
            window.open(`https://viewblock.io/zilliqa/tx/${txID}?network=${net}`);
            Router.push(`/${username}`)
          }, 5000);
        })
        .catch(err => { throw err })
    } catch (error) {
      const err = error as string;
      toast.error(err, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "10%" }}>
      <h1 style={{ color: 'silver', marginBottom: "10%" }}>
        Buy <span className={styles.username}>{username}</span> NFT Username
      </h1>
      {txID === "" && (
        <div>
          {new_wallet === null && logged_in === null && (
            <div style={{ textAlign: "center" }}>
              <p style={{ marginBottom: '7%' }}>
                You can buy this NFT Username with your self-sovereign identity:
              </p>
              <LogIn />
            </div>
          )}
          {new_wallet !== null && logged_in === null && (
            <p>
              You have a new self-sovereign identity at this address:{" "}
              <a
                href={`https://viewblock.io/zilliqa/address/${new_wallet}?network=${net}`}
                rel="noreferrer"
                target="_blank"
              >
                <span className={styles.x}>
                  {zcrypto.toBech32Address(new_wallet)}
                </span>
              </a>.
            </p>
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
              <p>
                <select className={styles.container} onChange={handleOnChange}>
                  <option value="">Select payment</option>
                  <option value="$SI">$SI</option>
                  <option value="XSGD">XSGD</option>
                  <option value="zUSDT">zUSDT</option>
                  <option value="PIL">PIL</option>
                  <option value="FREE">Free</option>
                </select>
                {
                  currency === "$SI" &&
                  <>
                    <h4>Cost: 10 $SI</h4>
                    <p>
                      Your SSI current balance is: {currentBalance / 1e12} $SI
                    </p>
                  </>
                }
                {currency === "XSGD" && <h4>Cost: 14 XSGD</h4>}
                {currency === "zUSDT" && <h4>Cost: 10 zUSDT</h4>}
                {currency === "PIL" && <h4>Cost: 12 PIL</h4>}
                {currency === "FREE" && (
                  <h4>Only valid for NFT Username winners!</h4>
                )}
              </p>
              {
                currency === "FREE" &&
                <Donate />
              }
              {
                !isEnough &&
                <>
                  <p>
                    It is not enough. Add funds from your ZilPay wallet.
                  </p>
                  <input
                    ref={callbackRef}
                    style={{ width: "30%" }}
                    type="text"
                    placeholder="Type amount"
                    onChange={handleInputA}
                    autoFocus
                  />
                  <div style={{ marginTop: '14%', textAlign: 'center' }}>
                    <button
                      className='button'
                      onClick={handleAddFunds}
                    >
                      <p>
                        Add funds
                      </p>
                    </button>
                  </div>
                </>
              }
            </>
          )}
          {(new_wallet !== null || logged_in !== null) &&
            currency !== "" &&
            (donation !== null || currency !== "FREE") && (
              <div style={{ marginTop: '14%', textAlign: 'center' }}>
                <button
                  className='button'
                  onClick={handleSubmit}
                >
                  <p>
                    Buy <span className={styles.username}>{username}</span> NFT Username
                  </p>
                </button>
                {currency !== "FREE" && (
                  <h5 style={{ marginTop: '3%' }}>around 13 ZIL</h5>
                )}
                {currency === "FREE" && (
                  <h5 style={{ marginTop: '3%' }}>around 5.5 ZIL</h5>
                )}
              </div>
            )}
        </div>
      )}
      {loading ? <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i> : <></>}
    </div>
  );
}

export default Component;
