import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { useStore } from "effector-react";
import {
  showLoginModal,
  setSsiModal,
  updateLoginInfoArAddress,
  updateLoginInfoZilpay,
} from "../../../src/app/actions";
import { RootState } from "../../../src/app/reducers";
import CloseIcon from "../../../src/assets/icons/ic_cross.svg";
import PoweOff from "../../../src/assets/logos/power-off.png";
import styles from "./styles.module.scss";
import Image from "next/image";
import { $zil_address, updateZilAddress } from "../../../src/store/zil_address";
import { $new_ssi, updateNewSSI } from "../../../src/store/new-ssi";
import { $loggedIn, updateLoggedIn } from "../../../src/store/loggedIn";
import { $net } from "../../../src/store/wallet-network";
import { ZilPayBase } from "../../ZilPay/zilpay-base";
import { HTTPProvider } from "@zilliqa-js/core";
import { Transaction } from "@zilliqa-js/account";
import { BN, Long } from "@zilliqa-js/util";
import { randomBytes, toChecksumAddress } from "@zilliqa-js/crypto";
import { useDispatch } from "react-redux";
import {
  setTxStatusLoading,
  showTxStatusModal,
  setTxId,
  hideTxStatusModal,
  updateLoginInfoAddress,
  updateLoginInfoUsername,
} from "../../../src/app/actions";
import * as zcrypto from "@zilliqa-js/crypto";
import { toast } from "react-toastify";
import { fetchAddr } from "../../SearchBar/utils";
import * as tyron from "tyron";
import useArConnect from "../../../src/hooks/useArConnect";
import { ZilPay } from "../../";
import ArConnectIco from "../../../src/assets/logos/lg_arconnect.png";

const mapStateToProps = (state: RootState) => ({
  modal: state.modal.loginModal,
  loginInfo: state.modal,
});

const mapDispatchToProps = {
  dispatchLoginModal: showLoginModal,
  dispatchShowNewSsiModal: setSsiModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function Component(props: ModalProps) {
  const { dispatchLoginModal, dispatchShowNewSsiModal, modal, loginInfo } =
    props;
  const { connect, arAddress } = useArConnect();

  const dispatch = useDispatch();
  const address = useStore($zil_address);
  const net = useStore($net);
  const new_ssi = useStore($new_ssi);
  const loggedIn = useStore($loggedIn);
  const [loading, setLoading] = useState(false);
  const [loadingSsi, setLoadingSsi] = useState(false);
  const [input, setInput] = useState("");
  const [inputB, setInputB] = useState("");

  const newSsi = async () => {
    if (address !== null && net !== null) {
      setLoadingSsi(true);
      const zilpay = new ZilPayBase();

      const generateChecksumAddress = () => toChecksumAddress(randomBytes(20));
      let endpoint = "https://api.zilliqa.com/";
      if (net === "testnet") {
        endpoint = "https://dev-api.zilliqa.com/";
      }
      let tx = new Transaction(
        {
          version: 0,
          toAddr: generateChecksumAddress(),
          amount: new BN(0),
          gasPrice: new BN(1000),
          gasLimit: Long.fromNumber(1000),
        },
        new HTTPProvider(endpoint)
      );
      dispatch(showLoginModal(false));
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
                `https://viewblock.io/zilliqa/tx/${deploy[0].ID}?network=${net}`
              );
            }, 1000);
            let new_ssi = deploy[1].address;
            new_ssi = zcrypto.toChecksumAddress(new_ssi);
            updateNewSSI(new_ssi);
            /** @todo-checked
             * wait until contract deployment gets confirmed
             * add spinner
             * */
            setLoadingSsi(false);
            /**
             * @todo-checked close New SSI modal so the user can see the search bar and the following message.
             */
            dispatch(hideTxStatusModal());
            dispatchShowNewSsiModal(true);
          } else if (tx.isRejected()) {
            dispatch(hideTxStatusModal());
            dispatch(setTxStatusLoading("idle"));
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
          dispatch(setTxStatusLoading("idle"));
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
          await connect();
          setLoading(false);
          updateLoggedIn({
            username: input,
            address: addr,
          });
          dispatch(updateLoginInfoAddress(addr));
          dispatch(updateLoginInfoUsername(input));
          dispatchLoginModal(false);
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
          connect();
          setLoading(false);
          updateLoggedIn({
            address: inputB,
          });
          dispatch(updateLoginInfoAddress(inputB));
          dispatchLoginModal(false);
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

  const continueLogIn = () => {
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
    updateZilAddress(null!);
    updateNewSSI(null!);
    dispatchLoginModal(false);
    toast.info("Logged off", {
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

  useEffect(() => {
    if (modal && loginInfo.arAddr !== null) {
      toast.info(`Connected to ${loginInfo.arAddr.slice(0, 6)}...`, {
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
    }
  });

  const spinner = (
    <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
  );

  if (!modal) {
    return null;
  }

  return (
    <>
      {loginInfo.zilAddr === null ? (
        <ZilPay />
      ) : (
        <>
          <div
            onClick={() => dispatchLoginModal(false)}
            className={styles.outerWrapper}
          />
          <div className={styles.container}>
            <div className={styles.innerContainer}>
              <div
                className={styles.closeIcon}
                onClick={() => {
                  dispatchLoginModal(false);
                }}
              >
                <Image alt="close-ico" src={CloseIcon} />
              </div>
              {new_ssi !== null ||
                (loginInfo.address !== null && (
                  <div className={styles.wrapperLoginInfo}>
                    <div className={styles.headerModal}>
                      <ZilPay />
                      {loginInfo.arAddr !== null && (
                        <>
                          <h3>YOUR ARWEAVE WALLET IS CONNECTED</h3>
                          <div className={styles.addrWrapper}>
                            <div className={styles.arConnectIco}>
                              <Image
                                width={20}
                                height={20}
                                alt="zilpay-ico"
                                src={ArConnectIco}
                              />
                            </div>
                            <p className={styles.addr}>
                              {loginInfo.arAddr?.slice(0, 6)}...
                              {loginInfo.arAddr?.slice(-6)}
                            </p>
                          </div>
                        </>
                      )}
                      {loginInfo.address !== null && (
                        <>
                          <h3>You are logged in with</h3>
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
                                  href={`https://viewblock.io/zilliqa/address/${loginInfo?.address}?network=${net}`}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  <span className={styles.x}>
                                    {zcrypto.toBech32Address(
                                      loginInfo.address!
                                    )}
                                  </span>
                                </a>
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className={styles.wrapperLogOff}>
                      <div onClick={logOff} className={styles.logOffIco}>
                        <Image
                          alt="log-off"
                          width={80}
                          height={80}
                          src={PoweOff}
                        />
                      </div>
                      <h2>LOG OFF</h2>
                    </div>
                  </div>
                ))}
              {loginInfo.address === null && new_ssi === null && (
                <>
                  <div className={styles.headerModal}>
                    <ZilPay />
                  </div>
                  <div className={styles.contentWrapper}>
                    <div>
                      <h3 className={styles.titleContent}>EXISTING SSI</h3>
                      <div className={styles.inputWrapper}>
                        <h5>NFT USERNAME</h5>
                        <input
                          disabled={inputB !== ""}
                          value={input}
                          onChange={handleInput}
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
                    <div className={styles.separator} />
                    <div>
                      <h3 className={styles.titleContent}>
                        NEW USER - CREATE AN SSI
                      </h3>
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
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default connector(Component);
