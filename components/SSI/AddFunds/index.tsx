import React, { useState, useCallback, useEffect } from "react";
import { useStore } from "effector-react";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import * as zcrypto from "@zilliqa-js/crypto";
import { useDispatch, useSelector } from "react-redux";
import { $donation, updateDonation } from "../../../src/store/donation";
import { $user } from "../../../src/store/user";
import { OriginatorAddress, Donate } from "../..";
import { ZilPayBase } from "../../ZilPay/zilpay-base";
import styles from "./styles.module.scss";
import { $net } from "../../../src/store/wallet-network";
import { $contract, updateContract } from "../../../src/store/contract";
import {
  $originatorAddress,
  updateOriginatorAddress,
} from "../../../src/store/originatorAddress";
import { fetchAddr, resolve } from "../../SearchBar/utils";
import { setTxStatusLoading, setTxId } from "../../../src/app/actions";
import { $doc, updateDoc } from "../../../src/store/did-doc";
import { RootState } from "../../../src/app/reducers";
import { $buyInfo, updateBuyInfo } from "../../../src/store/buyInfo";
import { updateModalAddFunds, updateModalTx } from "../../../src/store/modal";

interface InputType {
  type: string;
  coin?: string;
}

function Component(props: InputType) {
  const { type, coin } = props;
  const callbackRef = useCallback((inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);
  const dispatch = useDispatch();
  const user = useStore($user);
  const username = user?.name;
  const domain = user?.domain;
  const contract = useStore($contract);
  const doc = useStore($doc);
  const donation = useStore($donation);
  const net = useStore($net);
  const buyInfo = useStore($buyInfo);
  const loginInfo = useSelector((state: RootState) => state.modal);
  const originator_address = useStore($originatorAddress);

  let coin_: string = "";
  if (coin !== undefined) {
    coin_ = coin;
  }

  const [currency, setCurrency] = useState(coin_);
  const [input, setInput] = useState(0); // the amount to transfer
  const [legend, setLegend] = useState("continue");
  const [button, setButton] = useState("button primary");

  const [hideDonation, setHideDonation] = useState(true);
  const [hideSubmit, setHideSubmit] = useState(true);
  const [loggedInbalance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    // getContract();
    if (
      Number(doc?.version.slice(8, 9)) < 4 &&
      (doc?.version.slice(0, 4) !== "init" ||
        doc?.version.slice(0, 3) !== "dao")
    ) {
      toast.info(`Feature unavailable. Upgrade ${username}'s SSI.`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        toastId: 7,
      });
    } else {
      // if (balance === 0 && type === "modal") {
      //   paymentOptions(currency);
      // }
      if (currency !== "") {
        paymentOptions(currency.toLowerCase());
      }
    }
  });

  const fetchBalance_ = async (id: string) => {
    try {
      setLoadingBalance(true);
      let token_addr: string;
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

      token_addr = services.get(id);
      const balances = await init.API.blockchain.getSmartContractSubState(
        token_addr,
        "balances"
      );
      const balances_ = await tyron.SmartUtil.default.intoMap(
        balances.result.balances
      );
      const balance_didxwallet = balances_.get(loginInfo.address.toLowerCase());
      if (balance_didxwallet !== undefined) {
        const _currency = tyron.Currency.default.tyron(id);
        setBalance(balance_didxwallet / _currency.decimals);
      }
    } catch (error) {
      setLoadingBalance(false);
      toast.error(String(error), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        toastId: 5,
      });
    }
  };

  const getContract = async () => {
    try {
      await fetchAddr({
        net,
        _username: user?.name!,
        _domain: user?.domain!,
      })
        .then(async (addr) => {
          updateContract({ addr: addr });
          await resolve({ net, addr })
            .then(async (result) => {
              updateDoc({
                did: result.did,
                version: result.version,
                doc: result.doc,
                dkms: result.dkms,
                guardians: result.guardians,
              });
              return result.version;
            })
            .catch(() => {
              throw new Error("Not able to resolve DID.");
            });
        })
        .catch(() => {
          throw new Error("Not able to update contract address.");
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
        theme: "dark",
        toastId: 5,
      });
    }
  };

  const paymentOptions = async (id: string) => {
    try {
      setLoadingBalance(true);

      // Fetch token address
      let token_addr: string;
      let network = tyron.DidScheme.NetworkNamespace.Mainnet;
      if (net === "testnet") {
        network = tyron.DidScheme.NetworkNamespace.Testnet;
      }
      const init = new tyron.ZilliqaInit.default(network);
      await fetchAddr({
        net,
        _username: "init",
        _domain: "did",
      })
        .then(async (init_addr) => {
          return await init.API.blockchain.getSmartContractSubState(
            init_addr,
            "services"
          );
        })
        .then(async (get_services) => {
          return await tyron.SmartUtil.default.intoMap(
            get_services.result.services
          );
        })
        .then(async (services) => {
          // Get token address
          token_addr = services.get(id);
          const balances = await init.API.blockchain.getSmartContractSubState(
            token_addr,
            "balances"
          );
          return await tyron.SmartUtil.default.intoMap(
            balances.result.balances
          );
        })
        .then((balances_) => {
          // Get balance of the logged in address
          const balance = balances_.get(loginInfo.address.toLowerCase());
          if (balance !== undefined) {
            const _currency = tyron.Currency.default.tyron(id);
            updateBuyInfo({
              recipientOpt: buyInfo?.recipientOpt,
              currency: currency,
              currentBalance: balance / _currency.decimals,
            });
            if (balance >= 10e12) {
              updateBuyInfo({
                recipientOpt: buyInfo?.recipientOpt,
                anotherAddr: buyInfo?.anotherAddr,
                currency: currency,
                currentBalance: balance / _currency.decimals,
                isEnough: true,
              }); // @todo-i this condition depends on the cost per currency
            }
            setBalance(balance / _currency.decimals);
            setLoadingBalance(false);
          }
        })
        .catch(() => {
          throw new Error("Not able to fetch balance.");
        });
    } catch (error) {
      setLoadingBalance(false);
      toast.error(String(error), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        toastId: 5,
      });
    }
  };

  const fetchBalance = async () => {
    updateBuyInfo({
      recipientOpt: buyInfo?.recipientOpt,
      currency: currency,
      currentBalance: 0,
      isEnough: false,
    });

    paymentOptions(currency.toLowerCase());
  };

  const handleOnChange = (event: { target: { value: any } }) => {
    setInput(0);
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
    // @todo-i add loading/spinner
    try {
      if (originator_address?.value !== null) {
        const zilpay = new ZilPayBase();
        const _currency = tyron.Currency.default.tyron(currency, input);
        const txID = _currency.txID;
        const amount = _currency.amount;

        let tx = await tyron.Init.default.transaction(net);

        dispatch(setTxStatusLoading("true"));
        updateModalTx(true);
        switch (originator_address?.value!) {
          case "zilpay":
            switch (txID) {
              case "SendFunds":
                await zilpay
                  .call({
                    contractAddress: contract!.addr,
                    transition: "AddFunds",
                    params: [],
                    amount: String(input),
                  })
                  .then(async (res) => {
                    dispatch(setTxId(res.ID));
                    dispatch(setTxStatusLoading("submitted"));
                    tx = await tx.confirm(res.ID);
                    if (tx.isConfirmed()) {
                      dispatch(setTxStatusLoading("confirmed"));
                      updateDonation(null);
                      setTimeout(() => {
                        window.open(
                          `https://devex.zilliqa.com/tx/${
                            res.ID
                          }?network=https%3A%2F%2F${
                            net === "mainnet" ? "" : "dev-"
                          }api.zilliqa.com`
                        );
                      }, 1000);
                      if (type === "modal") {
                        updateModalAddFunds(false);
                      }
                    } else if (tx.isRejected()) {
                      dispatch(setTxStatusLoading("failed"));
                    }
                  })
                  .catch((err) => {
                    throw err;
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
                      init_addr!,
                      "services"
                    );
                  const services_ = await tyron.SmartUtil.default.intoMap(
                    services.result.services
                  );
                  const token_addr = services_.get(currency.toLowerCase());

                  const tx_params = Array();
                  const tx_to = {
                    vname: "to",
                    type: "ByStr20",
                    value: contract!.addr,
                  };
                  tx_params.push(tx_to);

                  const amount_ = {
                    vname: "amount",
                    type: "Uint128",
                    value: String(amount),
                  };
                  tx_params.push(amount_);

                  if (token_addr !== undefined) {
                    toast.info(
                      `You're about to transfer ${input} ${currency}`,
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
                        params: tx_params,
                        amount: "0",
                      })
                      .then(async (res) => {
                        dispatch(setTxId(res.ID));
                        dispatch(setTxStatusLoading("submitted"));
                        tx = await tx.confirm(res.ID);
                        if (tx.isConfirmed()) {
                          fetchBalance().then(() => {
                            dispatch(setTxStatusLoading("confirmed"));
                            updateDonation(null);
                            setTimeout(() => {
                              window.open(
                                `https://devex.zilliqa.com/tx/${
                                  res.ID
                                }?network=https%3A%2F%2F${
                                  net === "mainnet" ? "" : "dev-"
                                }api.zilliqa.com`
                              );
                            }, 1000);
                          });
                          if (type === "modal") {
                            updateModalAddFunds(false);
                          }
                        } else if (tx.isRejected()) {
                          dispatch(setTxStatusLoading("failed"));
                        }
                      })
                      .catch((err) => {
                        throw err;
                      });
                  } else {
                    throw new Error("Token not supported yet.");
                  }
                }
                break;
            }
            break;
          default: {
            const addr = originator_address?.value;
            const beneficiary = {
              constructor: tyron.TyronZil.BeneficiaryConstructor.NftUsername,
              username: user?.name,
              domain: user?.domain,
            };

            if (donation !== null) {
              const tyron_ = await tyron.Donation.default.tyron(donation);
              let tx_params = Array();
              switch (txID) {
                case "SendFunds":
                  tx_params = await tyron.TyronZil.default.SendFunds(
                    addr!,
                    "AddFunds",
                    beneficiary,
                    String(amount),
                    tyron_
                  );
                  break;
                default:
                  tx_params = await tyron.TyronZil.default.Transfer(
                    addr!,
                    currency.toLowerCase(),
                    beneficiary,
                    String(amount),
                    tyron_
                  );
                  break;
              }
              const _amount = String(donation);

              toast.info(`You're about to transfer ${input} ${currency}`, {
                position: "top-center",
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
              });
              await zilpay
                .call({
                  contractAddress: originator_address?.value!,
                  transition: txID,
                  params: tx_params as unknown as Record<string, unknown>[],
                  amount: _amount,
                })
                .then(async (res) => {
                  dispatch(setTxId(res.ID));
                  dispatch(setTxStatusLoading("submitted"));
                  tx = await tx.confirm(res.ID);
                  if (tx.isConfirmed()) {
                    fetchBalance().then(() => {
                      dispatch(setTxStatusLoading("confirmed"));
                      updateDonation(null);
                      setTimeout(() => {
                        window.open(
                          `https://devex.zilliqa.com/tx/${
                            res.ID
                          }?network=https%3A%2F%2F${
                            net === "mainnet" ? "" : "dev-"
                          }api.zilliqa.com`
                        );
                      }, 1000);
                      if (type === "modal") {
                        updateModalAddFunds(false);
                      }
                    });
                  } else if (tx.isRejected()) {
                    dispatch(setTxStatusLoading("failed"));
                  }
                })
                .catch((err) => {
                  throw err;
                });
            }
          }
        }
      }
    } catch (error) {
      updateModalTx(false);
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
    updateOriginatorAddress(null);
  };

  return (
    <>
      {type === "buy" ? (
        <div>
          <p style={{ fontSize: "20px", color: "silver" }}>ADD FUNDS</p>
          {loginInfo.address !== null && (
            <p className={styles.addFundsToAddress}>
              Add funds into{" "}
              {loginInfo?.username
                ? `${loginInfo?.username}.did`
                : zcrypto.toBech32Address(loginInfo?.address)}{" "}
              from your SSI or ZilPay
            </p>
          )}
          <OriginatorAddress />
          {/** @todo-i reset the following when changing originator addr selector */}
          {originator_address?.value && (
            <>
              {originator_address.value === "zilpay" ? (
                <div className={styles.originatorInfoWrapper}>
                  <p className={styles.originatorType}>Zilpay wallet:&nbsp;</p>
                  <p className={styles.originatorAddr}>
                    {loginInfo.zilAddr?.bech32}
                  </p>
                </div>
              ) : (
                <>
                  {originator_address.username === undefined && (
                    <p style={{ marginBottom: "10%" }}>
                      About to send funds from{" "}
                      {zcrypto.toBech32Address(originator_address?.value)}
                    </p>
                  )}
                </>
              )}
              {
                <>
                  {currency !== "" && (
                    <div className={styles.fundsWrapper}>
                      <code>{currency}</code>
                      <input
                        ref={callbackRef}
                        style={{
                          width: "100%",
                          marginLeft: "2%",
                          marginRight: "2%",
                        }}
                        type="text"
                        onChange={handleInput}
                        onKeyPress={handleOnKeyPress}
                        autoFocus
                      />
                      <input
                        type="button"
                        className={button}
                        value={legend}
                        onClick={() => {
                          handleSave();
                        }}
                      />
                    </div>
                  )}
                </>
              }
            </>
          )}
          {!hideSubmit &&
            (donation !== null || originator_address?.value == "zilpay") && (
              <>
                {input > 0 && (
                  <>
                    <div className={styles.transferInfoWrapper}>
                      <p className={styles.transferInfo}>TRANSFER:&nbsp;</p>
                      <p className={styles.transferInfoYellow}>
                        {input} {currency}&nbsp;
                      </p>
                      <p className={styles.transferInfo}>TO&nbsp;</p>
                      <p className={styles.transferInfoYellow}>
                        {loginInfo.username
                          ? `${loginInfo.username}.did`
                          : zcrypto.toBech32Address(loginInfo.address)}
                      </p>
                    </div>
                    <div
                      style={{
                        width: "fit-content",
                        marginTop: "10%",
                        textAlign: "center",
                      }}
                    >
                      <button className="button" onClick={handleSubmit}>
                        <strong style={{ color: "#ffff32" }}>proceed</strong>
                      </button>
                    </div>
                    <h5 style={{ marginTop: "3%", color: "lightgrey" }}>
                      Gas AROUND 4 -7 ZIL
                    </h5>
                  </>
                )}
              </>
            )}
        </div>
      ) : (
        <div className={type !== "modal" ? styles.wrapperNonBuy : ""}>
          <h2 className={styles.title}>Add funds</h2>
          <>
            {originator_address === null && (
              <>
                <p>
                  You can add funds into {username}.{domain} from your SSI or
                  ZilPay.
                </p>
                <OriginatorAddress />
              </>
            )}
            {loginInfo.zilAddr === null && (
              <p style={{ color: "lightgrey" }}>To continue, log in.</p>
            )}
            {originator_address?.username && (
              <p style={{ marginBottom: "10%" }}>
                About to send funds from {originator_address?.username}.did
              </p>
            )}
            {originator_address?.value && (
              <>
                {originator_address.value === "zilpay" ? (
                  <div>
                    <p style={{ marginBottom: "10%" }}>
                      About to send funds from ZilPay
                    </p>
                    <p className={styles.originatorAddr}>
                      ZilPay wallet:{" "}
                      <a
                        style={{ textTransform: "lowercase" }}
                        href={`https://devex.zilliqa.com/address/${
                          loginInfo.zilAddr?.bech32
                        }?network=https%3A%2F%2F${
                          net === "mainnet" ? "" : "dev-"
                        }api.zilliqa.com`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {loginInfo.zilAddr?.bech32}
                      </a>
                    </p>
                  </div>
                ) : (
                  <>
                    {originator_address.username === undefined && (
                      <p className={styles.originatorAddr}>
                        About to send funds from{" "}
                        {zcrypto.toBech32Address(originator_address?.value)}
                      </p>
                    )}
                  </>
                )}
                {/* {type === "modal" && (
                  <p>
                    Balance:{" "}
                    {loadingBalance ? (
                      <i
                        className="fa fa-lg fa-spin fa-circle-notch"
                        aria-hidden="true"
                      ></i>
                    ) : (
                      `${balance} ${currency}`
                    )}
                  </p>
                )} */}
                {
                  <>
                    <h3 style={{ marginTop: "7%" }}>
                      Add funds into{" "}
                      {type === "buy" ? (
                        <span className={styles.username}>
                          {loginInfo.username
                            ? `${loginInfo.username}.did`
                            : zcrypto.toBech32Address(loginInfo.address)}
                        </span>
                      ) : (
                        <span className={styles.username}>
                          {username}.{domain}
                        </span>
                      )}
                    </h3>
                    {type !== "modal" && (
                      <div className={styles.container}>
                        <select
                          style={{ width: "70%" }}
                          onChange={handleOnChange}
                        >
                          <option value="">Select coin</option>
                          <option value="TYRON">TYRON</option>
                          <option value="$SI">$SI</option>
                          <option value="ZIL">ZIL</option>
                          <option value="zUSDT">zUSDT</option>
                          <option value="XSGD">XSGD</option>
                          <option value="PIL">PIL</option>
                          <option value="gZIL">gZIL</option>
                          <option value="XCAD">XCAD</option>
                          <option value="PORT">PORT</option>
                          <option value="SWTH">SWTH</option>
                          <option value="Lunr">Lunr</option>
                          <option value="CARB">CARB</option>
                          <option value="ZWAP">ZWAP</option>
                          <option value="SCO">SCO</option>
                          <option value="XIDR">XIDR</option>
                          <option value="zWBTC">zWBTC</option>
                          <option value="zETH">zETH</option>
                          <option value="FEES">FEES</option>
                          <option value="BLOX">BLOX</option>
                        </select>
                      </div>
                    )}
                    <div className={styles.container}>
                      {currency !== "" && (
                        <>
                          <code>{currency}</code>
                          <input
                            ref={callbackRef}
                            style={{ width: "40%" }}
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
            {!hideDonation && originator_address?.value !== "zilpay" && (
              <Donate />
            )}
            {!hideSubmit &&
              (donation !== null || originator_address?.value == "zilpay") && (
                <div style={{ marginTop: "14%", textAlign: "center" }}>
                  <button className="button" onClick={handleSubmit}>
                    <p>
                      Transfer{" "}
                      <span className={styles.x}>
                        {input} {currency}
                      </span>{" "}
                      <span style={{ textTransform: "lowercase" }}>to</span>{" "}
                      {type === "buy" ? (
                        <span className={styles.username}>
                          {loginInfo.username
                            ? `${loginInfo.username}.did`
                            : zcrypto.toBech32Address(loginInfo.address)}
                        </span>
                      ) : (
                        <span className={styles.username}>
                          {username}.{domain}
                        </span>
                      )}
                    </p>
                  </button>
                  <h5 style={{ marginTop: "3%", color: "lightgrey" }}>
                    {currency === "ZIL" ? (
                      <p>gas around 1-2 ZIL</p>
                    ) : (
                      <p>gas around 4-7 ZIL</p>
                    )}
                  </h5>
                </div>
              )}
          </>
        </div>
      )}
    </>
  );
}

export default Component;
