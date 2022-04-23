import React, { useState } from "react";
import * as tyron from "tyron";
import { useStore } from "effector-react";
import { useRouter } from "next/router";
import { $contract } from "../../../../src/store/contract";
import { $user } from "../../../../src/store/user";
import { updateIsController } from "../../../../src/store/controller";
import styles from "./styles.module.scss";

function Component() {
  const username = useStore($user)?.name;
  const contract = useStore($contract);

  const Router = useRouter();

  const [hideDeactivate, setHideDeactivate] = useState(true);

  const is_operational =
    contract?.status !== tyron.Sidetree.DIDStatus.Deactivated &&
    contract?.status !== tyron.Sidetree.DIDStatus.Locked;

  const did_operational =
    is_operational && contract?.status !== tyron.Sidetree.DIDStatus.Deployed;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
      }}
    >
      {contract?.status === tyron.Sidetree.DIDStatus.Deployed && (
        <h2>
          <div
            className={styles.card}
            onClick={() => {
              updateIsController(true);
              Router.push(`/${username}/xwallet/did/create`);
            }}
          >
            <p className={styles.cardTitle}>CREATE</p>
            <p className={styles.cardTitle2}>generate DID</p>
          </div>
        </h2>
      )}
      {did_operational && (
        <h2>
          <div
            className={styles.card}
            onClick={() => {
              updateIsController(true);
              Router.push(`/${username}/xwallet/did/update`);
            }}
          >
            <p className={styles.cardTitle}>UPDATE</p>
            <p className={styles.cardTitle2}>change document</p>
          </div>
        </h2>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {did_operational && (
          <h2>
            <div
              className={styles.card}
              onClick={() => {
                alert("Coming soon!");
                /* 
                updateIsController(true)
                Router.push(`/${username}/xwallet/did/recover`)*/
              }}
            >
              <p className={styles.cardTitle}>RECOVER</p>
              <p className={styles.cardTitle2}>reset document</p>
            </div>
          </h2>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {did_operational && (
          <h2>
            <div
              className={styles.card}
              onClick={() => {
                updateIsController(true);
                Router.push(`/${username}/xwallet/did/social`);
              }}
            >
              <p className={styles.cardTitle}>SOCIAL RECOVERY</p>
              <p className={styles.cardTitle2}>configure guardians</p>
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
        {is_operational &&
          contract?.status !== tyron.Sidetree.DIDStatus.Deployed && (
            <>
              {hideDeactivate ? (
                <>
                  <h5 style={{ color: "red", marginTop: "10%" }}>
                    Danger zone
                  </h5>
                  <h2>
                    <div
                      className={styles.card2}
                      onClick={() => {
                        setHideDeactivate(false);
                      }}
                    >
                      <p className={styles.cardTitle}>DEACTIVATE</p>
                      <p className={styles.cardTitle3}>
                        permanent deactivation
                      </p>
                    </div>
                  </h2>
                </>
              ) : (
                <div style={{ marginTop: "7%" }}>
                  <h2 style={{ color: "red" }}>DID deactivate</h2>
                  <p>Are you sure? There is no way back.</p>
                  <button
                    className={styles.deactivateYes}
                    onClick={() => {
                      alert("Coming soon!");
                    }}
                  >
                    <p>YES</p>
                  </button>
                  <button
                    className={styles.deactivateNo}
                    onClick={() => {
                      setHideDeactivate(true);
                    }}
                  >
                    <p>NO</p>
                  </button>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
}

export default Component;
