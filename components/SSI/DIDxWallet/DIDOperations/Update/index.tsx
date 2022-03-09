import React, { useState } from "react";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import * as zcrypto from "@zilliqa-js/crypto";
import { SubmitUpdateDoc, Donate } from "../../../..";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { $user } from "../../../../../src/store/user";
import { $doc } from "../../../../../src/store/did-doc";

function Component() {
  const user = useStore($user);
  const doc = useStore($doc)?.doc;
  const [id, setID] = useState("");
  const [addr, setInput] = useState("");

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

  return (
    <>
      {step === 1 ? (
        <>
          {doc !== null &&
            doc?.map((res: any) => {
              if (res[0] !== "Decentralized identifier") {
                return (
                  <table>
                    {res[0] !== 'DID services' ? (
                      <tr>
                        <td>
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
                        </td>
                        <td className={styles.actionBtnWrapper}>
                          <button className={styles.button} onClick={() => setStep(2)}>
                            <p className={styles.buttonText}>Replace</p>
                          </button>
                          <button className={styles.button} onClick={() => setStep(2)}>
                            <p className={styles.buttonText}>Remove</p>
                          </button>
                        </td>
                      </tr>
                    ):(
                      <>
                        {res[1].map((val) => (
                          <tr>
                            <td>
                              <div key={res} className={styles.docInfo}>
                                <h3 className={styles.blockHead}>{val[0]}</h3>
                                <p onClick={() => copyToClipboard(val[1])} key={val[1]} className={styles.didkey}>
                                  {val[1]}
                                </p>
                              </div>
                            </td>
                            <td className={styles.actionBtnWrapper}>
                              <button className={styles.button} onClick={() => setStep(2)}>
                                <p className={styles.buttonText}>Replace</p>
                              </button>
                              <button className={styles.button} onClick={() => setStep(2)}>
                                <p className={styles.buttonText}>Remove</p>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </table>
                );
              }
            })
          }
        </>
      ):(
        <div>
          <button
            type="button"
            className={styles.button}
            onClick={() => setStep(1)}
          >
            <p className={styles.buttonText}>Doc's List</p>
          </button>
          <h4>Services</h4>
          <section className={styles.containerInput}>
            <input
              style={{ width: "20%" }}
              type="text"
              placeholder="Type service ID"
              onChange={handleID}
              autoFocus
            />
            <input
              style={{ marginLeft: "1%", width: "60%" }}
              type="text"
              placeholder="Type service address"
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
