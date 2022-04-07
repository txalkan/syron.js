import Layout from "../../../../components/Layout";
import { Headline, DIDOperations } from "../../../../components";
import { useRouter } from "next/router";
import { updateIsController } from "../../../../src/store/controller";
import { useStore } from "effector-react";
import { $user } from "../../../../src/store/user";
import styles from "./styles.module.scss";

function Index() {
  const Router = useRouter();
  const username = useStore($user)?.name;
  return (
    <>
      <Layout>
        <div className={styles.headlineWrapper}>
          <Headline />
          <div style={{ textAlign: "left", paddingLeft: "2%" }}>
            <button
              className="button"
              onClick={() => {
                updateIsController(true);
                Router.push(`/${username}/xwallet`);
              }}
            >
              <p style={{ color: "silver" }}>wallet menu</p>
            </button>
          </div>
          <h2 style={{ color: "#ffff32", margin: "10%" }}>DID operations</h2>
        </div>
        <DIDOperations />
      </Layout>
    </>
  );
}

export default Index;
