import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "../../../../../components/Layout";
import { NewDoc, Headline } from "../../../../../components";
import { updateIsController } from "../../../../../src/store/controller";
import { useStore } from "effector-react";
import { $user } from "../../../../../src/store/user";
import styles from "../../../../styles.module.scss";
import Warning from "../../../../../src/assets/icons/warning.svg";

function Recover() {
  const Router = useRouter();
  const username = useStore($user)?.name;

  return (
    <>
      <Layout>
        <div className={styles.headlineWrapper}>
          <Headline />
          <div style={{ textAlign: "left", paddingLeft: "2%" }}>
            <button
              type="button"
              className="button"
              onClick={() => {
                updateIsController(true);
                Router.push(`/${username}/did/wallet/crud`);
              }}
            >
              <p style={{ color: "silver" }}>operations menu</p>
            </button>
          </div>
          <h2 style={{ color: "#ffff32", margin: "10%" }}>DID update</h2>
          <h4>
            With this transaction, you will upload a brand new DID Document.
            <span className={styles.tooltip}>
              <Image alt="warning-ico" src={Warning} width={20} height={20} />
              <span className={styles.tooltiptext}>
                <h5 className={styles.modalInfoTitle}>INFO</h5>
                <p>
                  This transaction is a specific type of DID Update operation
                  that is only possible after a DID Social Recovery operation.
                </p>
              </span>
            </span>
          </h4>
          {/* @todo-i-checked add pop up info box (idem get started) -
          INFO:
          This transaction is a specific type of DID Update operation that is only possible after a DID Social Recovery operation.
        */}
        </div>
        <NewDoc typeInput="recover" />
      </Layout>
    </>
  );
}

export default Recover;
