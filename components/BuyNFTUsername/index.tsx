import React, { useState, useCallback } from "react";
import * as tyron from "tyron";
import * as zcrypto from "@zilliqa-js/crypto";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { ZilPayBase } from "../ZilPay/zilpay-base";
import { $new_ssi } from "../../src/store/new-ssi";
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
  const net = useStore($net);
  const donation = useStore($donation);

  const username = $user.getState()?.name;
  const new_ssi = useStore($new_ssi);
  const logged_in = useStore($loggedIn);
  const [contract, setContract] = useState(''); // SSI contract address (DIDxWallet)

  const [currency, setCurrency] = useState('');
  const [addrID, setAddrID] = useState('');
  const [tokenAddr, setTokenAddr] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isEnough, setIsEnough] = useState(false);
  const [inputA, setInputA] = useState(0); // Add funds input

  const [txID, setTxID] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOnChange = async (event: { target: { value: any } }) => {
    setCurrency('');
    setTokenAddr('');
    setCurrentBalance(0);
    setIsEnough(false);
    setInputA(0);
    updateDonation(null);

    const selection = event.target.value;
    setCurrency(selection);

    let addr: string;
    if (new_ssi !== null) {
      addr = new_ssi;
    } else {
      addr = logged_in?.address!;
    }
    setContract(addr);

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
    const get_services = await init.API.blockchain.getSmartContractSubState(
      init_addr,
      "services"
    );
    const services = await tyron.SmartUtil.default.intoMap(
      get_services.result.services
    );
    let id: string;
    let token_addr: string;
    switch (selection) {
      case 'TYRON':
        try {
          id = 'tyron0';
          token_addr = services.get(id.toLowerCase());
          const balances = await init.API.blockchain.getSmartContractSubState(
            token_addr,
            "balances"
          );

          // @todo-checked review intoMap because it doesnt seem to work
          const balances_ = await tyron.SmartUtil.default.intoMap(
            balances.result.balances
          );


          const balance = balances_.get(addr.toLowerCase());
          console.log("WOY", balance)
          if (balance !== undefined) {
            setCurrentBalance(balance);
            if (balance >= 10e12) {
              setIsEnough(true)
            }
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
      case '$SI':
        try {
          id = '$si000'
          token_addr = services.get(id);
          const balances = await init.API.blockchain.getSmartContractSubState(
            token_addr,
            "balances"
          );
          const balances_ = await tyron.SmartUtil.default.intoMap(
            balances.result.balances
          );
          const balance = balances_.get(logged_in?.address?.toLowerCase()!);
          if (balance !== undefined) {
            setCurrentBalance(balance);
            if (balance >= 10e12) {
              setIsEnough(true)
            }
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
    setAddrID(id!); setTokenAddr(token_addr!);
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
      toast.error("The input is not a number.", {
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
    setLoading(true);
    if (inputA !== 0) {
      try {
        const zilpay = new ZilPayBase();

        const tx_params = Array();
        const to = {
          vname: "to",
          type: "ByStr20",
          value: contract,
        };
        tx_params.push(to);

        // Set amount
        let amount = 0;
        switch (currency) {
          case "TYRON":
            amount = inputA * 1e12;
            break;
          case "$SI":
            amount = inputA * 1e12;
            break;
          case "XSGD":
            amount = inputA * 1e6;
            break;
          case "zUSDT":
            amount = inputA * 1e6;
            break;
          case "PIL":
            amount = inputA * 1e6;
            break;
        }
        const tx_amount = {
          vname: "amount",
          type: "Uint128",
          value: String(amount),
        };
        tx_params.push(tx_amount);

        toast.info(`You're about to add funds into your SSI.`, {
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
            transition: 'Transfer',
            params: tx_params as unknown as Record<string, unknown>[],
            amount: '0',
          })
          .then((res) => {
            setTxID(res.ID);
          })
          .catch((err) => {
            throw err
          });
      } catch (error) {
        toast.error(String(error), {
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
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
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

      const username_ = addrID.concat(username!);
      const tx_params = Array();
      const tx_username = {
        vname: "username",
        type: "String",
        value: username_,
      };
      tx_params.push(tx_username);
      /*
      const id_ = {
        vname: "id",
        type: "String",
        value: id,
      };
      tx_params.push(id_);
*/
      const guardianship = await tyron.TyronZil.default.OptionParam(
        tyron.TyronZil.Option.some,
        "ByStr20",
        contract
      );
      const tx_guardianship = {
        vname: "guardianship",
        type: "Option ByStr20",
        value: guardianship,
      };
      tx_params.push(tx_guardianship);

      let tx_amount = {
        vname: "amount",
        type: "Uint128",
        value: "0",
      };
      let _amount = String(0);
      tx_params.push(tx_amount);

      let tyron_ = await tyron.TyronZil.default.OptionParam(
        tyron.TyronZil.Option.none,
        "Uint128"
      );
      if (addrID === "free00" && donation !== null) {
        /**
         * @todo the following get repeated in many transactions when creating the tyron_ tx input, so we could take it out to the tyron.js lib
         */
        const donation_ = String(donation * 1e12);
        switch (donation) {
          case 0:
            break;
          default:
            tyron_ = await tyron.TyronZil.default.OptionParam(
              tyron.TyronZil.Option.some,
              "Uint128",
              donation_
            );
            break;
        }
        _amount = String(donation);
      }
      const tx_tyron = {
        vname: "tyron",
        type: "Option Uint128",
        value: tyron_,
      };
      tx_params.push(tx_tyron);

      await zilpay.call({
        contractAddress: contract,
        transition: 'BuyNFTUsername',
        params: tx_params,
        amount: _amount,
      })
        .then(res => {
          setTxID(res.ID);
          updateDonation(null);

          /** @todo-(pending tx still return error) hold on until transaction gets confirmed (explore res)
           * 
          */
          setTimeout(() => {
            window.open(`https://viewblock.io/zilliqa/tx/${txID}?network=${net}`);
            Router.push(`/${username}`)
          }, 5000);
        })
        .catch(err => { throw err })
    } catch (error) {
      toast.error(String(error), {
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
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "10%" }}>
      <h1 style={{ color: 'silver', marginBottom: "10%" }}>
        Buy <span className={styles.username}>{username}</span> NFT Username
      </h1>
      <>
        {new_ssi === null && logged_in === null && (
          <div style={{ textAlign: "center" }}>
            <p style={{ marginBottom: '7%' }}>
              You can buy this NFT Username with your self-sovereign identity:
            </p>
            <LogIn />
          </div>
        )}
        {new_ssi !== null
          ? <>
            <p>
              You have a new self-sovereign identity at this address:
            </p>
            <p>
              <a
                href={`https://viewblock.io/zilliqa/address/${new_ssi}?network=${net}`}
                rel="noreferrer"
                target="_blank"
              >
                <span className={styles.x}>
                  {zcrypto.toBech32Address(new_ssi)}
                </span>
              </a>
            </p>
          </>
          : <>
            {
              logged_in !== null &&
              <>
                <p>
                  You are logged in with:
                </p>
                {
                  logged_in.username
                    ? (
                      <p>
                        <span className={styles.x}>{logged_in?.username}.did</span>
                      </p>
                    )
                    : (
                      <p>
                        <a
                          className={styles.x}
                          href={`https://viewblock.io/zilliqa/address/${logged_in?.address}?network=${net}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <span className={styles.x}>
                            {zcrypto.toBech32Address(logged_in.address!)}
                          </span>
                        </a>
                      </p>
                    )
                }
              </>
            }
          </>
        }
        {(new_ssi !== null || logged_in !== null) && (
          <>
            <select className={styles.container} onChange={handleOnChange}>
              <option value=''>Select payment</option>
              <option value='TYRON'>TYRON</option>
              <option value="$SI">$SI</option>
              <option value="XSGD">XSGD</option>
              <option value="zUSDT">zUSDT</option>
              <option value="PIL">PIL</option>
              <option value="FREE">Free</option>
            </select>
            {
              currency === "TYRON" &&
              <>
                <h4>Cost: 10 TYRON</h4>
                <p>
                  Your SSI has a current balance of {currentBalance / 1e12} TYRON.
                </p>
              </>
            }
            {
              currency === "$SI" &&
              <>
                <h4>Cost: 10 $SI</h4>
                <p>
                  Your SSI has a current balance of {currentBalance / 1e12} $SI.
                </p>
              </>
            }
            {currency === "XSGD" && <h4>Cost: 14 XSGD</h4>}
            {currency === "zUSDT" && <h4>Cost: 10 zUSDT</h4>}
            {currency === "PIL" && <h4>Cost: 12 PIL</h4>}
            {currency === "FREE" && (
              <h4>Only valid for NFT Username winners!</h4>
            )}
            {
              currency === "FREE" &&
              <Donate />
            }
            {
              currency !== '' && (
                isEnough
                  ? <>
                    {(donation !== null || currency !== "FREE") && (
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
                  </>
                  : <>
                    <p>
                      Not enough balance to buy an NFT Username.
                    </p>
                    <h3>
                      Add funds from your ZilPay wallet
                    </h3>
                    <p className={styles.container}>
                      <input
                        ref={callbackRef}
                        style={{ width: "30%" }}
                        type="text"
                        placeholder="Type amount"
                        value={inputA}
                        onChange={handleInputA}
                        autoFocus
                      />
                      {currency}
                      <button
                        className='button'
                        onClick={handleAddFunds}
                      >
                        <p>
                          Add funds
                        </p>
                      </button>
                    </p>
                  </>
              )}
          </>
        )}
      </>
      {loading ? <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i> : <></>}
    </div>
  );
}

export default Component;
