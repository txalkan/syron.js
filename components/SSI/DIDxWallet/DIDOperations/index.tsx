import * as tyron from "tyron";
import { useStore } from "effector-react";
import React, { useState, ReactNode } from "react";
import { useRouter } from "next/router";
import { $contract } from "../../../../src/store/contract";
import styles from "./styles.module.scss";
import { $didOpsInterface, updateDidOpsInterface } from "../../../../src/store/didoperation-interface";
import { updateIsController } from "../../../../src/store/controller";
import { $user } from "../../../../src/store/user";

interface LayoutProps {
  children: ReactNode;
}

function Component(props: LayoutProps) {
  const { children } = props
  const Router = useRouter();

  const contract = useStore($contract);
  const didOpsInterface = useStore($didOpsInterface);
  const user = useStore($user);

  const [hideDeactivate, setHideDeactivate] = useState(true);
  const [deactivateLegend, setDeactivateLegend] = useState("deactivate");

  const is_operational =
    contract?.status !== tyron.Sidetree.DIDStatus.Deactivated &&
    contract?.status !== tyron.Sidetree.DIDStatus.Locked;

  const did_operational =
    is_operational && contract?.status !== tyron.Sidetree.DIDStatus.Deployed;

  return (
    <div style={{ marginTop: "14%" }}>
      {didOpsInterface === '' && (
          <h2 style={{ marginBottom: "70px", color: "silver" }}>
            DID operations
          </h2>
        )}
      <section>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {contract?.status === tyron.Sidetree.DIDStatus.Deployed &&
            didOpsInterface === '' && (
              <div
                className={styles.card}
                onClick={() => {
                  updateIsController(true)
                  updateDidOpsInterface('create')
                  Router.push(`/${user?.name}/xwallet/did/create`)
                }}
              >
                <p className={styles.cardTitle}>
                  CREATE
                </p>
                <p className={styles.cardTitle2}>
                  DESC
                </p>
              </div>
            )}
          {didOpsInterface === 'create' && (
            <div>
              <h2 style={{ marginBottom: "7%", color: "silver" }}>
                DID create
              </h2>
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  updateIsController(true)
                  updateDidOpsInterface('')
                  Router.push(`/${user?.name}/xwallet/did/`)
                }}
              >
                <p className={styles.buttonText}>BACK</p>
              </button>
              <h4>
                With this transaction, you can create a globally unique Decentralized Identifier (DID) and its DID Document.
              </h4>
              {children}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {did_operational && didOpsInterface === '' ? (
            <div
              className={styles.card}
              onClick={() => {
                updateIsController(true)
                updateDidOpsInterface('update')
                Router.push(`/${user?.name}/xwallet/did/update`)
              }}
            >
              <p className={styles.cardTitle}>
                UPDATE
              </p>
              <p className={styles.cardTitle2}>
                DESC
              </p>
            </div>
          ) : didOpsInterface === 'update' ? (
            <>
              <h3>
                <span style={{ color: "lightblue", marginRight: "3%" }}>
                  update
                </span>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => {
                    updateIsController(true)
                    updateDidOpsInterface('')
                    Router.push(`/${user?.name}/xwallet/did/`)
                  }}
                >
                  <p className={styles.buttonText}>BACK</p>
                </button>
              </h3>
            </>
          ):<></>}
          {didOpsInterface === 'update' && (
            <>
              <p>With this transaction, you can update your DID Document.</p>
              <div>
                {children}
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {did_operational &&
            didOpsInterface === '' && (
              <div
                className={styles.card}
                onClick={() => {
                  updateIsController(true)
                  updateDidOpsInterface('recover')
                  Router.push(`/${user?.name}/xwallet/did/recover`)
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
          {didOpsInterface === 'recover' && (
            <>
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  updateIsController(true)
                  updateDidOpsInterface('')
                  Router.push(`/${user?.name}/xwallet/did/`)
                }}
              >
                <p className={styles.buttonText}>BACK</p>
              </button>
              <div>
                {children} {/* @todo-1 add input element (enum) that in this case is 'recover' */}
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {did_operational &&
            didOpsInterface === '' && (
              <div
                className={styles.card}
                onClick={() => {
                  updateIsController(true)
                  updateDidOpsInterface('social')
                  Router.push(`/${user?.name}/xwallet/did/social`)
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
          {didOpsInterface === 'social' && (
            <>
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  updateIsController(true)
                  updateDidOpsInterface('')
                  Router.push(`/${user?.name}/xwallet/did/`)
                }}
              >
                <p className={styles.buttonText}>BACK</p>
              </button>
              <div>
                {children}
              </div>
            </>
          )}
        </div>
        <div>
          {is_operational &&
            contract?.status !== tyron.Sidetree.DIDStatus.Deployed &&
            didOpsInterface === '' && (
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
