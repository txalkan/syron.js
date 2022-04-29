import { useStore } from "effector-react";
import React, { ReactNode } from "react";
import { useSelector } from "react-redux";
import { $doc } from "../../../src/store/did-doc";
import { $user } from "../../../src/store/user";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { $contract } from "../../../src/store/contract";
import { updateIsController } from "../../../src/store/controller";
import { RootState } from "../../../src/app/reducers";
import { $dashboardState } from "../../../src/store/modal";

interface LayoutProps {
  children: ReactNode;
}

function Component(props: LayoutProps) {
  const { children } = props;
  const Router = useRouter();

  const username = useStore($user)?.name as string;
  const doc = useStore($doc);
  const contract = useStore($contract);
  const controller = contract?.controller;
  const zilAddr = useSelector((state: RootState) => state.modal.zilAddr);
  const dashboardState = useStore($dashboardState);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ marginBottom: "10%" }}>
        <span style={{ color: "silver" }}>
          Self-sovereign identity
          <p style={{ textTransform: "lowercase", marginTop: "3%" }}>of</p>
        </span>
        <p className={styles.username}>{username}.did</p>
      </h1>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        {children}
      </div>
      <div
        style={{
          marginTop: "7%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2>
            <div
              onClick={() => {
                Router.push(`/${username}/did/doc`);
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>did</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>
                    Decentralized Identifier Document
                  </p>
                </div>
              </div>
            </div>
          </h2>
          <h2>
            <div
              onClick={() => {
                Router.push(`/${username}/did/recovery`);
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront2}>
                  <p className={styles.cardTitle3}>Social Recovery</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>Update DID Controller</p>
                </div>
              </div>
            </div>
          </h2>
        </div>
        <div className={styles.xText}>
          <h5 style={{ color: "#ffff32" }}>x</h5>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2>
            <div
              onClick={() => {
                if (dashboardState === "loggedIn") {
                  if (controller === zilAddr?.base16) {
                    updateIsController(true);
                    Router.push(`/${username}/did/wallet`);
                  } else {
                    toast.error(
                      `Only ${username}'s DID Controller can access this wallet.`,
                      {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                      }
                    );
                  }
                } else {
                  toast.warning(`To continue, log in.`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                  });
                }
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>wallet</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>smart contract wallet</p>
                </div>
              </div>
            </div>
          </h2>
          <h2>
            <div
              onClick={() => {
                if (
                  Number(doc?.version.slice(8, 9)) >= 4 ||
                  doc?.version.slice(0, 4) === "init" ||
                  doc?.version.slice(0, 3) === "dao"
                ) {
                  Router.push(`/${username}/did/funds`);
                } else {
                  toast.info(
                    `Feature unavailable. Upgrade ${username}'s SSI.`,
                    {
                      position: "top-center",
                      autoClose: 2000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "dark",
                    }
                  );
                }
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront2}>
                  <p className={styles.cardTitle3}>add funds</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>top up wallet</p>
                </div>
              </div>
            </div>
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Component;
