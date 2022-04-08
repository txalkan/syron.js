import React from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useStore } from "effector-react";
import { $user } from "../../../src/store/user";
import { $doc } from "../../../src/store/did-doc";
import styles from "./styles.module.scss";
import backLogo from "../../../src/assets/logos/left-arrow.png";
import { $net } from "../../../src/store/wallet-network";

function Component() {
  const Router = useRouter();
  const net = useStore($net);
  const username = useStore($user)?.name;
  const doc = useStore($doc)?.doc;
  let exists = false;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
      }}
    >
      <h3 style={{ color: "silver" }}>Decentralized Identifier document</h3>
      {doc !== null &&
        doc?.map((res: any) => {
          if (res[0] === "Decentralized identifier") {
            const did = res[1] as string;
            switch (did) {
              case "Not activated yet.":
                return (
                  <div key={res} className={styles.docInfo}>
                    <p className={styles.didkey}>
                      This DID has not been created by {username} yet.
                    </p>
                  </div>
                );
              default: {
                exists = true;
                /* let's use the logged-in network instead of:
                let network = did.substring(14, 18);
                switch (network) {
                  case "test":
                    network = "testnet";
                    break;
                  case "main":
                    network = "mainnet";
                    break;
                }
                */
                const addr = did.substring(19);
                return (
                  <p key={res} className={styles.docInfo}>
                    <span className={styles.blockHead}>ID</span>
                    <span className={styles.did}>
                      {did.substring(0, 19)}
                      <a
                        href={`https://viewblock.io/zilliqa/address/${addr}?network=${net}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {addr}
                      </a>
                    </span>
                  </p>
                );
              }
            }
          }
        })}
      {exists && (
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: "7%" }}
        >
          <div
            className={styles.card}
            onClick={() => {
              Router.push(`/${username}/did/keys`);
            }}
          >
            <p className={styles.cardTitle}>KEYS</p>
            <p className={styles.cardTitle2}>VERIFICATION METHODS</p>
          </div>
          <div
            className={styles.card}
            onClick={() => {
              Router.push(`/${username}/did/services`);
            }}
          >
            <p className={styles.cardTitle}>SERVICES</p>
            <p className={styles.cardTitle2}>WEBSITES</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Component;
