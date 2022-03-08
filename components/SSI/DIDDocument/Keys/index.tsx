import React from "react";
import { useRouter } from "next/router";
import Image from 'next/image';
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import { $doc } from "../../../../src/store/did-doc";
import { $user } from "../../../../src/store/user";
import styles from "./styles.module.scss";
import backLogo from '../../../../src/assets/logos/left-arrow.png'

function Component() {
  const username = useStore($user)?.name;
  const doc = useStore($doc)?.doc;
  const Router = useRouter();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info("Key copied to clipboard!", {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '100px', textAlign: 'center', alignItems: 'center' }}>
      <div style={{width: '90%'}}>
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
      <h2 className={styles.title}>DID Keys</h2>
      {doc !== null &&
        doc?.map((res: any) => {
          if (res[0] !== "Decentralized identifier" && res[0] !== 'DID services') {
            return (
              <div key={res} className={styles.docInfo}>
                <h3 className={styles.blockHead}>{res[0]}</h3>
                {res[1].map((element: any) => {
                  return (
                    //@todo-1 copy to clipboard: done
                    <p onClick={() => copyToClipboard(element)} key={element} className={styles.didkey}>
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
