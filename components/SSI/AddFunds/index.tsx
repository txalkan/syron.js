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
import { $contract } from "../../../src/store/contract";
import {
  $originatorAddress,
  updateOriginatorAddress,
} from "../../../src/store/originatorAddress";
import { fetchAddr } from "../../SearchBar/utils";
import { setTxStatusLoading, setTxId } from "../../../src/app/actions";
import { $doc } from "../../../src/store/did-doc";
import { RootState } from "../../../src/app/reducers";
import { $buyInfo, updateBuyInfo } from "../../../src/store/buyInfo";
import { updateModalTx } from "../../../src/store/modal";

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
  const donation = useStore($donation);
  const net = useStore($net);
  const buyInfo = useStore($buyInfo);
  const zilAddr = useSelector((state: RootState) => state.modal.zilAddr);
  const loginInfo = useSelector((state: RootState) => state.modal);
  const originator_address = useStore($originatorAddress);

  let coin_: string = "";
  if (coin !== undefined) {
    coin_ = coin;
  }

  const doc = useStore($doc);
  const [currency, setCurrency] = useState(coin_);
  const [input, setInput] = useState(0); // the amount to transfer
  const [legend, setLegend] = useState("continue");
  const [button, setButton] = useState("button primary");

  const [hideDonation, setHideDonation] = useState(true);
  const [hideSubmit, setHideSubmit] = useState(true);

  useEffect(() => {
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
      });
    }
  });

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
      if (contract !== null && originator_address?.value !== null) {
        const zilpay = new ZilPayBase();
        const _currency = tyron.Currency.default.tyron(currency, input);
        const txID = _currency.txID;
        const amount = _currency.amount;
        const addr_name = _currency.addr_name;

        let tx = await tyron.Init.default.transaction(net);

        dispatch(setTxStatusLoading("true"));
        updateModalTx(true);
        switch (originator_address?.value!) {
          case "zilpay":
            switch (txID) {
              case "SendFunds":
                await zilpay
                  .call({
                    contractAddress: contract.addr,
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
                          `https://devex.zilliqa.com/tx/${res.ID
                          }?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                          }api.zilliqa.com`
                        );
                      }, 1000);
                    } else if (tx.isRejected()) {
                      dispatch(setTxStatusLoading("failed"));
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
                    }
                  })
                  .catch((error) => {
                    updateModalTx(false);
                    toast.error(String(error), {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "dark",
                    });
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
                      `You're about to transfer ${input} ${currency}.`,
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
                        tx = await tx.confirm(res.ID);
                        if (tx.isConfirmed()) {
                          fetchBalance().then(() => {
                            dispatch(setTxStatusLoading("confirmed"));
                            updateDonation(null);
                            setTimeout(() => {
                              window.open(
                                `https://devex.zilliqa.com/tx/${res.ID
                                }?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                                }api.zilliqa.com`
                              );
                            }, 1000);
                          });
                        } else if (tx.isRejected()) {
                          dispatch(setTxStatusLoading("failed"));
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
                        }
                      })
                      .catch((error) => {
                        updateModalTx(false);
                        toast.error(String(error), {
                          position: "top-right",
                          autoClose: 3000,
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
            break;
          default: {
            const addr = originator_address?.value;
            const beneficiary = {
              constructor: tyron.TyronZil.BeneficiaryConstructor.Recipient,
              addr: contract?.addr,
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
                    addr_name!,
                    beneficiary,
                    String(amount),
                    tyron_
                  );
                  break;
              }
              const _amount = String(donation);

              toast.info(`You're about to transfer ${input} ${currency}.`, {
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
                          `https://devex.zilliqa.com/tx/${res.ID
                          }?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                          }api.zilliqa.com`
                        );
                      }, 1000);
                    });
                  } else if (tx.isRejected()) {
                    dispatch(setTxStatusLoading("failed"));
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
                  }
                })
                .catch((error) => {
                  updateModalTx(false);
                  toast.error(String(error), {
                    position: "top-right",
                    autoClose: 3000,
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
      }
    } catch (error) {
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
      updateModalTx(false);
    }
    updateOriginatorAddress(null);
  };

  const fetchBalance = async () => {
    const selection = currency;
    updateBuyInfo({
      recipientOpt: buyInfo?.recipientOpt,
      currency: selection,
      currentBalance: 0,
      isEnough: false,
    });

    const paymentOptions = async (id: string) => {
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
      try {
        token_addr = services.get(id.toLowerCase());
        const balances = await init.API.blockchain.getSmartContractSubState(
          token_addr,
          "balances"
        );
        const balances_ = await tyron.SmartUtil.default.intoMap(
          balances.result.balances
        );

        try {
          const balance = balances_.get(loginInfo.address.toLowerCase());
          if (balance !== undefined) {
            updateBuyInfo({
              recipientOpt: buyInfo?.recipientOpt,
              currency: selection,
              currentBalance: balance,
            });
            if (balance >= 10e12) {
              updateBuyInfo({
                recipientOpt: buyInfo?.recipientOpt,
                currency: selection,
                currentBalance: balance,
                isEnough: true,
              }); // @todo-i this condition depends on the cost per currency
            }
          }
        } catch (error) {
          // @todo-i improve error handling => balances_.get(addr.toLowerCase()) returns an error when the addr is not in balances_
        }
      } catch (error) {
        toast.error("Not able to fetch balance.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    };
    let addrId = "free00";
    switch (selection) {
      case "TYRON":
        addrId = "tyron0";
        break;
      case "$SI":
        addrId = "$si000";
        break;
      case "XSGD":
        addrId = "xsgd00";
        break;
      case "zUSDT":
        addrId = "zusdt0";
        break;
      case "PIL":
        addrId = "pil000";
        break;
      case "PIL":
        addrId = "pil000";
        break;
    }
    if (addrId !== "free00") {
      paymentOptions(addrId);
    }
  };

  return (
    <>
      {type === "buy" ? (
        <div>
          <p style={{ fontSize: "20px", color: "silver" }}>ADD FUNDS</p>
          <p className={styles.addFundsToAddress}>
            Add funds into{" "}
            {loginInfo?.username
              ? `${loginInfo?.username}.did`
              : zcrypto.toBech32Address(loginInfo?.address)}{" "}
            from your SSI or ZilPay
          </p>
          <OriginatorAddress />
          {/** @todo-i reset the following when changing originator addr selector */}
          {originator_address?.value && (
            <>
              {originator_address.value === "zilpay" ? (
                <div className={styles.originatorInfoWrapper}>
                  <p className={styles.originatorType}>Zilpay wallet:&nbsp;</p>
                  <p className={styles.originatorAddr}>{zilAddr?.bech32}</p>
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
          }}
        >
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
            {zilAddr === null && (
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
                    <p>
                      ZilPay wallet:{" "}
                      <a
                        style={{ textTransform: "lowercase" }}
                        href={`https://devex.zilliqa.com/address/${zilAddr?.bech32
                          }?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                          }api.zilliqa.com`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {zilAddr?.bech32}
                      </a>
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
                      <p>around 1-2 ZIL</p>
                    ) : (
                      <p>around 4-7 ZIL</p>
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
