import { useStore } from "effector-react";
import React, { ReactNode } from "react";
import { $doc } from "../../src/store/did-doc";
import { $user } from "../../src/store/user";
import { $isAdmin } from "../../src/store/admin";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";

interface LayoutProps {
  children: ReactNode;
}

function Component(props: LayoutProps) {
  const { children } = props;
  const Router = useRouter();
  const user = useStore($user);
  const doc = useStore($doc);
  const is_admin = useStore($isAdmin);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ marginBottom: "10%" }}>
        <span style={{ color: 'silver' }}>
          Self-sovereign identity
          <p style={{ textTransform: "lowercase" }}>
            of
          </p>
        </span>
        <p className={styles.username}>
          {user?.name}.did
        </p>
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
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <h2>
            <div
              className={styles.card}
              onClick={() => {
                Router.push(`/${user?.name}/did`);
              }}
            >
              <p className={styles.cardTitle3}>did</p>
              <p className={styles.cardTitle2}>
                Decentralized Identifier document
              </p>
            </div>
          </h2>
          {
            is_admin?.verified &&
            <>
              <div className={styles.xText}>
                <h5>x</h5>
              </div>
              <h2>
                <div
                  className={styles.card}
                  onClick={() => {
                    Router.push(`/${user?.name}/xwallet`);
                  }}
                >
                  <p className={styles.cardTitle}>wallet</p>
                  <p className={styles.cardTitle2}>
                    Access your wallet
                  </p>
                </div>
              </h2>
            </>
          }
        </div>
        <h2>
          <div
            className={styles.card}
            onClick={() => {
              if (
                Number(doc?.version.slice(8, 1)) >= 4 ||
                doc?.version.slice(0, 4) === "init" ||
                doc?.version.slice(0, 3) === "dao"
              ) {
                Router.push(`/${user?.name}/funds`);
              } else {
                toast.info(`This feature is available from version 4. Upgrade ${user?.name}'s SSI.`, {
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
            }}
          >
            <p className={styles.cardTitle3}>add funds</p>
            <p className={styles.cardTitle2}>
              Donate to {user?.name}
            </p>
          </div>
        </h2>
        <h2>
          <div
            className={styles.card}
            onClick={() => {
              Router.push(`/${user?.name}/recovery`);
            }}
          >
            <p className={styles.cardTitle3}>social recovery</p>
            <p className={styles.cardTitle2}>
              Update DID Controller
            </p>
          </div>
        </h2>
      </div>
    </div >
  );
}

export default Component;
