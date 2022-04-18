import {
  $isController,
  updateIsController,
} from "../../../../../src/store/controller";
import { $arconnect } from "../../../../../src/store/arconnect";
import { $user } from "../../../../../src/store/user";
import styles from "./styles.module.scss";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useStore } from "effector-react";
import { useEffect } from "react";
import { RootState } from "../../../../../src/app/reducers";
import { useSelector } from "react-redux";

export default function CardList() {
  const Router = useRouter();
  const arConnect = useSelector((state: RootState) => state.modal.arConnect);
  const user = useStore($user);
  const isController = useStore($isController);
  const username = user?.name;

  useEffect(() => {
    if (!isController) {
      Router.push(`/${username}`);
      setTimeout(() => {
        toast.error(`Only controller can access this wallet.`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }, 1000);
    }
  });

  return (
    <div style={{ textAlign: "center" }}>
      <h2>
        <div
          onClick={() => {
            if (arConnect === null) {
              toast.warning("Connect with ArConnect.", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
              });
            } else {
              updateIsController(true);
              Router.push(`/${username}/did/wallet/crud`);
            }
          }}
          className={styles.flipCard}
        >
          <div className={styles.flipCardInner}>
            <div className={styles.flipCardFront}>
              <p className={styles.cardTitle3}>DID OPERATIONS</p>
            </div>
            <div className={styles.flipCardBack}>
              <p className={styles.cardTitle2}>manage your digital identity</p>
            </div>
          </div>
        </div>
      </h2>
      <h2>
        <div
          onClick={() => {
            updateIsController(true);
            Router.push(`/${username}/did/wallet/nft`);
          }}
          className={styles.flipCard}
        >
          <div className={styles.flipCardInner}>
            <div className={styles.flipCardFront}>
              <p className={styles.cardTitle3}>NFT USERNAME</p>
            </div>
            <div className={styles.flipCardBack}>
              <p className={styles.cardTitle2}>
                CREATE DID DOMAINS or TRANSFER USERNAME
              </p>
            </div>
          </div>
        </div>
      </h2>
      <h2>
        <div
          onClick={() => {
            alert("Coming soon!");
            {
              /**
            updateIsController(true);
            Router.push(`/${username}/xwallet/upgrade`)
           */
            }
          }}
          className={styles.flipCard}
        >
          <div className={styles.flipCardInner}>
            <div className={styles.flipCardFront}>
              <p className={styles.cardTitle3}>UPGRADE</p>
            </div>
            <div className={styles.flipCardBack}>
              <p className={styles.cardTitle2}>COMING SOON!</p>
            </div>
          </div>
        </div>
      </h2>
      <h2>
        <div
          onClick={() => {
            updateIsController(true);
            Router.push(`/${username}/did/wallet/withdraw`);
          }}
          className={styles.flipCard}
        >
          <div className={styles.flipCardInner}>
            <div className={styles.flipCardFront}>
              <p className={styles.cardTitle3}>WITHDRAW</p>
            </div>
            <div className={styles.flipCardBack}>
              <p className={styles.cardTitle2}>SEND FUNDS OUT OF YOUR WALLET</p>
            </div>
          </div>
        </div>
      </h2>
    </div>
  );
}
