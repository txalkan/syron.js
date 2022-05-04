import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { useDispatch } from "react-redux";
import React, { useState, useCallback, useRef } from "react";
import { $net } from "../../../../../src/store/wallet-network";
import { Donate } from "../../../..";
import * as zcrypto from "@zilliqa-js/crypto";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import { $donation, updateDonation } from "../../../../../src/store/donation";
import { $contract } from "../../../../../src/store/contract";
import {
  updateModalTx,
  $selectedCurrency,
  updateModalWithdrawal,
} from "../../../../../src/store/modal";
import { ZilPayBase } from "../../../../ZilPay/zilpay-base";
import { setTxStatusLoading, setTxId } from "../../../../../src/app/actions";
import { fetchAddr } from "../../../../SearchBar/utils";

function Component() {
  const callbackRef = useCallback((inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);
  const searchInput = useRef(null);

  const dispatch = useDispatch();
  const net = useStore($net);
  const donation = useStore($donation);
  const contract = useStore($contract);
  const currency = useStore($selectedCurrency);

  const [input, setInput] = useState(0); // the amount to transfer
  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("");
  const [inputB, setInputB] = useState("");
  const [input2, setInput2] = useState(""); // the amount to transfer
  const [source, setSource] = useState("");
  const [recipientType, setRecipientType] = useState("");

  const [legend, setLegend] = useState("continue");
  const [button, setButton] = useState("button primary");
  const [hideDonation, setHideDonation] = useState(true);
  const [hideSubmit, setHideSubmit] = useState(true);

  const handleOnChange = (event: { target: { value: any } }) => {
    setSource(event.target.value);
  };

  const handleOnChangeRecipientType = (event: { target: { value: any } }) => {
    setUsername("");
    setDomain("");
    setHideDonation(true);
    setHideSubmit(true);
    setLegend("continue")
    setRecipientType(event.target.value);
  };

  const handleOnChangeB = (event: { target: { value: any } }) => {
    setInputB(event.target.value);
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
      if (input_ === 0) {
        toast.error("The amount cannot be zero.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          toastId: 2,
        });
      } else {
        setInput(input_);
      }
    } else {
      toast.error("The input is not a number.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        toastId: 3,
      });
    }
  };

  const handleInput2 = (event: { target: { value: any } }) => {
    setInput2("");
    setHideDonation(true);
    setHideSubmit(true);
    setLegend("continue");
    setButton("button primary");
    let input = event.target.value;
    try {
      input = zcrypto.fromBech32Address(input);
      setInput2(input);
    } catch (error) {
      try {
        input = zcrypto.toChecksumAddress(input);
        setInput2(input);
      } catch {
        toast.error("Wrong address format.", {
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
    }
  };
  const handleOnKeyPress2 = async ({
    key,
  }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleSave();
    }
  };

  const handleSave = async () => {
    if (input === 0) {
      toast.error("The amount cannot be zero.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        toastId: 2,
      });
    } else if (input2 === "") {
      toast.error("The recipient address cannot be null.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        toastId: 3,
      });
    } else {
      if (currency === "ZIL" && inputB === "") {
        toast.error("Choose the type of recipient.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          toastId: 4,
        });
      } else {
        setLegend("saved");
        setButton("button");
        setHideDonation(false);
        setHideSubmit(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (contract !== null) {
      const zilpay = new ZilPayBase();
      const _currency = tyron.Currency.default.tyron(currency!, input);
      const txID = _currency.txID;
      const amount = _currency.amount;

      let beneficiary
      if (source === "DIDxWallet" && recipientType === "username") {
        beneficiary = {
          constructor: tyron.TyronZil.BeneficiaryConstructor.NFTUsername,
          username: username,
          domain: domain
        };
      } else {
        beneficiary = {
          constructor: tyron.TyronZil.BeneficiaryConstructor.Recipient,
          addr: input2,
        };
      }

      try {
        switch (source) {
          case "DIDxWallet":
            let donation_ = donation;
            if (donation_ === null) {
              donation_ = 0;
            }
            const tyron_ = await tyron.Donation.default.tyron(donation_);

            const addr = contract.addr;
            let tx_params: unknown;
            switch (txID) {
              case "SendFunds":
                {
                  let tag = "";
                  if (inputB === "contract") {
                    tag = "AddFunds";
                  }
                  tx_params = await tyron.TyronZil.default.SendFunds(
                    addr,
                    tag,
                    beneficiary,
                    String(amount),
                    tyron_
                  );
                }
                break;
              default:
                tx_params = await tyron.TyronZil.default.Transfer(
                  addr,
                  currency!.toLowerCase(),
                  beneficiary,
                  String(amount),
                  tyron_
                );
                break;
            }

            toast.info(
              `You're about to transfer ${input} ${currency} to
              ${zcrypto.toBech32Address(input2)}`,
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

            dispatch(setTxStatusLoading("true"));
            updateModalTx(true);
            let tx = await tyron.Init.default.transaction(net);
            await zilpay
              .call({
                contractAddress: addr,
                transition: txID,
                params: tx_params as unknown as Record<string, unknown>[],
                amount: String(donation),
              })
              .then(async (res: any) => {
                dispatch(setTxId(res.ID));
                dispatch(setTxStatusLoading("submitted"));
                tx = await tx.confirm(res.ID);
                if (tx.isConfirmed()) {
                  dispatch(setTxStatusLoading("confirmed"));
                  updateDonation(null);
                  updateModalWithdrawal(false);
                  window.open(
                    `https://devex.zilliqa.com/tx/${res.ID
                    }?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                    }api.zilliqa.com`
                  );
                } else if (tx.isRejected()) {
                  updateModalWithdrawal(false);
                  dispatch(setTxStatusLoading("failed"));
                }
              })
              .catch((err: any) => {
                dispatch(setTxStatusLoading("idle"));
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
              const token_addr = services_.get(currency!.toLowerCase());

              const tx_params = Array();
              const tx_to = {
                vname: "to",
                type: "ByStr20",
                value: input2,
              };
              tx_params.push(tx_to);

              const amount_ = {
                vname: "amount",
                type: "Uint128",
                value: String(amount),
              };
              tx_params.push(amount_);

              if (token_addr !== undefined) {
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
                dispatch(setTxStatusLoading("true"));
                updateModalTx(true);
                let tx = await tyron.Init.default.transaction(net);
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
                      dispatch(setTxStatusLoading("confirmed"));
                      updateDonation(null);
                      updateModalWithdrawal(false);
                      setTimeout(() => {
                        window.open(
                          `https://devex.zilliqa.com/tx/${res.ID
                          }?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                          }api.zilliqa.com`
                        );
                      }, 1000);
                    } else if (tx.isRejected()) {
                      updateModalWithdrawal(false);
                      dispatch(setTxStatusLoading("failed"));
                    }
                  })
                  .catch((err) => {
                    dispatch(setTxStatusLoading("idle"));
                    throw err;
                  });
              } else {
                throw new Error("Token not supported yet.");
              }
            }
            break;
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
      }
    } else {
      toast.warning("Reload contract.", {
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

  const handleInputUsername = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(value.toLowerCase());
  };

  const handleOnChangeDomain = (event: { target: { value: any } }) => {
    setDomain(event.target.value);
  };

  const handleContinue = () => {
    setLegend("saved");
    setButton("button");
    setHideDonation(false);
    setHideSubmit(false);
  }

  return (
    <div>
      <div className={styles.container}>
        <select style={{ width: "70%" }} onChange={handleOnChange}>
          <option value="">Select source</option>
          <option value="DIDxWallet">DIDxWallet</option>
          <option value="ZilPay">ZilPay</option>
        </select>
      </div>
      {currency !== "" && source !== "" && (
        <>
          <div className={styles.container}>
            <code>{currency}</code>
            <input
              ref={callbackRef}
              style={{ width: "40%" }}
              type="text"
              placeholder="Type amount"
              onChange={handleInput}
              autoFocus
            />
          </div>
          <p style={{ textAlign: "left", marginTop: "10%" }}>Recipient:</p>
          {currency === "ZIL" && (
            <div className={styles.container}>
              <select style={{ width: "60%" }} onChange={handleOnChangeB}>
                <option value="">Select type:</option>
                <option value="contract">Smart contract</option>
                <option value="EOA">Regular address</option>
              </select>
            </div>
          )}
          {/* @todo-i-checked when source = DIDxWallet =>
              recipient can be username.domain
              then:
              const beneficiary = {
              constructor: tyron.TyronZil.BeneficiaryConstructor.NftUsername,
              username: user?.name,
              domain: user?.domain
            };
          */}
          {source === "DIDxWallet" &&
            <div className={styles.container}>
              <select style={{ width: "70%" }} onChange={handleOnChangeRecipientType}>
                <option value="">Select recipient type</option>
                <option value="addr">Address</option>
                <option value="username">Username</option>
              </select>
            </div>
          }
          {recipientType === "username" &&
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
              <select style={{ width: "30%" }} onChange={handleOnChangeDomain}>
                <option value="">Domain</option>
                <option value="did">.did</option>
                <option value="defi">.defi</option>
              </select>
              <button onClick={handleContinue}
                className={button}>
                {legend}
              </button>
            </div>
          }
          {source !== "DIDxWallet" || (source === "DIDxWallet" && recipientType === "addr") ? (
            <div className={styles.containerInput}>
              <input
                ref={callbackRef}
                type="text"
                style={{ width: "100%" }}
                placeholder="Type beneficiary address"
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
                  handleSave();
                }}
              />
            </div>
          ) : <></>}
        </>
      )}
      {!hideDonation && source === "DIDxWallet" && <Donate />}
      {!hideSubmit && (donation !== null || source == "ZilPay") && (
        <div
          style={{
            marginTop: "10%",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <button className={styles.button} onClick={handleSubmit}>
            Transfer{" "}
            <span className={styles.x}>
              {input} {currency}
            </span>
          </button>
          {currency === "ZIL" && (
            <h5 style={{ marginTop: "3%", color: "lightgrey" }}>
              gas around 2 ZIL
            </h5>
          )}
          {currency !== "ZIL" && (
            <h5 style={{ marginTop: "3%", color: "lightgrey" }}>
              gas around 4-6 ZIL
            </h5>
          )}
        </div>
      )}
    </div>
  );
}

export default Component;
