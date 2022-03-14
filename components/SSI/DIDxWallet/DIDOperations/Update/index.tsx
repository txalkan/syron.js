import React, { useState, useCallback } from "react";
import * as tyron from "tyron";
import { useRouter } from "next/router";
import Image from "next/image"
import { toast } from "react-toastify";
import { SubmitUpdateDoc, Headline } from "../../../..";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { $user } from "../../../../../src/store/user";
import { $doc } from "../../../../../src/store/did-doc";
import { updateIsController } from "../../../../../src/store/controller";
import tick from "../../../../../src/assets/logos/tick.png"

function Component() {
  const Router = useRouter();
  const username = useStore($user)?.name;
  const doc = useStore($doc)?.doc;
  const [replaceServiceList, setReplaceServiceList] = useState(Array());
  const [deleteServiceList, setDeleteServiceList] = useState(Array());
  const [replaceKeyList, setReplaceKeyList] = useState(Array());
  const [deleteKeyList, setDeleteKeyList] = useState(Array());
  const [docType, setDocType] = useState("Key");
  const [next, setNext] = useState(false);
  const [patches, setPatches] = useState(Array());
  const [input, setInput] = useState(0);
  const input_ = Array(input);
  const select_input = Array();
  for (let i = 0; i < input_.length; i += 1) {
    select_input[i] = i;
  }
  const services_: tyron.DocumentModel.ServiceModel[] = [];
  const [services2, setServices2] = useState(services_); 
  const [input2, setInput2] = useState([]);
  const services: string[][] = input2;

  const callbackRef = useCallback((inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const checkIsExist = (id, type) => {
    if (replaceServiceList.some(val => val.id === id) && type === 1) {
      return true
    } else if (deleteServiceList.some(val => val === id) && type === 2) {
      return true
    } else if (replaceKeyList.some(val => val === id) && type === 3) {
      return true
    } else {
      return false
    }
  }

  const pushReplaceServiceList = (id, service) => {
    const obj = { id, service }
    if (!checkIsExist(id, 1) && !checkIsExist(id, 2)) {
      setReplaceServiceList([...replaceServiceList, obj]);
    }
  }

  const pushDeleteServiceList = (id) => {
    if (!checkIsExist(id, 2) && !checkIsExist(id, 1)) {
      setDeleteServiceList([...deleteServiceList, id]);
    }
  }

  const removeReplaceServiceList = (id) => {
    let newArr = replaceServiceList.filter(val => val.id !== id);
    setReplaceServiceList(newArr);
  }

  const removeDeleteServiceList = (id) => {
    let newArr = deleteServiceList.filter(val => val !== id);
    setDeleteServiceList(newArr);
  }

  const pushReplaceKeyList = (id) => {
    if (!checkIsExist(id, 3)) {
      setReplaceKeyList([...replaceKeyList, id]);
    }
  }

  const removeReplaceKeyList = (id) => {
    let newArr = replaceKeyList.filter(val => val !== id);
    setReplaceKeyList(newArr);
  }

  const handlePatches = async () => {
    /* @todo-1 process lists to make patches 
    - make sure there is no service 'pending'
    - learn about patches: https://github.com/pungtas/tyron.js/blob/71a3a18c4462491d1653d02965e032bfd4d76d27/lib/did/protocols/models/document-model.ts#L55 
    */
    const new_services: tyron.DocumentModel.ServiceModel[] = [];
    /*
    for example:
      new_services.push({
        id: id,
        endpoint: tyron.DocumentModel.ServiceEndpoint.Web3Endpoint,
        address: addr,
      });
 
    but we are not updating web3 endpoints atm
    */

    const patches: tyron.DocumentModel.PatchModel[] = [
      // add each patch to this array. Example for new services:
      {
        action: tyron.DocumentModel.PatchAction.AddServices,
        services: new_services,
      },
    ];

    setPatches(patches);
    setNext(true);
  }

  const handleOnChange = (event: { target: { value: any } }) => {
    setDocType(event.target.value);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(0);
    setInput2([]);
    setServices2(services_);
    let _input = event.target.value;
    const re = /,/gi;
    _input = _input.replace(re, ".");
    const input = Number(_input);

    if (!isNaN(input) && Number.isInteger(input)) {
      setInput(input);
    } else if (isNaN(input)) {
      toast.error('The input is not a number.', {
        position: "top-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    } else if (!Number.isInteger(input)) {
      toast.error('The number of services must be an integer.', {
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
  };

  return (
    <>
      <div style={{ width: '70%', textAlign: 'center' }}>
        <Headline />
      </div>
      <div>
        <button
          type="button"
          className="button"
          onClick={() => {
            updateIsController(true);
            Router.push(`/${username}/xwallet/did`)
          }}
        >
          <p style={{ color: 'silver' }}>operations menu</p>
        </button>
      </div>
      <h2 style={{ color: '#ffff32', margin: '7%' }}>
        DID update
      </h2>
      <h4>
        With this transaction, you will update your DID Document.
      </h4>
      {
        !next &&
        <>
          <p>
            Your current document:
          </p>
          <div>
            <select onChange={handleOnChange}>
              <option value="">Select document type:</option>
              <option value="Key">Key</option>
              <option value="Service">Service</option>
            </select>
          </div>
          {/* @todo-1
          - let's have 2 dropdown sections (one for keys and another one for services)
          - make the whole page responsive.
          - a key can only be replaced or added if not present (possible key ids are: https://github.com/pungtas/tyron.js/blob/71a3a18c4462491d1653d02965e032bfd4d76d27/lib/did/protocols/models/verification-method-models.ts#L33)
          - a service element can be either replaced or removed, not both (so when one gets selected, the other one cannot)
          - in the service section, add the option of adding new services for unrepeated ids (similar to NewDoc)
          */}
          <section style={{ marginTop: '5%' }}>
            {doc !== null &&
              doc?.map((res: any) => {
                if (res[0] !== "Decentralized identifier") {
                  return (
                    <div>
                      {res[0] !== 'DID services' && docType === "Key" ? (
                        <>
                          <div className={styles.keyWrapper}>
                            <div key={res} className={styles.docInfo}>
                              <h3 className={styles.blockHead}>{res[0]}</h3>
                              {res[1].map((element: any) => {
                                return (
                                  <p key={element} className={styles.didkey}>
                                    {(element as string).slice(0, 22)}...
                                  </p>
                                );
                              })}
                            </div>
                            <div className={styles.actionBtnWrapper}>
                              {checkIsExist(res[0], 3) ? (
                                <button className={styles.button2} onClick={() => removeReplaceKeyList(res[0])}>
                                  <p className={styles.buttonText2}>Replaced</p>
                                </button>
                              ) : (
                                <button className={styles.button} onClick={() => pushReplaceKeyList(res[0])}>
                                  <p className={styles.buttonText}>Replace</p>
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      ) : res[0] === 'DID services' && docType === "Service" ? (
                        <>
                          {res[1].map((val, i) => (
                            <>
                              <div className={styles.keyWrapper} key={i}>
                                <div key={res} className={styles.docInfo}>
                                  <h3 className={styles.blockHead}>Service ID: {val[0]}</h3>
                                  <p key={i} className={styles.didkey}>{val[1]}</p>
                                </div>
                                <div className={styles.actionBtnWrapper}>
                                  {checkIsExist(val[0], 1) ? (
                                    <button className={styles.button2} onClick={() => removeReplaceServiceList(val[0])}>
                                      <p className={styles.buttonText2}>Replaced</p>
                                    </button>
                                  ) : (
                                    <button className={styles.button} onClick={() => pushReplaceServiceList(val[0], 'pending')}>
                                      <p className={styles.buttonText}>Replace</p>
                                    </button>
                                  )}
                                  {checkIsExist(val[0], 2) ? (
                                    <button className={styles.button2} onClick={() => removeDeleteServiceList(val[0])}>
                                      <p className={styles.buttonText2}>Deleted</p>
                                    </button>
                                  ) : (
                                    <button className={styles.button} onClick={() => pushDeleteServiceList(val[0])}>
                                      <p className={styles.buttonText}>Delete</p>
                                    </button>
                                  )}
                                </div>
                              </div>
                              {checkIsExist(val[0], 1) ? (
                                <section className={styles.containerInput}>
                                  {/* @todo-1 position the following in one line */}
                                  <h5 style={{marginTop: '2%'}}>ID: {val[0]}</h5>
                                  <input
                                    style={{ marginLeft: "2%", marginRight: "2%", width: "60%" }}
                                    type="text"
                                    placeholder='Type new service value'
                                    onChange={
                                      (event: { target: { value: any } }) => {
                                        let input = event.target.value;
                                        pushReplaceServiceList(val[0], input)
                                      }
                                    }
                                    autoFocus
                                  />
                                  <Image width={25} height={25} alt="tick-ico" src={tick} />
                                  {/* @todo-1 add tick symbol to show that the input data got saved */}
                                </section>
                              ) : <></>}
                            </>
                          ))}
                          <h4 className={styles.container}>
                            How many other services would you like to add?
                            <input
                              ref={callbackRef}
                              style={{ width: "20%", marginLeft: "2%" }}
                              type="text"
                              placeholder="Type amount"
                              onChange={handleInput}
                              autoFocus
                            />
                          </h4>
                          {input != 0 &&
                            select_input.map((res: number) => {
                              return (
                                <section key={res} className={styles.container}>
                                  <input
                                    ref={callbackRef}
                                    style={{ width: "20%" }}
                                    type="text"
                                    placeholder="Type ID"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                      const value = event.target.value;
                                      if (services[res] === undefined) {
                                        services[res] = ["", ""];
                                      }
                                      services[res][0] = value.toLowerCase();
                                    }}
                                  />
                                  <code>https://www.</code>
                                  <input
                                    ref={callbackRef}
                                    style={{ width: "60%" }}
                                    type="text"
                                    placeholder="Type service URL"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                      const value = event.target.value;
                                      if (services[res] === undefined) {
                                        services[res] = ["", ""];
                                      }
                                      services[res][1] = value.toLowerCase();
                                    }}
                                  />
                                </section>
                              );
                            })
                          }
                        </>
                      ):<></>}
                    </div>
                  );
                }
              })
            }
          </section>

          <div style={{ marginTop: '7%', textAlign: 'center' }}>
            <button
              type="button"
              className="button primary"
              onClick={handlePatches}
            >
              continue
            </button>
          </div>
        </>
      }
      {
        next &&
        <SubmitUpdateDoc
          {...{
            patches: patches,
          }}
        />
      }
    </>
  );
}

export default Component;
