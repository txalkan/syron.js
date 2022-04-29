import React from "react";
import { useRouter } from "next/router";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { $user } from "../../../../../../src/store/user";
import { toast } from "react-toastify";

function Component() {
  const user = useStore($user);
  const Router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
      }}
    >
      <button
        onClick={() => {
          Router.push(`/${user?.name}/did/wallet/nft`);
        }}
        className="button"
        style={{ marginBottom: "50%" }}
      >
        <p>BACK</p>
      </button>
      <h2>
        <div
          onClick={() => {
            toast("Coming soon", {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            })
            //Router.push(`/${user?.name}/did/wallet/nft/manage/did`);
          }}
          className={styles.flipCard}
        >
          <div className={styles.flipCardInner}>
            <div className={styles.flipCardFront}>
              <p className={styles.cardTitle3}>UPDATE NFT DID</p>
            </div>
            <div className={styles.flipCardBack}>
              <p className={styles.cardTitle2}>change the did associated with your username</p>
            </div>
          </div>
        </div>
      </h2>
      <h2>
        <div
          onClick={() => {
            toast("Coming soon", {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            })
            //Router.push(`/${user?.name}/did/wallet/nft/manage/transfer`);
          }}
          className={styles.flipCard}
        >
          <div className={styles.flipCardInner}>
            <div className={styles.flipCardFront}>
              <p className={styles.cardTitle3}>TRANSFER NFT USERNAME</p>
            </div>
            <div className={styles.flipCardBack}>
              <p className={styles.cardTitle2}>Modify the address associated with your username</p>
            </div>
          </div>
        </div>
      </h2>
    </div>
  );
}

export default Component;
