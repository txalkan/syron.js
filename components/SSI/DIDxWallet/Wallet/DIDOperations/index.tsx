import * as tyron from "tyron";
import * as zcrypto from "@zilliqa-js/crypto";
import React, { useState } from "react";
import { useStore } from "effector-react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { $contract } from "../../../../../src/store/contract";
import { $user } from "../../../../../src/store/user";
import { $arconnect } from "../../../../../src/store/arconnect";
import { $net } from "../../../../../src/store/wallet-network";
import { updateIsController } from "../../../../../src/store/controller";
import styles from "./styles.module.scss";
import { ZilPayBase } from "../../../../ZilPay/zilpay-base";
import { decryptKey, operationKeyPair } from "../../../../../src/lib/dkms";
import { toast } from "react-toastify";
import { setTxId, setTxStatusLoading } from "../../../../../src/app/actions";
import { updateModalTx } from "../../../../../src/store/modal";
import { $doc } from "../../../../../src/store/did-doc";
import { resolve } from "../../../../SearchBar/utils";

function Component() {
  const username = useStore($user)?.name;
  const contract = useStore($contract);
  const arConnect = useStore($arconnect);
  const net = useStore($net);

  const Router = useRouter();
  const dispatch = useDispatch();

  const [hideDeactivate, setHideDeactivate] = useState(true);
  const [inputAddr, setInputAddr] = useState("");
  const [address, setAddress] = useState("");
  const [legend, setLegend] = useState("save");
  const [selectedAddress, setSelectedAddress] = useState("");

  const is_operational =
    contract?.status !== tyron.Sidetree.DIDStatus.Deactivated &&
    contract?.status !== tyron.Sidetree.DIDStatus.Locked;

  const submitDidDeactivate = async () => {
    // @todo-i add loading
    try {
      if (arConnect !== null && contract !== null) {
        const zilpay = new ZilPayBase();

        const key_: tyron.VerificationMethods.PublicKeyModel = {
          id: "deactivate",
          key: "0x024caf04aa4f660db04adf65daf5b993b3383fcdb2ef0479ca8866b1336334b5b4",
          encrypted: "none",
        };
        const deactivate_element: tyron.DocumentModel.DocumentElement[] = [
          {
            constructor:
              tyron.DocumentModel.DocumentConstructor.VerificationMethod,
            action: tyron.DocumentModel.Action.Add,
            key: key_,
          },
        ];

        const hash = await tyron.DidCrud.default.HashDocument(
          deactivate_element
        );

        const addr = selectedAddress === "SSI" ? contract.addr : address;
        const result = await resolve({ net, addr });
        let signature: string = "";
        if (
          Number(result.version.slice(8, 9)) < 5 ||
          (Number(result.version.slice(8, 9)) >= 5 &&
            Number(result.version.slice(10, 11)) <= 3)
        ) {
          try {
            const encrypted_key = result.dkms!.get("recovery");
            const private_key = await decryptKey(arConnect, encrypted_key);
            const public_key = zcrypto.getPubKeyFromPrivateKey(private_key);
            signature = zcrypto.sign(
              Buffer.from(hash, "hex"),
              private_key,
              public_key
            );
          } catch (error) {
            throw Error("Identity verification unsuccessful.");
          }
        } else {
          try {
            const encrypted_key = result.dkms!.get("update");
            const private_key = await decryptKey(arConnect, encrypted_key);
            const public_key = zcrypto.getPubKeyFromPrivateKey(private_key);
            signature = zcrypto.sign(
              Buffer.from(hash, "hex"),
              private_key,
              public_key
            );
          } catch (error) {
            throw Error("Identity verification unsuccessful.");
          }
        }

        const tyron_ = await tyron.TyronZil.default.OptionParam(
          tyron.TyronZil.Option.none,
          "Uint128"
        );

        const tx_params = await tyron.DidCrud.default.Deactivate({
          addr: selectedAddress === "SSI" ? contract.addr : address,
          signature: signature,
          tyron_: tyron_,
        });

        dispatch(setTxStatusLoading("true"));
        updateModalTx(true);
        let tx = await tyron.Init.default.transaction(net);

        toast.info(`You're about to submit a DID Deactivate transaction!`, {
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
          .call(
            {
              contractAddress:
                selectedAddress === "SSI" ? contract.addr : address,
              transition: "DidDeactivate",
              params: tx_params.txParams as unknown as Record<
                string,
                unknown
              >[],
              amount: String(0),
            },
            {
              gasPrice: "2000",
              gaslimit: "20000",
            }
          )
          .then(async (res) => {
            dispatch(setTxId(res.ID));
            dispatch(setTxStatusLoading("submitted"));
            try {
              tx = await tx.confirm(res.ID);
              if (tx.isConfirmed()) {
                dispatch(setTxStatusLoading("confirmed"));
                window.open(
                  `https://devex.zilliqa.com/tx/${
                    res.ID
                  }?network=https%3A%2F%2F${
                    net === "mainnet" ? "" : "dev-"
                  }api.zilliqa.com`
                );
                Router.push(`/${username}/did/doc`);
              } else if (tx.isRejected()) {
                dispatch(setTxStatusLoading("failed"));
              }
            } catch (err) {
              throw err;
            }
          })
          .catch((err) => {
            throw err;
          });
      }
    } catch (error) {
      updateModalTx(false);
      toast.error(String(error), {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleOnChangeSelectedAddress = (event: { target: { value: any } }) => {
    setAddress("");
    setInputAddr("");
    setSelectedAddress(event.target.value);
  };

  const handleInputAddr = (event: { target: { value: any } }) => {
    setAddress("");
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
      setAddress(addr);
      setLegend("saved");
    } catch (error) {
      try {
        const addr = zcrypto.toChecksumAddress(inputAddr);
        setAddress(addr);
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
      }}
    >
      {/* {contract?.status === tyron.Sidetree.DIDStatus.Deployed && (
        <h2>
          <div
            onClick={() => {
              updateIsController(true);
              Router.push(`/${username}/did/wallet/crud/create`);
            }}
            className={styles.flipCard}
          >
            <div className={styles.flipCardInner}>
              <div className={styles.flipCardFront}>
                <p className={styles.cardTitle3}>CREATE</p>
              </div>
              <div className={styles.flipCardBack}>
                <p className={styles.cardTitle2}>GENERATE DID</p>
              </div>
            </div>
          </div>
        </h2>
      )} */}
      {is_operational && (
        <h2>
          <div
            onClick={() => {
              updateIsController(true);
              Router.push(`/${username}/did/wallet/crud/update`);
            }}
            className={styles.flipCard}
          >
            <div className={styles.flipCardInner}>
              <div className={styles.flipCardFront}>
                <p className={styles.cardTitle3}>UPDATE</p>
              </div>
              <div className={styles.flipCardBack}>
                <p className={styles.cardTitle2}>change document</p>
              </div>
            </div>
          </div>
        </h2>
      )}
      {/* <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {is_operational && (
          <h2>
            <div
              onClick={() => {
                updateIsController(true);
                Router.push(`/${username}/did/wallet/crud/recover`);
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>RECOVER</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>reset document</p>
                </div>
              </div>
            </div>
          </h2>
        )}
      </div> */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {is_operational && (
          <h2>
            <div
              onClick={() => {
                updateIsController(true);
                Router.push(`/${username}/did/wallet/crud/social`);
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>SOCIAL RECOVERY</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>configure guardians</p>
                </div>
              </div>
            </div>
          </h2>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        {/* {is_operational &&
          contract?.status !== tyron.Sidetree.DIDStatus.Deployed && ( */}
        {is_operational && (
          <>
            {hideDeactivate ? (
              <>
                <h5 style={{ color: "red", marginTop: "10%" }}>Danger zone</h5>
                <h2>
                  <div
                    onClick={() => {
                      setHideDeactivate(false);
                    }}
                    className={styles.flipCard}
                  >
                    <div className={styles.flipCardInner}>
                      <div className={styles.flipCardFront2}>
                        <p className={styles.cardTitle3}>DEACTIVATE</p>
                      </div>
                      <div className={styles.flipCardBack}>
                        <p className={styles.cardTitle2}>
                          permanent deactivation
                        </p>
                      </div>
                    </div>
                  </div>
                </h2>
              </>
            ) : (
              <div style={{ marginTop: "7%" }}>
                <h2 style={{ color: "red" }}>DID deactivate</h2>
                <div>
                  <select
                    className={styles.select}
                    onChange={handleOnChangeSelectedAddress}
                    value={selectedAddress}
                  >
                    <option value="">Select address</option>
                    <option value="SSI">This SSI</option>
                    <option value="ADDR">Another address</option>
                  </select>
                </div>
                {selectedAddress === "ADDR" && (
                  <div className={styles.wrapperInputAddr}>
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
                )}
                {selectedAddress === "SSI" ||
                (selectedAddress === "ADDR" && address !== "") ? (
                  <div style={{ marginTop: "5%" }}>
                    <p>Are you sure? There is no way back.</p>
                    <button
                      className={styles.deactivateYes}
                      onClick={submitDidDeactivate}
                    >
                      <p>YES</p>
                    </button>
                    <button
                      className={styles.deactivateNo}
                      onClick={() => {
                        setHideDeactivate(true);
                        setSelectedAddress("");
                        setInputAddr("");
                        setAddress("");
                      }}
                    >
                      <p>NO</p>
                    </button>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Component;
