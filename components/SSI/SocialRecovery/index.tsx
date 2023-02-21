import React, { useState } from "react";
import { useStore } from "effector-react";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import { Lock, SocialRecover, Sign } from "../..";
import styles from "./styles.module.scss";
import { $contract } from "../../../src/store/contract";
import { $doc } from "../../../src/store/did-doc";
import { $user } from "../../../src/store/user";
import { $arconnect } from "../../../src/store/arconnect";
import { useRouter } from "next/router";
import Image from "next/image";
import backLogo from "../../../src/assets/logos/left-arrow.png";

function Component() {
  const Router = useRouter();
  const doc = useStore($doc);
  const username = useStore($user)?.name;
  const contract = useStore($contract);
  const arConnect = useStore($arconnect);

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
        marginTop: "100px",
      }}
    >
      <div style={{ width: "100%" }}>
        <div
          onClick={() => {
            Router.push(`/${username}`);
          }}
          className={styles.backIco}
        >
          <Image width={25} height={25} alt="back-ico" src={backLogo} />
        </div>
        <h1 className={styles.headline}>
          <span style={{ textTransform: "lowercase" }}>{username}&apos;s</span>{" "}
          SSI
        </h1>
      </div>
      <h2 className={styles.title}>DID social recovery</h2>
      {doc?.guardians.length === 0 && hideSig && hideLock && (
        <h4>Social recovery has not been enabled by {username} yet.</h4>
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
