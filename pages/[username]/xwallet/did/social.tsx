import { useRouter } from "next/router";
import Layout from "../../../../components/Layout";
import { DidSocialRecovery, Headline } from "../../../../components";
import { updateIsController } from "../../../../src/store/controller";
import { useStore } from "effector-react";
import { $user } from "../../../../src/store/user";
import styles from "./styles.module.scss";

function Social() {
  const Router = useRouter();
  const username = useStore($user)?.name;
  return (
    <>
      <Layout>
        <div className={styles.headlineWrapper}>
          <Headline />
          <div style={{ textAlign: "left" }}>
            <button
              type="button"
              className="button"
              onClick={() => {
                updateIsController(true);
                Router.push(`/${username}/xwallet/did`);
              }}
            >
              <p style={{ color: "silver" }}>operations menu</p>
            </button>
          </div>
          <h2 style={{ color: "#ffff32", margin: "7%" }}>
            DID social recovery
          </h2>
          <h4>With this transaction, you will configure Social Recovery.</h4>
        </div>
        <DidSocialRecovery />
      </Layout>
    </>
  );
}

export default Social;
