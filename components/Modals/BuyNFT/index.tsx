import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import * as tyron from "tyron";
import {
  setTxId,
  setTxStatusLoading,
  updateLoginInfoUsername,
  updateLoginInfoZilpay,
} from "../../../src/app/actions";
import { RootState } from "../../../src/app/reducers";
import CloseIcon from "../../../src/assets/icons/ic_cross.svg";
import InfoIcon from "../../../src/assets/icons/info_yellow.svg";
import styles from "./styles.module.scss";
import Image from "next/image";
import { $user, updateUser } from "../../../src/store/user";
import { $net, updateNet } from "../../../src/store/wallet-network";
import {
  updateModalTx,
  updateModalDashboard,
  updateShowZilpay,
} from "../../../src/store/modal";
import { useStore } from "effector-react";
import * as zcrypto from "@zilliqa-js/crypto";
import { toast } from "react-toastify";
import { ZilPayBase } from "../../ZilPay/zilpay-base";
import { updateTxList } from "../../../src/store/transactions";
import { $donation, updateDonation } from "../../../src/store/donation";
import { $buyInfo, updateBuyInfo } from "../../../src/store/buyInfo";
import { $modalBuyNft, updateModalBuyNft } from "../../../src/store/modal";
import { fetchAddr } from "../../SearchBar/utils";
import { AddFunds, Donate } from "../../";

function Component() {
  const dispatch = useDispatch();
  const Router = useRouter();
  const user = useStore($user);
  const net = useStore($net);
  const donation = useStore($donation);
  const buyInfo = useStore($buyInfo);
  const modalBuyNft = useStore($modalBuyNft);
  const username = $user.getState()?.name;
  const loginInfo = useSelector((state: RootState) => state.modal);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [inputAddr, setInputAddr] = useState("");
  const [legend, setLegend] = useState("save");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(false);

  const handleOnChangeRecipient = (event: { target: { value: any } }) => {
    setInputAddr("");
    updateDonation(null);
    console.log(donation);
    updateBuyInfo({
      recipientOpt: event.target.value,
      anotherAddr: "",
      currency: undefined,
      currentBalance: 0,
      isEnough: false,
    });
  };

  const handleConnect = React.useCallback(async () => {
    try {
      const wallet = new ZilPayBase();
      const zp = await wallet.zilpay();
      const connected = await zp.wallet.connect();

      const network = zp.wallet.net;
      updateNet(network);

      const address = zp.wallet.defaultAccount;

      if (connected && address) {
        dispatch(updateLoginInfoZilpay(address));
        updateShowZilpay(true);
        updateModalDashboard(true);
      }

      const cache = window.localStorage.getItem(
        String(zp.wallet.defaultAccount?.base16)
      );
      if (cache) {
        updateTxList(JSON.parse(cache));
      }
    } catch (err) {
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
  }, [dispatch]);

  const handleInputAddr = (event: { target: { value: any } }) => {
    setLegend("save");
    setInputAddr(event.target.value);
  };

  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      validateInputAddr();
    }
  };

  const validateInputAddr = () => {
    try {
      const addr = zcrypto.fromBech32Address(inputAddr);
      updateBuyInfo({
        recipientOpt: buyInfo?.recipientOpt,
        anotherAddr: addr,
      });
      setLegend("saved");
    } catch (error) {
      try {
        zcrypto.toChecksumAddress(inputAddr);
        updateBuyInfo({
          recipientOpt: buyInfo?.recipientOpt,
          anotherAddr: inputAddr,
        });
        setLegend("saved");
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

  const handleOnChangePayment = async (event: { target: { value: any } }) => {
    updateDonation(null);

    const payment = event.target.value;
    updateBuyInfo({
      recipientOpt: buyInfo?.recipientOpt,
      anotherAddr: buyInfo?.anotherAddr,
      currency: payment,
      currentBalance: 0,
      isEnough: false,
    });

    const paymentOptions = async (id: string) => {
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
        init_addr!,
        "services"
      );
      const services = await tyron.SmartUtil.default.intoMap(
        get_services.result.services
      );
      try {
        token_addr = services.get(id);
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
            const _currency = tyron.Currency.default.tyron(id.toLowerCase());
            updateBuyInfo({
              recipientOpt: buyInfo?.recipientOpt,
              anotherAddr: buyInfo?.anotherAddr,
              currency: payment,
              currentBalance: balance / _currency.decimals,
            });
            let price: number;
            switch (id.toLowerCase()) {
              case "xsgd":
                price = 14;
                break;
              case "pil":
                price = 12;
                break;
              default:
                price = 10;
                break;
            }
            if (balance >= price * _currency.decimals) {
              updateBuyInfo({
                recipientOpt: buyInfo?.recipientOpt,
                anotherAddr: buyInfo?.anotherAddr,
                currency: payment,
                currentBalance: balance / _currency.decimals,
                isEnough: true,
              });
            }
          }
        } catch (error) {
          toast.error("Your logged-in address has no balance.", {
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
      } catch (error) {
        toast.warning("Buy NFT: Not able to fetch balance.", {
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
      setLoadingBalance(false);
    };
    const id = payment.toLowerCase();
    if (id !== "free") {
      paymentOptions(id);
    } else {
      updateBuyInfo({
        recipientOpt: buyInfo?.recipientOpt,
        anotherAddr: buyInfo?.anotherAddr,
        currency: payment,
        currentBalance: 0,
        isEnough: true,
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const zilpay = new ZilPayBase();
      const tx_params = Array();

      const tx_id = {
        vname: "id",
        type: "String",
        value: buyInfo?.currency?.toLowerCase(),
      };
      tx_params.push(tx_id);

      const tx_username = {
        vname: "username",
        type: "String",
        value: username,
      };
      tx_params.push(tx_username);

      let addr: tyron.TyronZil.TransitionValue;
      if (buyInfo?.recipientOpt === "ADDR") {
        addr = await tyron.TyronZil.default.OptionParam(
          tyron.TyronZil.Option.some,
          "ByStr20",
          buyInfo?.anotherAddr
        );
      } else {
        addr = await tyron.TyronZil.default.OptionParam(
          tyron.TyronZil.Option.none,
          "ByStr20"
        );
      }

      const tx_addr = {
        vname: "addr",
        type: "Option ByStr20",
        value: addr,
      };
      tx_params.push(tx_addr);

      /*
      let tx_amount = {
        vname: "amount",
        type: "Uint128",
        value: "0",
      };
      tx_params.push(tx_amount);*/

      // let tyron_ = await tyron.TyronZil.default.OptionParam(
      //   tyron.TyronZil.Option.none,
      //   "Uint128"
      // );
      const tyron_: tyron.TyronZil.TransitionValue =
        await tyron.Donation.default.tyron(donation!);
      const tx_tyron = {
        vname: "tyron",
        type: "Option Uint128",
        value: tyron_,
      };
      tx_params.push(tx_tyron);
      const _amount = String(donation);

      let tx = await tyron.Init.default.transaction(net);

      toast.info(`You're about to buy the NFT Username ${username}!`, {
        position: "top-center",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      updateModalBuyNft(false);
      dispatch(setTxStatusLoading("true"));
      updateModalTx(true);
      await zilpay
        .call({
          contractAddress: loginInfo.address,
          transition: "BuyNftUsername",
          params: tx_params,
          amount: _amount,
        })
        .then(async (res) => {
          dispatch(setTxId(res.ID));
          dispatch(setTxStatusLoading("submitted"));

          tx = await tx.confirm(res.ID);
          if (tx.isConfirmed()) {
            dispatch(setTxStatusLoading("confirmed"));
            setTimeout(() => {
              window.open(
                `https://devex.zilliqa.com/tx/${res.ID}?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                }api.zilliqa.com`
              );
            }, 1000);
            dispatch(updateLoginInfoUsername(username!));
            updateBuyInfo(null);
            Router.push(`/${username}`);
          } else if (tx.isRejected()) {
            dispatch(setTxStatusLoading("failed"));
          }
        })
        .catch((err) => {
          throw err;
        });
    } catch (error) {
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
    }
    updateDonation(null);
  };

  const spinner = (
    <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
  );

  if (!modalBuyNft) {
    return null;
  }

  return (
    <>
      <div className={styles.outerWrapper}>
        <div
          className={styles.containerClose}
          onClick={() => updateModalBuyNft(false)}
        />
        <div className={styles.container}>
          <div className={styles.innerContainer}>
            <div className={styles.closeIcon}>
              <Image
                alt="close-ico"
                src={CloseIcon}
                onClick={() => {
                  updateModalBuyNft(false);
                  Router.push("/");
                }}
              />
            </div>
            <div className={styles.contentWrapper}>
              <h3 className={styles.headerInfo}>buy this nft username</h3>
              <div className={styles.usernameInfoWrapper}>
                <h2 className={styles.usernameInfoYellow}>
                  {user?.name.length! > 20
                    ? `${user?.name.slice(0, 8)}...${user?.name.slice(-8)}`
                    : user?.name}
                </h2>
                <h2 className={styles.usernameInfo}>is available</h2>
              </div>
              {loginInfo.address === null ? (
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <p style={{ marginTop: "1%" }}>To continue:&nbsp;</p>
                  <button className="button" onClick={handleConnect}>
                    <p>LOG IN</p>
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: "14px" }}>
                    You have logged in with the following SSI:
                  </p>
                  <p className={styles.loginAddress}>
                    {loginInfo.address !== null ? (
                      <>
                        {loginInfo.username ? (
                          `${loginInfo.username}.did`
                        ) : (
                          <a
                            className={styles.x}
                            href={`https://devex.zilliqa.com/address/${loginInfo.address
                              }?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                              }api.zilliqa.com`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <span className={styles.x}>
                              did:tyron:zil:main:{loginInfo.address}
                            </span>
                          </a>
                        )}
                      </>
                    ) : (
                      <></>
                    )}
                  </p>
                  <div className={styles.selectWrapper}>
                    <div style={{ width: "100%" }}>
                      <div style={{ display: "flex" }}>
                        <p style={{ fontSize: "20px" }}>Select recipient</p>
                        <div
                          className={styles.icoInfo}
                          onClick={() => setInfo(!info)}
                        >
                          <Image alt="info-ico" src={InfoIcon} />{" "}
                        </div>
                      </div>
                      {info && (
                        <p style={{ fontSize: "12px", marginTop: "-5%" }}>
                          The recipient of a username can be your SSI or another
                          address of your choice. Either way, please note that
                          your SSI&apos;s Decentralized Identifier (DID) will be
                          the controller of the username.
                        </p>
                      )}
                      <select
                        className={styles.select}
                        onChange={handleOnChangeRecipient}
                        value={buyInfo?.recipientOpt}
                      >
                        <option value=""></option>
                        <option value="SSI">This SSI</option>
                        <option value="ADDR">Another address</option>
                      </select>
                    </div>
                    <div className={styles.paymentWrapper}>
                      {buyInfo?.recipientOpt === "SSI" ||
                        (buyInfo?.recipientOpt === "ADDR" &&
                          buyInfo?.anotherAddr !== "") ? (
                        <>
                          <div style={{ display: "flex" }}>
                            <p style={{ fontSize: "20px" }}>Select payment</p>
                          </div>
                          <select
                            className={styles.select}
                            onChange={handleOnChangePayment}
                            value={buyInfo?.currency}
                          >
                            <option value=""></option>
                            <option value="TYRON">10 TYRON</option>
                            {/* <option value="$SI">10 $SI</option>
                            <option value="zUSDT">10 zUSDT</option>
                            <option value="XSGD">14 XSGD</option> */}
                            <option value="PIL">12 PIL</option>
                            <option value="FREE">Free</option>
                          </select>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  {buyInfo?.recipientOpt == "ADDR" ? (
                    buyInfo?.anotherAddr !== "" ? (
                      <p style={{ marginTop: "3%" }}>
                        Recipient address:{" "}
                        {zcrypto.toBech32Address(buyInfo?.anotherAddr!)}
                      </p>
                    ) : (
                      <div className={styles.inputAddrWrapper}>
                        <input
                          type="text"
                          style={{ marginRight: "3%" }}
                          onChange={handleInputAddr}
                          onKeyPress={handleOnKeyPress}
                          placeholder="Type address"
                          autoFocus
                        />
                        <button
                          onClick={validateInputAddr}
                          className={
                            legend === "save"
                              ? "button primary"
                              : "button secondary"
                          }
                        >
                          <p>{legend}</p>
                        </button>
                      </div>
                    )
                  ) : (
                    <></>
                  )}
                  {buyInfo?.currency !== undefined && (
                    <>
                      {buyInfo?.currency !== "FREE" &&
                        <div className={styles.balanceInfoWrapepr}>
                          <p className={styles.balanceInfo}>
                            Your SSI has a current balance of
                          </p>
                          {loadingBalance ? (
                            <div style={{ marginLeft: "2%" }}>{spinner}</div>
                          ) : (
                            <p className={styles.balanceInfoYellow}>
                              &nbsp;{buyInfo?.currentBalance} {buyInfo?.currency}
                            </p>
                          )}
                        </div>
                      }
                      {buyInfo?.currency !== undefined && !loadingBalance && (
                        <>
                          {buyInfo?.isEnough ? (
                            <>
                              {donation === null ? (
                                <Donate />
                              ) : (
                                <>
                                  <div
                                    style={{
                                      width: "fit-content",
                                      marginTop: "10%",
                                      textAlign: "center",
                                    }}
                                  >
                                    <button
                                      className="button"
                                      onClick={handleSubmit}
                                    >
                                      <strong style={{ color: "#ffff32" }}>
                                        {loading ? spinner : "BUY NFT USERNAME"}
                                      </strong>
                                    </button>
                                  </div>
                                  <h5
                                    style={{
                                      marginTop: "3%",
                                      color: "lightgrey",
                                    }}
                                  >
                                    Gas AROUND 14 ZIL
                                  </h5>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <p style={{ color: "red" }}>
                                Not enough balance to buy an NFT username
                              </p>
                              <AddFunds type="buy" coin={buyInfo?.currency} />
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Component;
