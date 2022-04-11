import { useRouter } from "next/router";
import Layout from "../../../../../components/Layout";
import { NewDoc, Headline } from "../../../../../components";
import { updateIsController } from "../../../../../src/store/controller";
import { useStore } from "effector-react";
import { $user } from "../../../../../src/store/user";
import styles from "../../../../styles.module.scss";

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
          <h2 style={{ color: "#ffff32", margin: "10%" }}>DID recover</h2>
          <h4>With this transaction, you will reset your DID Document.</h4>
        </div>
        <NewDoc typeInput="recover" />
      </Layout>
    </>
  );
}

export default Recover;
