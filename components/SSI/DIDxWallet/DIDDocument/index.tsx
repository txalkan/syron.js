import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useStore } from "effector-react";
import { $user } from "../../../../src/store/user";
import { $doc } from "../../../../src/store/did-doc";
import styles from "./styles.module.scss";
import { $net } from "../../../../src/store/wallet-network";
import { $loadingDoc } from "../../../../src/store/loading";
import fetchDoc from "../../../../src/hooks/fetchDoc";

function Component() {
  const Router = useRouter();
  const net = useStore($net);
  const loadingDoc = useStore($loadingDoc);
  const username = useStore($user)?.name;
  const doc = useStore($doc)?.doc;
  let exists = false;

  const { fetch } = fetchDoc();

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spinner = (
    <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
      }}
    >
      {loadingDoc ? (
        spinner
      ) : (
        <>
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
                            href={`https://devex.zilliqa.com/address/${addr}?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"
                              }api.zilliqa.com`}
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
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "7%",
              }}
            >
              <div
                onClick={() => {
                  Router.push(`/${username}/did/doc/keys`);
                }}
                className={styles.flipCard}
              >
                <div className={styles.flipCardInner}>
                  <div className={styles.flipCardFront}>
                    <p className={styles.cardTitle3}>KEYS</p>
                  </div>
                  <div className={styles.flipCardBack}>
                    <p className={styles.cardTitle2}>VERIFICATION METHODS</p>
                  </div>
                </div>
              </div>
              <div
                onClick={() => {
                  Router.push(`/${username}/did/doc/services`);
                }}
                className={styles.flipCard}
              >
                <div className={styles.flipCardInner}>
                  <div className={styles.flipCardFront}>
                    <p className={styles.cardTitle3}>SERVICES</p>
                  </div>
                  <div className={styles.flipCardBack}>
                    <p className={styles.cardTitle2}>WEBSITES</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Component;
