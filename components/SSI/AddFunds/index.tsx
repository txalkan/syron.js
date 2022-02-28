import React, { useState } from "react";
import { useStore } from "effector-react";
import * as tyron from "tyron";
import { toast } from "react-toastify";
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

function Component() {
  const Router = useRouter();
  const user = useStore($user);
  const username = user?.name;
  const domain = user?.domain;
  const contract = useStore($contract);
  const logged_in = useStore($loggedIn);
  const donation = useStore($donation);
  const net = useStore($net);
  const zil_address = useStore($zil_address);

  const [error, setError] = useState("");
  const [txID, setTxID] = useState("");
  const [currency, setCurrency] = useState("");

  const [input, setInput] = useState(0); // the amount to transfer
  const [legend, setLegend] = useState("continue");
  const [button, setButton] = useState("button primary");

  const [hideDonation, setHideDonation] = useState(true);
  const [hideSubmit, setHideSubmit] = useState(true);

  const handleOnChange = (event: { target: { value: any } }) => {
    setError("");
    setHideDonation(true);
    setHideSubmit(true);
    setLegend("continue");
    setButton("button primary");
    setCurrency(event.target.value);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
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
      setError("the input it not a number");
    }
  };
  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleSave();
    }
  };
  const handleSave = async () => {
    if (error === "") {
      if (input === 0) {
        setError("the amount cannot be zero");
      } else {
        setLegend("saved");
        setButton("button");
        setHideDonation(false);
        setHideSubmit(false);
      }
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (contract !== null && logged_in?.address !== undefined) {
      const zilpay = new ZilPayBase();
      let txID = "Transfer";
      let amount = 0;

      const addr_name = currency.toLowerCase();
      switch (addr_name) {
        case "zil":
          if (logged_in?.address === "zilpay") {
            txID = "AddFunds";
          } else {
            txID = "SendFunds";
          }
          amount = input * 1e12;
          break;
        case "tyron":
          amount = input * 1e12;
          break;
        case "xcad":
          amount = input * 1e18;
          break;
        case "xsgd":
          amount = input * 1e6;
          break;
        case "port":
          amount = input * 1e4;
          break;
        case "gzil":
          amount = input * 1e15;
          break;
        case "swth":
          amount = input * 1e8;
          break;
        case "lunr":
          amount = input * 1e4;
          break;
        case "carb":
          amount = input * 1e8;
          break;
        case "zwap":
          amount = input * 1e12;
          break;
        case "zusdt":
          amount = input * 1e6;
          break;
        case "sco":
          amount = input * 1e4;
          break;
        case "xidr":
          amount = input * 1e6;
          break;
        case "zwbtc":
          amount = input * 1e8;
          break;
        case "zeth":
          amount = input * 1e18;
          break;
        case "fees":
          amount = input * 1e4;
          break;
        case "blox":
          amount = input * 1e2;
          break;
      }

      try {
        switch (logged_in?.address) {
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
                    .then((res) => {
                      window.open(
                        `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                      );
                      setTxID(res.ID);
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
                    const token_addr = services_.get(addr_name);

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
                      toast.info(`You're about to submit a transaction to transfer ${input} ${currency} to ${username}.${domain} from your ZilPay EOA.`, {
                        position: "top-left",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                      });
                      await zilpay
                        .call({
                          contractAddress: token_addr,
                          transition: txID,
                          params: params,
                          amount: "0",
                        })
                        .then((res) => {
                          setTxID(res.ID);
                        })
                        .catch((err) => setError(String(err)));
                    } else {
                      setError("token not supported yet");
                    }
                  }
                  break;
              }
            }
            break;
          default: {
            const addr = logged_in.address;
            const beneficiary = {
              constructor: tyron.TyronZil.BeneficiaryConstructor.Recipient,
              addr: contract?.addr,
            };

            if (donation !== null) {
              let tyron_;
              const donation_ = String(donation * 1e12);
              switch (donation) {
                case 0:
                  tyron_ = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.none,
                    "Uint128"
                  );
                  break;
                default:
                  tyron_ = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.some,
                    "Uint128",
                    donation_
                  );
                  break;
              }

              let tx_params;
              switch (txID) {
                case "SendFunds":
                  {
                    tx_params = await tyron.TyronZil.default.SendFunds(
                      addr,
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
                      addr,
                      addr_name,
                      beneficiary,
                      String(amount),
                      tyron_
                    );
                  }
                  break;
              }
              const _amount = String(donation);

              toast.info(`You're about to submit a transaction to transfer ${input} ${currency} to ${username}.${domain}. You're also donating ${donation} ZIL to donate.did, which gives you ${donation} xPoints!`, {
                position: "top-left",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
              });
              await zilpay
                .call({
                  contractAddress: logged_in.address,
                  transition: txID,
                  params: tx_params as unknown as Record<string, unknown>[],
                  amount: _amount, //@todo-ux would u like to top up your wallet as well?
                })
                .then((res) => {
                  setTxID(res.ID);
                  updateDonation(null);
                })
                .catch((err) => setError(String(err)));
            }
          }
        }
      } catch (error) {
        setError("issue found");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '100px', textAlign: 'center' }}>
      <h1 className={styles.headline}>
        <span style={{ textTransform: "lowercase" }}>{username}&apos;s</span> SSI
      </h1>
      <button
        type="button"
        className={styles.buttonBack}
        onClick={() => {
          Router.push(`/${username}`);
        }}
      >
        <p className={styles.buttonBackText}>back</p>
      </button>
      <h2 className={styles.title}>Add funds</h2>
      {txID === "" && (
        <>
          {logged_in === null && (
            <>
              <h4>
                You can send funds to {username} from your SSI or ZilPay.
              </h4>
              <AddFundsLogIn />
            </>
          )}
          {zil_address === null && (
            <h5 style={{ color: 'lightgrey' }}>
              To continue, connect your ZilPay wallet.
            </h5>
          )}
          {logged_in?.username && (
            <h3 style={{ marginBottom: "10%" }}>
              You are logged in with{" "}
              <span className={styles.username2}>
                {logged_in?.username}.did
              </span>
            </h3>
          )}
          {logged_in?.address && (
            <>
              {logged_in.username === undefined && (
                <h3 style={{ marginBottom: "10%" }}>
                  You are logged in with{" "}
                  <span className={styles.username2}>{logged_in?.address}</span>
                </h3>
              )}
              {logged_in.address === "zilpay" && (
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
                    <span className={styles.x}>
                      {username}.{domain}
                    </span>{" "}
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
          {!hideDonation && logged_in?.address !== "zilpay" && <Donate />}
          {!hideSubmit &&
            (donation !== null || logged_in?.address == "zilpay") && (
              <div style={{ marginTop: "10%" }}>
                <button className={styles.button} onClick={handleSubmit}>
                  Transfer{" "}
                  <span className={styles.x}>
                    {input} {currency}
                  </span>{" "}
                  <span style={{ textTransform: "lowercase" }}>to</span>{" "}
                  <span className={styles.username}>
                    {username}.{domain}
                  </span>
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
      {error !== "" && <p className={styles.error}>Error: {error}</p>}
    </div>
  );
}

export default Component;
