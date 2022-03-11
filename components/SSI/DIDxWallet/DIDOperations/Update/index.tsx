import React, { useState } from "react";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import * as zcrypto from "@zilliqa-js/crypto";
import { useRouter } from "next/router";
import { SubmitUpdateDoc, Donate } from "../../../..";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { $user } from "../../../../../src/store/user";
import { $doc } from "../../../../../src/store/did-doc";
import { updateIsController } from "../../../../../src/store/controller";

function Component() {
  const Router = useRouter();
  const user = useStore($user);
  const doc = useStore($doc)?.doc;
  const [id, setID] = useState("");
  const [addr, setInput] = useState("");
  const [selectedList, setSelectedList] = useState(Array());

  const [legend, setLegend] = useState("Save");
  const [button, setButton] = useState("button primary");
  const [step, setStep] = useState(1);

  const handleID = (event: { target: { value: any } }) => {
    setLegend("Save");
    setButton("button primary");
    const input = event.target.value;

    setID(String(input).toLowerCase());
  };
  const handleInput = (event: { target: { value: any } }) => {
    setLegend("Save");
    setButton("button primary");
    let input = event.target.value;
    try {
      input = zcrypto.fromBech32Address(input);
      setInput(input);
    } catch (error) {
      try {
        zcrypto.toChecksumAddress(input);
        setInput(input);
      } catch {
        toast.error("wrong address.", {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      }
    }
  };

  const services: tyron.DocumentModel.ServiceModel[] = [];
  if (id !== "" && addr !== "") {
    services.push({
      id: id,
      endpoint: tyron.DocumentModel.ServiceEndpoint.Web3Endpoint,
      address: addr,
    });
  }

  //@todo process all patches
  const patches: tyron.DocumentModel.PatchModel[] = [
    {
      action: tyron.DocumentModel.PatchAction.AddServices,
      services: services,
    },
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info("Key copied to clipboard!", {
      position: "top-left",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
    });
  }

  const pushList = (id, key) => {
    const obj = {id, key}
    if (!checkList(id)) {
      selectedList.push(obj); 
    }
    setStep(2)
  }

  const removeList = (id) => {
    let newArr = selectedList.filter( val => val.id !== id );
    setSelectedList(newArr);
  }

  const checkList = (id) => {
    if(selectedList.some(val => val.id === id)) {
      return true
    } else {
      return false
    }
  }

  return (
    <>
      <div className={styles.headerWrapper}>
        <h3 style={{ color: "lightblue" }}>
          update
        </h3>
        <button
          type="button"
          className={styles.button}
          onClick={() => {
            updateIsController(true)
            Router.push(`/${user?.name}/xwallet/did/`)
          }}
        >
          <p className={styles.buttonText}>BACK</p>
        </button>
      </div>
      <p>With this transaction, you can update your DID Document.</p>
      {step === 1 ? (
        <>
          {doc !== null &&
            doc?.map((res: any) => {
              if (res[0] !== "Decentralized identifier") {
                return (
                  <div>
                    {res[0] !== 'DID services' ? (
                      <div className={styles.keyWrapper}>
                        <div key={res} className={styles.docInfo}>
                          <h3 className={styles.blockHead}>{res[0]}</h3>
                          {res[1].map((element: any) => {
                            return (
                              <p onClick={() => copyToClipboard(element)} key={element} className={styles.didkey}>
                                {element}
                              </p>
                            );
                          })}
                        </div>
                        <div className={styles.actionBtnWrapper}>
                          <button className={styles.button} onClick={() => pushList(res[0], res[1][0])}>
                          {checkList(res[0]) ? (
                            <p className={styles.buttonText}>Selected</p>
                          ):(
                            <p className={styles.buttonText}>Replace</p>
                          )}
                          </button>
                          <button className={styles.button} onClick={() => setStep(2)}>
                            <p className={styles.buttonText}>Remove</p>
                          </button>
                        </div>
                      </div>
                    ):(
                      <>
                        {res[1].map((val, i) => (
                          <div className={styles.keyWrapper} key={i}>
                            <div key={res} className={styles.docInfo}>
                              <h3 className={styles.blockHead}>{val[0]}</h3>
                              <p onClick={() => copyToClipboard(val[1])} key={i} className={styles.didkey}>{val[1]}</p>
                            </div>
                            <div className={styles.actionBtnWrapper}>
                              <button className={styles.button} onClick={() => pushList(val[0], val[1])}>
                                {checkList(val[0]) ? (
                                  <p className={styles.buttonText}>Selected</p>
                                ):(
                                  <p className={styles.buttonText}>Replace</p>
                                )}
                              </button>
                              <button className={styles.button} onClick={() => setStep(2)}>
                                <p className={styles.buttonText}>Remove</p>
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              }
            })
          }
        </>
      ):(
        <div>
          <h4>Services</h4>
          {selectedList.map((val, i) => (
            <section key={i} className={styles.containerInput}>
              <div onClick={() => removeList(val.id)} className={styles.rmvBtn}>
                <h4>X</h4>
              </div>
              <input
                key={i}
                style={{ width: "20%" }}
                type="text"
                placeholder={val.id}
                onChange={handleID}
                autoFocus
              />
              <input
                style={{ marginLeft: "1%", width: "60%" }}
                type="text"
                placeholder={val.key}
                onChange={handleInput}
                autoFocus
              />
              <input
                style={{ marginLeft: "2%" }}
                type="button"
                className={button}
                value={legend}
                onClick={() => {
                  try {
                    zcrypto.fromBech32Address(addr);
                    setLegend("Saved");
                    setButton("button");
                  } catch (error) {
                    try {
                      zcrypto.toChecksumAddress(addr);
                      setLegend("Saved");
                      setButton("button");
                    } catch {
                      toast.error("wrong address.", {
                        position: "top-left",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                      });
                    }
                  }
                }}
              />
            </section>
          ))}
          <button
            type="button"
            className={styles.button}
            onClick={() => setStep(1)}
          >
            <p className={styles.buttonText}>Add Another</p>
          </button>
          <Donate />
          <SubmitUpdateDoc
            {...{
              patches: patches,
            }}
          />
        </div>
      )}
    </>
  );
}

export default Component;
