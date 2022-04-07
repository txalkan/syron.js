import React, { useState, useCallback } from "react";
import { useStore } from "effector-react";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import * as zcrypto from "@zilliqa-js/crypto";
import { randomBytes, toChecksumAddress } from "@zilliqa-js/crypto";
import { useDispatch } from "react-redux";
import { HTTPProvider } from "@zilliqa-js/core";
import { Transaction } from "@zilliqa-js/account";
import { BN, Long } from "@zilliqa-js/util";
import { $donation, updateDonation } from "../../../src/store/donation";
import { $loggedIn } from "../../../src/store/loggedIn";
import { $user } from "../../../src/store/user";
import { AddFundsLogIn, Donate } from "../..";
import { ZilPayBase } from "../../ZilPay/zilpay-base";
import styles from "./styles.module.scss";
import { $net } from "../../../src/store/wallet-network";
import { $contract } from "../../../src/store/contract";
import { $zil_address } from "../../../src/store/zil_address";
import { fetchAddr } from "../../SearchBar/utils";
import { useRouter } from "next/router";
import Image from "next/image";
import backLogo from "../../../src/assets/logos/left-arrow.png";
import {
  setTxStatusLoading,
  showTxStatusModal,
  setTxId,
  hideTxStatusModal,
} from "../../../src/app/actions";

interface InputType {
  type: string;
  ssi: any;
}

function Component(props: InputType) {
  const { type, ssi } = props;
  const callbackRef = useCallback((inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);
  const Router = useRouter();
  const dispatch = useDispatch();
  const user = useStore($user);
  const username = user?.name;
  const domain = user?.domain;
  const contract = useStore($contract);
  const logged_in = useStore($loggedIn);
  const donation = useStore($donation);
  const net = useStore($net);
  const zil_address = useStore($zil_address);

  const [currency, setCurrency] = useState("");

  const [input, setInput] = useState(0); // the amount to transfer
  const [legend, setLegend] = useState("continue");
  const [button, setButton] = useState("button primary");

  const [hideDonation, setHideDonation] = useState(true);
  const [hideSubmit, setHideSubmit] = useState(true);
  const [localLogin, setLocalLogin] = useState({
    username: null,
    address: null,
  });

  const handleOnChange = (event: { target: { value: any } }) => {
    setHideDonation(true);
    setHideSubmit(true);
    setLegend("continue");
    setButton("button primary");
    setCurrency(event.target.value);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(0);
    setHideDonation(true);
    setHideSubmit(true);
    setLegend("continue");
    setButton("button primary");
    let input = event.target.value;
    const re = /,/gi;
    input = input.replace(re, ".");
    const input_ = Number(input);
    if (!isNaN(input_)) {
      setInput(input_);
    } else {
      toast.error("The input is not a number.", {
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

  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleSave();
    }
  };

  const handleSave = async () => {
    if (input === 0) {
      toast.error("The amount cannot be zero.", {
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
      setLegend("saved");
      setButton("button");
      setHideDonation(false);
      setHideSubmit(false);
    }
  };

  const handleSubmit = async () => {
    if (contract !== null && localLogin?.address !== null) {
      const zilpay = new ZilPayBase();
      const _currency = await tyron.Currency.default.tyron(currency, input);
      const txID = _currency.txID;
      const amount = _currency.amount;
      const addr_name = _currency.addr_name;

      dispatch(setTxStatusLoading("true"));
      dispatch(showTxStatusModal());

      const generateChecksumAddress = () => toChecksumAddress(randomBytes(20));
      let tx = new Transaction(
        {
          version: 0,
          toAddr: generateChecksumAddress(),
          amount: new BN(0),
          gasPrice: new BN(1000),
          gasLimit: Long.fromNumber(1000),
        },
        new HTTPProvider("https://dev-api.zilliqa.com/")
      );

      try {
        switch (localLogin?.address!) {
          case "zilpay":
            {
              switch (txID) {
                case "AddFunds":
                  await zilpay
                    .call({
                      contractAddress: contract.addr,
                      transition: txID,
                      params: [],
                      amount: String(input),
                    })
                    .then(async (res) => {
                      dispatch(setTxId(res.ID));
                      dispatch(setTxStatusLoading("submitted"));
                      try {
                        tx = await tx.confirm(res.ID);
                        if (tx.isConfirmed()) {
                          dispatch(setTxStatusLoading("confirmed"));
                          updateDonation(null);
                          window.open(
                            `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                          );
                        } else if (tx.isRejected()) {
                          dispatch(hideTxStatusModal());
                          dispatch(setTxStatusLoading("idle"));
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
                        dispatch(hideTxStatusModal());
                        throw err;
                      }
                    });
                  break;
                default:
                  {
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
                    const token_addr = services_.get(addr_name!);

                    const params = Array();
                    const to = {
                      vname: "to",
                      type: "ByStr20",
                      value: contract.addr,
                    };
                    params.push(to);
                    const amount_ = {
                      vname: "amount",
                      type: "Uint128",
                      value: String(amount),
                    };
                    params.push(amount_);

                    if (token_addr !== undefined) {
                      toast.info(
                        `You're about to submit a transaction to transfer ${input} ${currency} to ${username}.${domain}.`,
                        {
                          position: "top-center",
                          autoClose: 6000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: "dark",
                        }
                      );
                      await zilpay
                        .call({
                          contractAddress: token_addr,
                          transition: txID,
                          params: params,
                          amount: "0",
                        })
                        .then(async (res) => {
                          dispatch(setTxId(res.ID));
                          dispatch(setTxStatusLoading("submitted"));
                          try {
                            tx = await tx.confirm(res.ID);
                            if (tx.isConfirmed()) {
                              dispatch(setTxStatusLoading("confirmed"));
                              updateDonation(null);
                              window.open(
                                `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                              );
                            } else if (tx.isRejected()) {
                              dispatch(hideTxStatusModal());
                              dispatch(setTxStatusLoading("idle"));
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
                            dispatch(hideTxStatusModal());
                            throw err;
                          }
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
                            theme: "dark",
                          });
                        });
                    } else {
                      toast.error("Token not supported yet.", {
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
                  }
                  break;
              }
            }
            break;
          default: {
            const addr = localLogin.address;
            const beneficiary = {
              constructor: tyron.TyronZil.BeneficiaryConstructor.Recipient,
              addr: contract?.addr,
            };

            if (donation !== null) {
              let tyron_: tyron.TyronZil.TransitionValue;
              tyron_ = await tyron.Donation.default.tyron(donation);

              let tx_params;
              switch (txID) {
                case "SendFunds":
                  {
                    tx_params = await tyron.TyronZil.default.SendFunds(
                      addr!,
                      "AddFunds",
                      beneficiary,
                      String(amount),
                      tyron_
                    );
                  }
                  break;
                default:
                  {
                    tx_params = await tyron.TyronZil.default.Transfer(
                      addr!,
                      addr_name!,
                      beneficiary,
                      String(amount),
                      tyron_
                    );
                  }
                  break;
              }
              const _amount = String(donation);

              toast.info(
                `You're about to submit a transaction to transfer ${input} ${currency} to ${username}.${domain}!`,
                {
                  position: "top-center",
                  autoClose: 6000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "dark",
                }
              );
              await zilpay
                .call({
                  contractAddress: localLogin.address!,
                  transition: txID,
                  params: tx_params as unknown as Record<string, unknown>[],
                  amount: _amount,
                })
                .then(async (res) => {
                  dispatch(setTxId(res.ID));
                  dispatch(setTxStatusLoading("submitted"));
                  try {
                    tx = await tx.confirm(res.ID);
                    if (tx.isConfirmed()) {
                      dispatch(setTxStatusLoading("confirmed"));
                      updateDonation(null);
                      window.open(
                        `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                      );
                    } else if (tx.isRejected()) {
                      dispatch(hideTxStatusModal());
                      dispatch(setTxStatusLoading("idle"));
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
                    dispatch(hideTxStatusModal());
                    throw err;
                  }
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
                    theme: "dark",
                  });
                });
            }
          }
        }
      } catch (error) {
        toast.error("Issue found.", {
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
    }
  };
  const handleSubmitBuy = async () => {
    const zilpay = new ZilPayBase();
    const _currency = await tyron.Currency.default.tyron(currency, input);
    const amount = _currency.amount;
    const addr_name = _currency.addr_name;

    let addr: string;
    const ssi = "zil143faxh7gnxmjtf6qspyzs5c8mrkkpp6jaxjypq";
    if (ssi !== null) {
      addr = ssi;
    } else {
      addr = localLogin?.address!;
    }
    const tx_params = Array();
    const to = {
      vname: "to",
      type: "ByStr20",
      value: addr,
    };
    tx_params.push(to);
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
      theme: "dark",
    });

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
    const services = await init.API.blockchain.getSmartContractSubState(
      init_addr,
      "services"
    );
    const services_ = await tyron.SmartUtil.default.intoMap(
      services.result.services
    );
    const token_addr = services_.get(addr_name!);
    dispatch(setTxStatusLoading("true"));
    dispatch(showTxStatusModal());

    const generateChecksumAddress = () => toChecksumAddress(randomBytes(20));
    let tx = new Transaction(
      {
        version: 0,
        toAddr: generateChecksumAddress(),
        amount: new BN(0),
        gasPrice: new BN(1000),
        gasLimit: Long.fromNumber(1000),
      },
      new HTTPProvider("https://dev-api.zilliqa.com/")
    );
    await zilpay
      .call({
        contractAddress: token_addr,
        transition: "Transfer",
        params: tx_params as unknown as Record<string, unknown>[],
        amount: "0",
      })
      .then(async (res) => {
        dispatch(setTxId(res.ID));
        dispatch(setTxStatusLoading("submitted"));
        try {
          tx = await tx.confirm(res.ID);
          if (tx.isConfirmed()) {
            dispatch(setTxStatusLoading("confirmed"));
            updateDonation(null);
            window.open(
              `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
            );
          } else if (tx.isRejected()) {
            dispatch(hideTxStatusModal());
            dispatch(setTxStatusLoading("idle"));
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
          dispatch(hideTxStatusModal());
          throw err;
        }
      })
      .catch((err) => {
        throw err;
      });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginTop: "100px",
        textAlign: "center",
      }}
    >
      {type !== "buy" && (
        <div style={{ width: "100%" }}>
          <div
            onClick={() => {
              Router.push(`/${username}`);
            }}
            className={styles.backIco}
          >
            <Image width={25} height={25} alt="back-ico" src={backLogo} />
          </div>
          <h1 className={styles.headline}>
            <span style={{ textTransform: "lowercase" }}>
              {username}&apos;s
            </span>{" "}
            SSI
          </h1>
        </div>
      )}
      <h2 className={styles.title}>Add funds</h2>
      <>
        {localLogin.address === null && (
          <>
            {type === "buy" ? (
              <h4>
                You can send funds to{" "}
                {logged_in?.username
                  ? `${logged_in?.username}.did`
                  : zcrypto.toBech32Address(logged_in?.address!)}{" "}
                from your SSI or ZilPay.
              </h4>
            ) : (
              <h4>You can send funds to {username} from your SSI or ZilPay.</h4>
            )}
            <AddFundsLogIn setLocalLogin={setLocalLogin} />
          </>
        )}
        {zil_address === null && (
          <h5 style={{ color: "lightgrey" }}>
            To continue, connect your ZilPay wallet.
          </h5>
        )}
        {localLogin?.username && (
          <h3 style={{ marginBottom: "10%" }}>
            You are logged in with{" "}
            <span className={styles.username2}>{localLogin?.username}.did</span>
          </h3>
        )}
        {localLogin?.address && (
          <>
            {localLogin.username === undefined && (
              <h3 style={{ marginBottom: "10%" }}>
                You are logged in with{" "}
                <span className={styles.username2}>{localLogin?.address}</span>
              </h3>
            )}
            {localLogin.address === "zilpay" && (
              <div>
                <p>
                  ZilPay wallet:{" "}
                  <a
                    style={{ textTransform: "lowercase" }}
                    href={`https://viewblock.io/zilliqa/address/${zil_address?.bech32}?network=${net}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {zil_address?.bech32}
                  </a>
                </p>
              </div>
            )}
            {
              <>
                <h3 style={{ marginTop: "14%" }}>
                  Send{" "}
                  {type === "buy" ? (
                    <span className={styles.username}>
                      {logged_in?.username
                        ? `${logged_in?.username}.did`
                        : zcrypto.toBech32Address(logged_in?.address!)}
                    </span>
                  ) : (
                    <span className={styles.username}>
                      {username}.{domain}
                    </span>
                  )}{" "}
                  a direct transfer:
                </h3>
                <div className={styles.container}>
                  <select style={{ width: "70%" }} onChange={handleOnChange}>
                    <option value="">Select coin</option>
                    <option value="TYRON">TYRON</option>
                    <option value="ZIL">ZIL</option>
                    <option value="XCAD">XCAD</option>
                    <option value="XSGD">SGD</option>
                    <option value="PORT">PORT</option>
                    <option value="gZIL">gZIL</option>
                    <option value="SWTH">SWTH</option>
                    <option value="Lunr">Lunr</option>
                    <option value="CARB">CARB</option>
                    <option value="ZWAP">ZWAP</option>
                    <option value="zUSDT">USD</option>
                    <option value="SCO">SCO</option>
                    <option value="XIDR">IDR</option>
                    <option value="zWBTC">BTC</option>
                    <option value="zETH">ETH</option>
                    <option value="FEES">FEES</option>
                    <option value="BLOX">BLOX</option>
                  </select>
                </div>
                <div className={styles.container}>
                  {currency !== "" && (
                    <>
                      <code>{currency}</code>
                      <input
                        ref={callbackRef}
                        style={{ width: "30%" }}
                        type="text"
                        placeholder="Type amount"
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
                    </>
                  )}
                </div>
              </>
            }
          </>
        )}
        {!hideDonation && localLogin?.address !== "zilpay" && <Donate />}
        {!hideSubmit && (donation !== null || localLogin?.address == "zilpay") && (
          <div style={{ marginTop: "10%" }}>
            <button
              className={button}
              onClick={type === "funds" ? handleSubmit : handleSubmitBuy}
            >
              <p>
                Transfer{" "}
                <span className={styles.x}>
                  {input} {currency}
                </span>{" "}
                <span style={{ textTransform: "lowercase" }}>to</span>{" "}
                {type === "buy" ? (
                  <span className={styles.username}>
                    {logged_in?.username
                      ? `${logged_in?.username}.did`
                      : zcrypto.toBech32Address(logged_in?.address!)}
                  </span>
                ) : (
                  <span className={styles.username}>
                    {username}.{domain}
                  </span>
                )}
              </p>
            </button>
            {currency === "ZIL" && (
              <p className={styles.gascost}>Gas: 1-2 ZIL</p>
            )}
            {currency !== "ZIL" && (
              <p className={styles.gascost}>Gas: 3-6 ZIL</p>
            )}
          </div>
        )}
      </>
    </div>
  );
}

export default Component;
