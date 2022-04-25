import React, { useState } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { useStore } from "effector-react";
import * as zcrypto from "@zilliqa-js/crypto";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { RootState } from "../../../src/app/reducers";
import { $net } from "../../../src/store/wallet-network";
import { $zil_address, updateZilAddress } from "../../../src/store/zil_address";
import { $arconnect } from "../../../src/store/arconnect";
import { $new_ssi } from "../../../src/store/new-ssi";
import {
  hideTxStatusModal,
  setTxId,
  setTxStatusLoading,
  showDashboardModal,
  showTxStatusModal,
  updateLoginInfoAddress,
  updateLoginInfoUsername,
  setSsiModal,
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
import { updateNewSSI } from "../../../src/store/new-ssi";

function Component() {
  const { connect } = useArConnect();
  const dispatch = useDispatch();
  const modal = useSelector((state: RootState) => state.modal.dashboardModal);
  const loginInfo = useSelector((state: RootState) => state.modal);
  const net = useStore($net);
  const address = useStore($zil_address);
  const arconnect = useStore($arconnect);
  const new_ssi = useStore($new_ssi);
  const [input, setInput] = useState("");
  const [inputB, setInputB] = useState("");
  const [menu, setMenu] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSsi, setLoadingSsi] = useState(false);

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
        const state = await init.API.blockchain.getSmartContractState(addr);
        const get_controller = state.result.controller;
        const controller = zcrypto.toChecksumAddress(get_controller);
        if (controller !== address?.base16) {
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
              dispatch(showDashboardModal(false));
              setMenu("");
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
        if (controller !== address?.base16) {
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
              dispatch(showDashboardModal(false));
              setMenu("");
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
    if (address !== null && net !== null) {
      await connect();
      setLoadingSsi(true);
      const zilpay = new ZilPayBase();
      let tx = await tyron.Init.default.transaction(net);
      dispatch(showDashboardModal(false));
      dispatch(setTxStatusLoading("true"));
      dispatch(showTxStatusModal());

      await zilpay
        .deployDid(net, address.base16)
        .then(async (deploy: any) => {
          dispatch(setTxId(deploy[0].ID));
          dispatch(setTxStatusLoading("submitted"));

          tx = await tx.confirm(deploy[0].ID);
          if (tx.isConfirmed()) {
            dispatch(setTxStatusLoading("confirmed"));
            setTimeout(() => {
              window.open(
                `https://devex.zilliqa.com/tx/${deploy[0].ID
                }?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                }api.zilliqa.com`
              );
            }, 1000);
            let new_ssi = deploy[1].address;
            new_ssi = zcrypto.toChecksumAddress(new_ssi);
            updateNewSSI(new_ssi);
            setLoadingSsi(false); //@todo-i review if still needed
            dispatch(hideTxStatusModal());
            dispatch(setSsiModal(true));
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
          dispatch(setTxStatusLoading("failed"));
          setLoadingSsi(false);
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
  };

  const continueLogIn = () => {
    if (modal && loginInfo.arAddr !== null) {
      toast.info(
        `Arweave wallet connected to ${loginInfo.arAddr.slice(
          0,
          6
        )}...${loginInfo.arAddr.slice(-6)}`,
        {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          toastId: 2,
        }
      );
    }
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
    updateLoggedIn(null);
    dispatch(updateLoginInfoAddress(null!));
    dispatch(updateLoginInfoUsername(null!));
    dispatch(updateLoginInfoZilpay(null!));
    dispatch(updateLoginInfoArAddress(null!));
    dispatch(showDashboardModal(false));
    updateZilAddress(null!);
    updateNewSSI(null!);
    toast.info("You have logged off", {
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

  const menuActive = (val) => {
    if (val === menu) {
      setMenu("");
    } else {
      setMenu(val);
    }
  };

  const spinner = (
    <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
  );

  if (!modal) {
    return null;
  }

  return (
    <div className={styles.outerWrapper}>
      <div
        onClick={() => dispatch(showDashboardModal(false))}
        className={styles.containerClose}
      />
      <div className={styles.container}>
        <div>
          {new_ssi !== null || loginInfo.address !== null ? (
            <>
              <h6 className={styles.title1}>YOU ARE LOGGED WITH BELOW SSI</h6>
              {new_ssi !== null ? (
                <>
                  <div className={styles.addrWrapper}>
                    <p className={styles.addrSsi}>
                      <a
                        className={styles.x}
                        href={`https://devex.zilliqa.com/address/${new_ssi}?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                          }api.zilliqa.com`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <span className={styles.x}>
                          {zcrypto.toBech32Address(new_ssi)}
                        </span>
                      </a>
                    </p>
                  </div>
                </>
              ) : loginInfo.address !== null ? (
                <>
                  <div className={styles.addrWrapper}>
                    {loginInfo.username ? (
                      <p className={styles.addr}>
                        <span className={styles.x}>
                          {loginInfo?.username}.did
                        </span>
                      </p>
                    ) : (
                      <p className={styles.addrSsi}>
                        <a
                          className={styles.x}
                          href={`https://devex.zilliqa.com/address/${loginInfo?.address
                            }?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                            }api.zilliqa.com`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <span className={styles.x}>
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
            </>
          ) : (
            <></>
          )}
          {loginInfo?.username && (
            <>
              <div
                className={styles.toggleMenuWrapper}
                onClick={() => menuActive("didDomains")}
              >
                <p style={{ marginTop: "30px" }}>DID Domains</p>
                <Image alt="arrow-ico" src={menu === "didDomains" ? ArrowUp : ArrowDown} />
              </div>
              {menu === "didDomains" && (
                <>
                  <p className={styles.txtDomain}>{loginInfo?.username}.defi</p>
                  <p className={styles.txtDomain}>{loginInfo?.username}.vc</p>
                  <p className={styles.txtDomain}>{loginInfo?.username}.etc</p>
                </>
              )}
            </>
          )}
        </div>
        <div>
          <h6 className={styles.title1}>Externally Owned Accounts</h6>
          <div className={styles.wrapperEoa}>
            <Image width={25} height={25} src={ZilpayIcon} alt="zilpay-ico" />
            <p className={styles.txtEoa}>ZilPay Wallet</p>
            <p onClick={logOff} className={styles.txtDisconnect}>
              Disconnect
            </p>
          </div>
          <div style={{ marginTop: "-4%", marginBottom: "5%" }}>
            <a
              href={`https://devex.zilliqa.com/address/${loginInfo.zilAddr?.bech32
                }?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
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
                <p className={styles.txtEoa}>ArWeave Wallet</p>
                <p onClick={logOff} className={styles.txtDisconnect}>
                  Disconnect
                </p>
              </div>
              <div style={{ marginTop: "-4%" }}>
                <a
                  href={`https://devex.zilliqa.com/address/${loginInfo.arAddr
                    }?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                    }api.zilliqa.com`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.txtAddress}
                >
                  {loginInfo.arAddr}
                </a>
              </div>
            </>
          )}
        </div>
        <div style={{ marginTop: "7%" }}>
          <h6 className={styles.title1}>Log in</h6>
          <div
            className={styles.toggleMenuWrapper}
            onClick={() => menuActive("existingUsers")}
          >
            <p style={{ marginTop: "30px" }}>Existing Users</p>
            <Image alt="arrow-ico" src={menu === "existingUsers" ? ArrowUp : ArrowDown} />
          </div>
          {menu === "existingUsers" && (
            <div style={{ marginBottom: "5%" }}>
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
                  className={input !== "" ? styles.inputDisabled : styles.input}
                />
              </div>
              <div className={styles.btnContinueWrapper}>
                <button onClick={continueLogIn} className="button secondary">
                  {loading ? spinner : <p>CONTINUE</p>}
                </button>
              </div>
            </div>
          )}
          <div
            className={styles.toggleMenuWrapper}
            onClick={() => menuActive("newUsers")}
          >
            <p style={{ marginTop: "30px" }}>New Users</p>
            <Image alt="arrow-ico" src={menu === "newUsers" ? ArrowUp : ArrowDown} />
          </div>
          {menu === "newUsers" && (
            <>
              <p className={styles.newSsiSub}>
                Deploy a brand new Self-Sovereign Identity
              </p>
              <button onClick={newSsi} className="button primaryRow">
                {loadingSsi ? (
                  <i
                    className="fa fa-lg fa-spin fa-circle-notch"
                    aria-hidden="true"
                  ></i>
                ) : (
                  <>
                    <span className="label">&#9889;</span>
                    <p className={styles.btnContinueSsiTxt}>NEW SSI</p>
                  </>
                )}
              </button>
              <p style={{ fontSize: "12px", marginTop: "2%" }}>Around 1 ZIL</p>
            </>
          )}
        </div>
        <div onClick={logOff} className={styles.wrapperLogout}>
          <Image alt="log-off" src={LogOffIcon} />
          <p style={{ marginTop: "30px", marginLeft: "5%" }}>LOG OFF</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
