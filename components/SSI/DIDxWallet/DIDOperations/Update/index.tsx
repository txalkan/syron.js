import React, { useState } from "react";
import * as tyron from "tyron";
import { useRouter } from "next/router";
import { SubmitUpdateDoc, Headline } from "../../../..";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { $user } from "../../../../../src/store/user";
import { $doc } from "../../../../../src/store/did-doc";
import { updateIsController } from "../../../../../src/store/controller";

function Component() {
  const Router = useRouter();
  const username = useStore($user)?.name;
  const doc = useStore($doc)?.doc;
  const [replaceServiceList, setReplaceServiceList] = useState(Array());
  const [deleteServiceList, setDeleteServiceList] = useState(Array());
  const [replaceKeyList, setReplaceKeyList] = useState(Array());
  const [deleteKeyList, setDeleteKeyList] = useState(Array());

  const [next, setNext] = useState(false);
  const [patches, setPatches] = useState(Array());

  // @todo-1 reduce repetition in the following functions, add a new input variable to differentiate.
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
    if (!checkIsExist(id, 1)) {
      setReplaceServiceList([...replaceServiceList, obj]);
    }
  }

  const pushDeleteServiceList = (id) => {
    if (!checkIsExist(id, 2)) {
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
                      {res[0] !== 'DID services' ? (
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
                      ) : (
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
                                  <p>
                                    ID: {val[0]}
                                  </p>
                                  <input
                                    style={{ marginLeft: "2%", width: "60%" }}
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
                                  {/* @todo-1 add tick symbol to show that the input data got saved */}
                                </section>
                              ) : <></>}
                            </>
                          ))}
                        </>
                      )}
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
