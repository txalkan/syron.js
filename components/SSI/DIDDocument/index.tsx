import React from "react";
import { useRouter } from 'next/router'
import Image from 'next/image';
import { useStore } from "effector-react";
import { $user } from "../../../src/store/user";
import { $doc } from "../../../src/store/did-doc";
import styles from "./styles.module.scss";
import backLogo from '../../../src/assets/logos/left-arrow.png'

function Component() {
  const username = useStore($user)?.name;
  const doc = useStore($doc)?.doc;
  const Router = useRouter();

  let exists = false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '100px', textAlign: 'center' }}>
      <div
        onClick={() => {
          Router.push(`/${username}`);
        }}
        className={styles.backIco}
      >
        <Image width={25} height={25} alt="back-ico" src={backLogo} />
      </div>
      <h1 className={styles.headline}>
        <span style={{ textTransform: "lowercase" }}>{username}&apos;s</span> SSI
      </h1>
      <div>
        <h1 className={styles.title}>
          DID Document
        </h1>
        {doc !== null &&
          doc?.map((res: any) => {
            if (res[0] === "Decentralized identifier") {
              const did = res[1] as string;
              switch (did) {
                case "Not activated yet.":
                  return (
                    <div key={res} className={styles.docInfo}>
                      <h3 className={styles.blockHead}>{res[0]}</h3>
                      <p className={styles.didkey}>{did}</p>
                    </div>
                  );
                default: {
                  exists = true;
                  let network = did.substring(14, 18);
                  switch (network) {
                    case "test":
                      network = "testnet";
                      break;
                    case "main":
                      network = "mainnet";
                      break;
                  }
                  const addr = did.substring(19);
                  return (
                    <div key={res} className={styles.docInfo}>
                      <h3 className={styles.blockHead}>{res[0]}</h3>
                      <p className={styles.did}>
                        {did.substring(0, 19)}
                        <a
                          style={{ color: '#ffff32' }}
                          href={`https://viewblock.io/zilliqa/address/${addr}?network=${network}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {addr}
                        </a>
                      </p>
                    </div>
                  );
                }
              }
            }
          })}
        {
          exists &&
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '7%' }}>
            <div
              className={styles.card}
              onClick={() => {
                Router.push(`/${username}/did/keys`)
              }}
            >
              <p className={styles.cardTitle}>
                KEYS
              </p>
              <p className={styles.cardTitle2}>
                VERIFICATION METHODS
              </p>
            </div>
            <div
              className={styles.card}
              onClick={() => {
                Router.push(`/${username}/did/services`)
              }}
            >
              <p className={styles.cardTitle}>
                SERVICES
              </p>
              <p className={styles.cardTitle2}>
                WEBSITES
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export default Component;
