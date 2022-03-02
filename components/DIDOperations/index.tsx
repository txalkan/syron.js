import * as tyron from "tyron";
import { useStore } from "effector-react";
import React, { useState } from "react";
import { $contract } from "../../src/store/contract";
import { NewDoc, DidUpdate, DidSocialRecovery } from "..";
import styles from "./styles.module.scss";

function Component() {
  const contract = useStore($contract);
  const [hideCreate, setHideCreate] = useState(true);
  const [createLegend, setCreateLegend] = useState("create");

  const [hideUpdate, setHideUpdate] = useState(true);
  const [updateLegend, setUpdateLegend] = useState("update");

  const [hideRecover, setHideRecover] = useState(true);
  const [recoverLegend, setRecoverLegend] = useState("recover");

  const [hideRecovery, setHideRecovery] = useState(true);
  const [recoveryLegend, setRecoveryLegend] = useState("social recovery");

  const [hideDeactivate, setHideDeactivate] = useState(true);
  const [deactivateLegend, setDeactivateLegend] = useState("deactivate");

  const is_operational =
    contract?.status !== tyron.Sidetree.DIDStatus.Deactivated &&
    contract?.status !== tyron.Sidetree.DIDStatus.Locked;

  const did_operational =
    is_operational && contract?.status !== tyron.Sidetree.DIDStatus.Deployed;

  return (
    <div style={{ marginTop: "14%" }}>
      {hideCreate &&
        hideUpdate &&
        hideRecover &&
        hideRecovery &&
        hideDeactivate && (
          <h2 style={{ marginBottom: "70px", color: "silver" }}>
            DID operations
          </h2>
        )}
      <section>
        <div>
          {contract?.status === tyron.Sidetree.DIDStatus.Deployed &&
            hideUpdate &&
            hideRecover &&
            hideRecovery &&
            hideDeactivate &&
            hideCreate && (
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  setHideCreate(false);
                  setCreateLegend("back");
                }}
              >
                <p className={styles.buttonColorText}>{createLegend}</p>
              </button>
            )}
          {!hideCreate && (
            <div>
              <h2 style={{ marginBottom: "7%", color: "silver" }}>
                DID create
              </h2>
              <h4>
                With this transaction, you can create a globally unique Decentralized Identifier (DID) and its DID Document.
              </h4>
              <NewDoc />
            </div>
          )}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          {did_operational &&
            hideCreate &&
            hideRecover &&
            hideRecovery &&
            hideDeactivate && (
              <>
                {hideUpdate ? (
                  <div
                    className={styles.card}
                    onClick={() => {
                      setHideUpdate(false);
                      setUpdateLegend("back");
                    }}
                  >
                    <p className={styles.cardTitle}>
                      UPDATE
                    </p>
                    <p className={styles.cardTitle2}>
                      DESC
                    </p>
                  </div>
                ) : (
                  <>
                    <h3>
                      <span style={{ color: "lightblue", marginRight: "3%" }}>
                        update
                      </span>
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setHideUpdate(true);
                          setUpdateLegend("update");
                        }}
                      >
                        <p className={styles.buttonText}>{updateLegend}</p>
                      </button>
                    </h3>
                  </>
                )}
              </>
            )}
          {!hideUpdate && (
            <>
              <p>With this transaction, you can update your DID Document.</p>
              <div>
                <DidUpdate />
              </div>
            </>
          )}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          {did_operational &&
            hideCreate &&
            hideUpdate &&
            hideRecovery &&
            hideDeactivate &&
            hideRecover && (
              <div
                className={styles.card}
                onClick={() => {
                  setHideRecover(false);
                  setRecoverLegend("back");
                }}
              >
                <p className={styles.cardTitle}>
                  RECOVER
                </p>
                <p className={styles.cardTitle2}>
                  DESC
                </p>
              </div>
            )}
          {!hideRecover && (
            <div>
              <NewDoc />
            </div>
          )}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          {did_operational &&
            hideCreate &&
            hideUpdate &&
            hideRecover &&
            hideDeactivate &&
            hideRecovery && (
              <div
                className={styles.card}
                onClick={() => {
                  setHideRecovery(false);
                  setRecoveryLegend("back");
                }}
              >
                <p className={styles.cardTitle}>
                  SOCIAL RECOVERY
                </p>
                <p className={styles.cardTitle2}>
                  DESC
                </p>
              </div>
            )}
          {!hideRecovery && (
            <div>
              <DidSocialRecovery />
            </div>
          )}
        </div>
        <div>
          {is_operational &&
            contract?.status !== tyron.Sidetree.DIDStatus.Deployed &&
            hideCreate &&
            hideUpdate &&
            hideRecover &&
            hideRecovery && (
              <>
                {hideDeactivate ? (
                  <p>
                    <span style={{ marginLeft: "2%", marginRight: "3%" }}>
                      Danger zone
                    </span>
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => {
                        setHideDeactivate(false);
                        setDeactivateLegend("back");
                      }}
                    >
                      <p className={styles.buttonColorDText}>
                        {deactivateLegend}
                      </p>
                    </button>
                  </p>
                ) : (
                  <>
                    <h3>
                      <span style={{ color: "red", marginRight: "3%" }}>
                        deactivate
                      </span>
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setHideDeactivate(true);
                          setDeactivateLegend("deactivate");
                        }}
                      >
                        <p className={styles.buttonText}>{deactivateLegend}</p>
                      </button>
                    </h3>
                  </>
                )}
              </>
            )}
          {!hideDeactivate && (
            <>
              <p>Coming soon.</p>
            </>
          )}
        </div>
      </section >
    </div >
  );
}

export default Component;
