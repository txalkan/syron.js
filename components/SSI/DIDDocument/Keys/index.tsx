import { useStore } from "effector-react";
import { useRouter } from "next/router";
import { $doc } from "../../../../src/store/did-doc";
import { $user } from "../../../../src/store/user";
import styles from "./styles.module.scss";

function Component() {
  const username = useStore($user)?.name;
  const doc = useStore($doc)?.doc;
  const Router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10%', textAlign: 'center' }}>
      <button
        type="button"
        className={styles.buttonBack}
        onClick={() => {
          Router.push(`/${username}/did`);
        }}
      >
        <p className={styles.buttonBackText}>back to DID Doc</p>
      </button>
      <h2 className={styles.title}>DID Keys</h2>
      {doc !== null &&
        doc?.map((res: any) => {
          if (res[0] !== "Decentralized identifier" && res[0] !== 'DID services') {
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
  );
}

export default Component;
