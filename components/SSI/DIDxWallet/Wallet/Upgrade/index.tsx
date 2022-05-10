import { updateIsController } from "../../../../../src/store/controller";
import { useRouter } from "next/router";
import { Headline } from "../../../..";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { $user } from "../../../../../src/store/user";
import controller from "../../../../../src/hooks/isController";
import { useEffect } from "react";

export default function Upgrade() {
  const Router = useRouter();
  const username = useStore($user)?.name;
  const { isController } = controller();

  useEffect(() => {
    isController();
  });

  return (
    <div style={{ marginTop: "100px", textAlign: "center" }}>
      <Headline />
      <div>
        <button
          type="button"
          className={styles.button}
          onClick={() => {
            updateIsController(true);
            Router.push(`/${username}/did/wallet`);
          }}
        >
          <p className={styles.buttonText}>wallet menu</p>
        </button>
      </div>
      <div style={{ marginTop: "70px" }}>
        <h4>
          On TYRON, you can transfer your NFT Username, tokens and ZIL, all in
          one transaction.
        </h4>
        <h5 style={{ color: "lightgrey" }}>Available from version 4.</h5>
      </div>
    </div>
  );
}
