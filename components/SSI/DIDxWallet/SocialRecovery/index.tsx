import React, { useState } from "react";
import { useStore } from "effector-react";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Lock, SocialRecover, Sign } from "../../..";
import styles from "./styles.module.scss";
import { $contract } from "../../../../src/store/contract";
import { $doc } from "../../../../src/store/did-doc";
import { $user } from "../../../../src/store/user";
import { RootState } from "../../../../src/app/reducers";

function Component() {
  const doc = useStore($doc);
  const username = useStore($user)?.name;
  const contract = useStore($contract);
  const arConnect = useSelector((state: RootState) => state.modal.arConnect);

  const [hideRecovery, setHideRecovery] = useState(true);
  const [recoveryLegend, setRecoveryLegend] = useState("recover");

  const [hideLock, setHideLock] = useState(true);
  const [lockLegend, setLockLegend] = useState("lock");

  const [hideSig, setHideSig] = useState(true);
  const [sigLegend, setSigLegend] = useState("sign address");

  const is_operational =
    contract?.status !== tyron.Sidetree.DIDStatus.Deactivated &&
    contract?.status !== tyron.Sidetree.DIDStatus.Locked;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      <h2 className={styles.title}>DID social recovery</h2>
      {doc?.guardians.length === 0 && hideSig && hideLock && (
        <p>Social recovery has not been enabled by {username} yet.</p>
      )}
      <ul>
        <li>
          {doc?.guardians.length !== 0 && hideLock && hideSig && hideRecovery && (
            <>
              <p>
                {username} has {doc?.guardians.length} guardians
              </p>
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  setHideRecovery(false);
                  setRecoveryLegend("back");
                }}
              >
                <p className={styles.buttonColorText}>{recoveryLegend}</p>
              </button>
            </>
          )}
          {!hideRecovery && (
            <div>
              <SocialRecover />
            </div>
          )}
        </li>
        <li>
          {hideRecovery && hideLock && hideSig && (
            <div style={{ margin: "10%" }}>
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  if (arConnect === null) {
                    toast.warning("Connect with ArConnect.", {
                      position: "top-center",
                      autoClose: 2000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "dark",
                    });
                  } else {
                    setHideSig(false);
                    setSigLegend("back");
                  }
                }}
              >
                <p className={styles.buttonText}>{sigLegend}</p>
              </button>
            </div>
          )}
          {!hideSig && <Sign />}
        </li>
        <li>
          {is_operational &&
            contract?.status !== tyron.Sidetree.DIDStatus.Deployed &&
            hideRecovery &&
            hideSig &&
            hideLock && (
              <p>
                <h5 style={{ color: "red", marginTop: "7%" }}>Danger zone</h5>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => {
                    if (arConnect === null) {
                      toast.warning("Connect with ArConnect.", {
                        position: "top-center",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                      });
                    } else {
                      setHideLock(false);
                      setLockLegend("back");
                    }
                  }}
                >
                  <p className={styles.buttonColorDText}>{lockLegend}</p>
                </button>
              </p>
            )}
          {!hideLock && (
            <div>
              <Lock />
            </div>
          )}
        </li>
      </ul>
    </div>
  );
}

export default Component;
