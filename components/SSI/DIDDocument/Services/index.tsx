import React from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useStore } from "effector-react";
import { $doc } from "../../../../src/store/did-doc";
import { $user } from "../../../../src/store/user";
import styles from "./styles.module.scss";
import backLogo from "../../../../src/assets/logos/left-arrow.png";

function Component() {
  const username = useStore($user)?.name;
  const doc = useStore($doc)?.doc;
  const Router = useRouter();

  return (
    <div className={styles.wrapper}>
      <div style={{ width: "115%" }}>
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
      <button
        type="button"
        className={styles.buttonBack}
        onClick={() => {
          Router.push(`/${username}/did`);
        }}
      >
        <p className={styles.buttonBackText}>back to DID Doc</p>
      </button>
      <h2 className={styles.title}>DID Services</h2>
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
