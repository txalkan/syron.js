import React from "react";
import { useStore } from "effector-react";
import { $doc } from "../../../../../src/store/did-doc";
import styles from "./styles.module.scss";

function Component() {
  const doc = useStore($doc)?.doc;

  return (
    <div className={styles.wrapper}>
      {doc !== null &&
        doc?.map((res: any) => {
          if (res[0] === "DID services") {
            return (
              <div key={res}>
                {res[1].map((element: any) => {
                  let https = "https://";
                  switch (element[0]) {
                    case "bitcoin":
                      https =
                        "https://blockchain.coinmarketcap.com/address/bitcoin/";
                      break;
                    case "twitter":
                      https = "https://twitter.com/";
                      break;
                    case "github":
                      https = "https://github.com/";
                      break;

                    // @todo-x to get deprecated
                    case "phonenumber":
                      return (
                        <div className={styles.docInfo}>
                          <p key={element} className={styles.did}>
                            <span className={styles.id}>phone number </span>
                            {element[1]}
                          </p>
                        </div>
                      );
                  }
                  let link = "";
                  if (element[1] !== undefined) {
                    const prefix = element[1].slice(0, 8);
                    if (prefix === https) {
                      link = element[1];
                    } else {
                      link = https + element[1];
                    }
                  }
                  return (
                    <div
                      onClick={() => window.open(`${link}`)}
                      className={styles.docInfo}
                    >
                      <p key={element} className={styles.did}>
                        {element[0]}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          }
        })}
    </div>
  );
}

export default Component;
