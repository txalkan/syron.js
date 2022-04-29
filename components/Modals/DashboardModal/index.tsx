import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { useStore } from "effector-react";
import * as zcrypto from "@zilliqa-js/crypto";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { RootState } from "../../../src/app/reducers";
import { $net } from "../../../src/store/wallet-network";
import { $arconnect } from "../../../src/store/arconnect";
import {
  $modalDashboard,
  updateDashboardState,
  updateModalDashboard,
  updateModalNewSsi,
  updateModalTx,
} from "../../../src/store/modal";
import {
  setTxId,
  setTxStatusLoading,
  updateLoginInfoAddress,
  updateLoginInfoUsername,
  updateLoginInfoZilpay,
  updateLoginInfoArAddress,
} from "../../../src/app/actions";
import ZilpayIcon from "../../../src/assets/logos/lg_zilpay.svg";
import ArrowDown from "../../../src/assets/icons/arrow_down_icon.svg";
import ArrowUp from "../../../src/assets/icons/arrow_up_icon.svg";
import LogOffIcon from "../../../src/assets/icons/log_off.svg";
import ArConnectIcon from "../../../src/assets/logos/lg_arconnect.png";
import { fetchAddr } from "../../SearchBar/utils";
import * as tyron from "tyron";
import useArConnect from "../../../src/hooks/useArConnect";
import { updateLoggedIn } from "../../../src/store/loggedIn";
import { ZilPayBase } from "../../ZilPay/zilpay-base";
import { updateBuyInfo } from "../../../src/store/buyInfo";

function Component() {
  const { connect, disconnect } = useArConnect();
  const dispatch = useDispatch();
  const Router = useRouter();
  const loginInfo = useSelector((state: RootState) => state.modal);
  const net = useStore($net);
  const arconnect = useStore($arconnect);
  const modalDashboard = useStore($modalDashboard);
  const [input, setInput] = useState("");
  const [inputB, setInputB] = useState("");
  const [menu, setMenu] = useState("");
  const [subMenu, setSubMenu] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSsi, setLoadingSsi] = useState(false);
  const [didDomain, setDidDomain] = useState(Array());

  const handleInput = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setInput(value.toLowerCase());
  };

  const handleInputB = (event: { target: { value: any } }) => {
    setInputB("");
    let value = event.target.value;
    try {
      value = zcrypto.fromBech32Address(value);
      setInputB(value);
    } catch (error) {
      try {
        value = zcrypto.toChecksumAddress(value);
        setInputB(value);
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

  const resolveUser = async () => {
    setLoading(true);
    await fetchAddr({ net, _username: input, _domain: "did" })
      .then(async (addr) => {
        let network = tyron.DidScheme.NetworkNamespace.Mainnet;
        if (net === "testnet") {
          network = tyron.DidScheme.NetworkNamespace.Testnet;
        }
        const init = new tyron.ZilliqaInit.default(network);
        const state = await init.API.blockchain.getSmartContractState(addr!);
        const get_controller = state.result.controller;
        const controller = zcrypto.toChecksumAddress(get_controller);
        if (controller !== loginInfo.zilAddr?.base16) {
          setLoading(false);
          toast.error(
            `Only ${input}'s DID Controller can log in to ${input}.`,
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            }
          );
        } else {
          connect()
            .then(() => {
              updateLoggedIn({
                username: input,
                address: addr,
              });
              dispatch(updateLoginInfoAddress(addr));
              dispatch(updateLoginInfoUsername(input));
              updateDashboardState("loggedIn");
              updateModalDashboard(false);
              setMenu("");
              setSubMenu("");
              setInput("");
              setInputB("");
              setLoading(false);
            })
            .catch(() => {
              throw new Error("ArConnect is missing.");
            });
        }
      })
      .catch(() => {
        setLoading(false);
        toast.error(`Wrong username.`, {
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
  };

  const resolveAddr = async () => {
    setLoading(true);
    const zilpay = new ZilPayBase();
    await zilpay
      .getSubState(inputB, "controller")
      .then((get_controller) => {
        const controller = zcrypto.toChecksumAddress(get_controller);
        if (controller !== loginInfo.zilAddr?.base16) {
          setLoading(false);
          toast.error(
            `Only ${inputB.slice(
              0,
              7
            )}'s DID Controller can log in to this SSI.`,
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            }
          );
        } else {
          connect()
            .then(() => {
              updateLoggedIn({
                address: inputB,
              });
              dispatch(updateLoginInfoAddress(inputB));
              updateDashboardState("loggedIn");
              updateModalDashboard(false);
              setMenu("");
              setSubMenu("");
              setInput("");
              setInputB("");
            })
            .catch(() => {
              toast.error("ArConnect is missing.", {
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
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
        toast.error(`Wrong format.`, {
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
  };

  const newSsi = async () => {
    try {
      if (loginInfo.zilAddr !== null && net !== null) {
        setLoadingSsi(true);
        if (loginInfo.arAddr === null) {
          await connect();
        } else {
          const zilpay = new ZilPayBase();
          let tx = await tyron.Init.default.transaction(net);
          updateModalDashboard(false);
          dispatch(setTxStatusLoading("true"));
          updateModalTx(true);
          await zilpay
            .deployDid(net, loginInfo.zilAddr?.base16)
            .then(async (deploy: any) => {
              dispatch(setTxId(deploy[0].ID));
              dispatch(setTxStatusLoading("submitted"));

              tx = await tx.confirm(deploy[0].ID);
              if (tx.isConfirmed()) {
                dispatch(setTxStatusLoading("confirmed"));
                setTimeout(() => {
                  window.open(
                    `https://devex.zilliqa.com/tx/${
                      deploy[0].ID
                    }?network=https%3A%2F%2F${
                      net === "mainnet" ? "" : "dev-"
                    }api.zilliqa.com`
                  );
                }, 1000);
                let new_ssi = deploy[1].address;
                new_ssi = zcrypto.toChecksumAddress(new_ssi);
                dispatch(updateLoginInfoAddress(new_ssi));
                updateDashboardState("loggedIn");
                updateModalTx(false);
                updateModalNewSsi(true);
              } else if (tx.isRejected()) {
                throw new Error("Transaction failed.");
              }
            })
            .catch((error) => {
              throw error;
            });
        }
      } else {
        toast.warning("Connect your ZilPay wallet.", {
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
    } catch (error) {
      setLoadingSsi(false);
      dispatch(setTxStatusLoading("failed"));
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
  };

  const continueLogIn = () => {
    // if (modalDashboard && loginInfo.arAddr !== null) {
    //   toast.info(
    //     `Arweave wallet connected to ${loginInfo.arAddr.slice(
    //       0,
    //       6
    //     )}...${loginInfo.arAddr.slice(-6)}`,
    //     {
    //       position: "top-center",
    //       autoClose: 2000,
    //       hideProgressBar: false,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       progress: undefined,
    //       theme: "dark",
    //       toastId: 2,
    //     }
    //   );
    // }
    if (arconnect === null) {
      connect();
    }
    if (input === "") {
      resolveAddr();
    } else {
      resolveUser();
    }
  };

  const logOff = () => {
    disconnect();
    updateLoggedIn(null);
    dispatch(updateLoginInfoAddress(null!));
    dispatch(updateLoginInfoUsername(null!));
    dispatch(updateLoginInfoZilpay(null!));
    updateDashboardState(null);
    dispatch(updateLoginInfoArAddress(null!));
    updateModalDashboard(false);
    updateBuyInfo(null);
    toast.warning("You have logged off", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      toastId: 2,
    });
  };

  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      continueLogIn();
    }
  };

  const menuActive = (val: React.SetStateAction<string>) => {
    if (val === menu) {
      setMenu("");
    } else {
      if (val === "didDomain") {
        let network = tyron.DidScheme.NetworkNamespace.Mainnet;
        if (net === "testnet") {
          network = tyron.DidScheme.NetworkNamespace.Testnet;
        }
        const init = new tyron.ZilliqaInit.default(network);
        init.API.blockchain
          .getSmartContractSubState(loginInfo.address, "did_domain_dns")
          .then((res) => {
            setDidDomain(res.result.did_domain_dns);
            setMenu(val);
          });
      } else {
        setMenu(val);
      }
    }
  };

  const subMenuActive = (val: React.SetStateAction<string>) => {
    if (val === subMenu) {
      setSubMenu("");
    } else {
      setSubMenu(val);
    }
  };

  const spinner = (
    <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
  );

  if (!modalDashboard) {
    return null;
  }

  //@todo-i close icon is missing
  return (
    <>
      <div className={styles.outerWrapper}>
        <div
          className={styles.containerClose}
          onClick={() => updateModalDashboard(false)}
        />
        <div className={styles.container}>
          <div>
            {loginInfo.address !== null ? (
              <>
                <h6 className={styles.title1}>
                  You have logged in with the following SSI:
                </h6>
                <div className={styles.addrWrapper}>
                  {loginInfo.username ? (
                    <p
                      className={styles.addr}
                      onClick={() => {
                        Router.push(`/${loginInfo?.username}`);
                        updateModalDashboard(false);
                      }}
                    >
                      <span className={styles.txtDomain}>
                        {loginInfo?.username}.did
                      </span>
                    </p>
                  ) : (
                    <p className={styles.addrSsi}>
                      <h4>
                        DID<span style={{ textTransform: "lowercase" }}>x</span>
                        Wallet
                      </h4>
                      <a
                        className={styles.txtDomain}
                        href={`https://devex.zilliqa.com/address/${
                          loginInfo?.address
                        }?network=https%3A%2F%2F${
                          net === "mainnet" ? "" : "dev-"
                        }api.zilliqa.com`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <span className={styles.txtDomain}>
                          {zcrypto.toBech32Address(loginInfo.address!)}
                        </span>
                      </a>
                    </p>
                  )}
                </div>
              </>
            ) : (
              <></>
            )}
            {loginInfo?.address !== null && (
              <>
                <div
                  className={styles.toggleMenuWrapper}
                  onClick={() => menuActive("didDomains")}
                >
                  <p style={{ marginTop: "30px" }}>DID Domains</p>
                  <Image
                    alt="arrow-ico"
                    src={menu === "didDomains" ? ArrowUp : ArrowDown}
                  />
                </div>
                {menu === "didDomains" && (
                  <div style={{ marginLeft: "6%", marginBottom: "7%" }}>
                    {didDomain.length > 0 ? (
                      <>
                        {didDomain?.map((val) => (
                          <p key={val} className={styles.txtDomain}>
                            {val}
                          </p>
                        ))}
                      </>
                    ) : (
                      <h6>Your SSI has no DID Domains.</h6>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div>
            <div
              className={styles.toggleHeaderWrapper}
              onClick={() => menuActive("eoa")}
            >
              <h6 className={styles.title2}>Externally Owned Accounts</h6>
              <Image
                alt="arrow-ico"
                src={menu === "eoa" ? ArrowUp : ArrowDown}
              />
            </div>
            {menu === "eoa" && (
              <>
                <div className={styles.wrapperEoa}>
                  <Image
                    width={25}
                    height={25}
                    src={ZilpayIcon}
                    alt="zilpay-ico"
                  />
                  <div className={styles.txtEoa}>Ziliqa Wallet</div>
                  <div
                    onClick={() =>
                      toast("Coming soon", {
                        position: "top-center",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                      })
                    }
                    className={styles.txtDisconnect}
                  >
                    {/** @todo-i disconnect only zilpay */}
                    Disconnect
                  </div>
                </div>
                <div
                  style={{
                    marginTop: "1%",
                    marginBottom: "5%",
                    marginLeft: "3%",
                  }}
                >
                  <a
                    href={`https://devex.zilliqa.com/address/${
                      loginInfo.zilAddr?.bech32
                    }?network=https%3A%2F%2F${
                      net === "mainnet" ? "" : "dev-"
                    }api.zilliqa.com`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.txtAddress}
                  >
                    {loginInfo.zilAddr?.bech32}
                  </a>
                </div>
                {loginInfo.arAddr && (
                  <>
                    <div className={styles.wrapperEoa}>
                      <Image
                        width={25}
                        height={25}
                        src={ArConnectIcon}
                        alt="arconnect-ico"
                      />
                      <div className={styles.txtEoa}>ArWeave Wallet</div>
                      <div
                        onClick={() => disconnect()}
                        className={styles.txtDisconnect}
                      >
                        Disconnect
                      </div>
                    </div>
                    <div style={{ marginTop: "1%", marginLeft: "3%" }}>
                      <p className={styles.txtAddress}>
                        {loginInfo.arAddr} {/** @todo-i copy to clipboard */}
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          {loginInfo.address === null && (
            <div style={{ marginTop: "5%" }}>
              <div
                className={styles.toggleHeaderWrapper}
                onClick={() => menuActive("login")}
              >
                <h6 className={styles.title2}>Log In</h6>
                <Image
                  alt="arrow-ico"
                  src={menu === "login" ? ArrowUp : ArrowDown}
                />
              </div>
              {menu === "login" && (
                <>
                  <div
                    className={styles.toggleMenuWrapper}
                    onClick={() => subMenuActive("existingUsers")}
                  >
                    <p style={{ marginTop: "30px" }}>Existing User</p>
                    <Image
                      alt="arrow-ico"
                      src={subMenu === "existingUsers" ? ArrowUp : ArrowDown}
                    />
                  </div>
                  {subMenu === "existingUsers" && (
                    <div style={{ marginBottom: "5%", marginLeft: "6%" }}>
                      <div className={styles.inputWrapper}>
                        <h5>NFT USERNAME</h5>
                        <input
                          disabled={inputB !== ""}
                          value={input}
                          onChange={handleInput}
                          onKeyPress={handleOnKeyPress}
                          className={
                            inputB !== "" ? styles.inputDisabled : styles.input
                          }
                        />
                      </div>
                      <h6 className={styles.txtOr}>OR</h6>
                      <div>
                        <h5>ADDRESS</h5>
                        <input
                          disabled={input !== ""}
                          onChange={handleInputB}
                          onKeyPress={handleOnKeyPress}
                          className={
                            input !== "" ? styles.inputDisabled : styles.input
                          }
                        />
                      </div>
                      <div className={styles.btnContinueWrapper}>
                        <button
                          onClick={continueLogIn}
                          className="button secondary"
                        >
                          {loading ? spinner : <p>CONTINUE</p>}
                        </button>
                      </div>
                    </div>
                  )}
                  <div
                    className={styles.toggleMenuWrapper}
                    onClick={() => subMenuActive("newUsers")}
                  >
                    <p style={{ marginTop: "30px" }}>New SSI</p>
                    <Image
                      alt="arrow-ico"
                      src={subMenu === "newUsers" ? ArrowUp : ArrowDown}
                    />
                  </div>
                  {subMenu === "newUsers" && (
                    <div style={{ marginLeft: "6%" }}>
                      <p className={styles.newSsiSub}>
                        Deploy a brand new Self-Sovereign Identity:
                      </p>
                      <button onClick={newSsi} className="button primaryRow">
                        {loadingSsi ? (
                          <span>click to continue</span>
                        ) : (
                          <>
                            <span className="label">&#9889;</span>
                            <p className={styles.btnContinueSsiTxt}>
                              CREATE SSI
                            </p>{" "}
                            {/** @todo-i fix design */}
                          </>
                        )}
                      </button>
                      <h5 style={{ marginTop: "3%", color: "lightgrey" }}>
                        Gas AROUND 1 ZIL
                      </h5>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {loginInfo.address !== null && (
            <>
              <div
                className={styles.toggleMenuWrapper2}
                onClick={() => subMenuActive("newUsers")}
              >
                <p style={{ marginTop: "30px" }}>New SSI</p>
                <Image
                  alt="arrow-ico"
                  src={subMenu === "newUsers" ? ArrowUp : ArrowDown}
                />
              </div>
              {subMenu === "newUsers" && (
                <div style={{ marginLeft: "6%" }}>
                  <p className={styles.newSsiSub}>
                    Deploy a brand new Self-Sovereign Identity:
                  </p>
                  <button onClick={newSsi} className="button primaryRow">
                    {loadingSsi ? (
                      <span>click to continue</span>
                    ) : (
                      <>
                        <span className="label">&#9889;</span>
                        <p className={styles.btnContinueSsiTxt}>
                          CREATE SSI
                        </p>{" "}
                        {/** @todo-i fix design */}
                      </>
                    )}
                  </button>
                  <h5 style={{ marginTop: "3%", color: "lightgrey" }}>
                    Gas AROUND 1 ZIL
                  </h5>
                </div>
              )}
              <div onClick={logOff} className={styles.wrapperLogout}>
                <Image alt="log-off" src={LogOffIcon} />
                <p style={{ marginTop: "30px", marginLeft: "5%" }}>LOG OFF</p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Component;
