import React from "react";
import { useStore } from "effector-react";
import { $doc } from "../../../../src/store/did-doc";
import styles from "./styles.module.scss";

function Component() {
  const doc = useStore($doc)?.doc;

  return (
    <div className={styles.wrapper}>
      {doc !== null &&
        doc?.map((res: any) => {
          if (res[0] === "DID services") {
            return (
              <div key={res} className={styles.docInfo}>
                {res[1].map((element: any) => {
                  let https = "https://";
                  switch (element[0]) {
                    case "bitcoin":
                      https = "https://www.blockchain.com/btc/address/";
                      break;
                    case "twitter":
                      https = "https://twitter.com/";
                      break;
                    case "github":
                      https = "https://github.com/";
                      break;
                    case "phonenumber":
                      return (
                        <p key={element} className={styles.did}>
                          <span className={styles.id}>phone number </span>
                          {element[1]}
                        </p>
                      );
                  }
                  let link;
                  const prefix = element[1].substring(0, 8);
                  if (prefix === https) {
                    link = element[1];
                  } else {
                    link = https + element[1];
                  }
                  return (
                    <p key={element} className={styles.did}>
                      <a href={`${link}`} rel="noreferrer" target="_blank">
                        {element[0]}
                      </a>
                    </p>
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
