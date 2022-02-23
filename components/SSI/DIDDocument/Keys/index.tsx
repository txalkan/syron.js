import { useStore } from "effector-react";
import { useRouter } from "next/router";
import { $doc } from "../../../../src/store/did-doc";
import { updateSSIInterface } from "../../../../src/store/ssi_interface";
import styles from "./styles.module.scss";

function Component() {
  const doc = useStore($doc)?.doc;
  const Router = useRouter();

  return (
    <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
      <button
        type="button"
        className={styles.button}
        onClick={() => {
          updateSSIInterface("did");
          Router.back();
        }}
      >
        <p className={styles.buttonText}>back</p>
      </button>
      <div style={{ marginTop: "14%" }}>
        {doc !== null &&
          doc?.map((res: any) => {
            if (res[0] === "Decentralized identifier") {
              const did = res[1] as string;
              switch (did) {
                case "not activated yet.":
                  return (
                    <div key={res} className={styles.docInfo}>
                      <h3 className={styles.blockHead}>{res[0]}</h3>
                      <p className={styles.didkey}>{did}</p>
                    </div>
                  );
                default: {
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
                          style={{ color: "yellow" }}
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
            } else if (res[0] !== 'DID services') {
              return (
                <div key={res} className={styles.docInfo}>
                  <h3 className={styles.blockHead}>{res[0]}</h3>
                  {res[1].map((element: any) => {
                    return (
                      //@todo copy to clipboard
                      <p key={element} className={styles.didkey}>
                        {element}
                      </p>
                    );
                  })}
                </div>
              );
            }
          })}
      </div>
    </div>
  );
}

export default Component;
