import { updateIsController } from "../../../../src/store/controller";
import { $arconnect } from "../../../../src/store/arconnect";
import { $user } from "../../../../src/store/user";
import styles from "./styles.module.scss";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useStore } from "effector-react";

export default function CardList() {
  const Router = useRouter();
  const arConnect = useStore($arconnect);
  const user = useStore($user);
  const username = user?.name;

  return (
    <div>
      <h2>
        <div
          className={styles.card}
          onClick={() => {
            if (arConnect === null) {
              toast.warning('Connect your SSI Private Key', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
              });
            } else {
              updateIsController(true);
              Router.push(`/${username}/xwallet/did`)
            }
          }}
        >
          <p className={styles.cardTitle3}>
            DID OPERATIONS
          </p>
          <p className={styles.cardTitle2}>
            Create, update, recover or deactivate
          </p>
        </div>
      </h2>

      <h2>
        <div
          className={styles.card}
          onClick={() => {
            updateIsController(true);
            Router.push(`/${username}/xwallet/nft`)
          }}
        >
          <p className={styles.cardTitle3}>
            NFT USERNAME
          </p>
          <p className={styles.cardTitle2}>
            CREATE DID DOMAINS or TRANSFER USERNAME
          </p>
        </div>
      </h2>

      <h2>
        <div
          className={styles.card}
          onClick={() => {
            updateIsController(true);
            Router.push(`/${username}/xwallet/upgrade`)
          }}
        >
          <p className={styles.cardTitle3}>
            UPGRADE
          </p>
          <p className={styles.cardTitle2}>
            coming soon!
          </p>
        </div>
      </h2>
      
      <h2>
        <div
          className={styles.card}
          onClick={() => {
            updateIsController(true);
            Router.push(`/${username}/xwallet/withdraw`)
          }}
        >
          <p className={styles.cardTitle3}>
            WITHDRAW
          </p>
          <p className={styles.cardTitle2}>
            SEND FUNDS OUT OF YOUR WALLET
          </p>
        </div>
      </h2>
    </div>
  )
}
