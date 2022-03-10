import { updateIsController } from "../../../../src/store/controller";
import { useRouter } from "next/router"
import { useStore } from "effector-react";
import { $user } from "../../../../src/store/user";
import styles from "./styles.module.scss";

export default function Upgrade() {
  const Router = useRouter();
  const user = useStore($user);

  return (
    <>
      <button
        type="button"
        className={styles.button}
        onClick={() => {
          updateIsController(true);
          Router.push(`/${user?.name}/xwallet/`)
        }}
      >
        <p className={styles.buttonText}>back</p>
      </button>
      <div style={{ marginTop: "70px" }}>
        <h4>
          On TYRON, you can transfer your NFT Username, tokens and
          ZIL, all in one transaction.
        </h4>
        <h5 style={{ color: "lightgrey" }}>
          Available from version 4.
        </h5>
      </div>
    </>
  )
}
