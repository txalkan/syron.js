import Layout from "../../../../components/Layout";
import { Headline, Updates } from "../../../../components";
import { useRouter } from "next/router";
import { $user } from "../../../../src/store/user";
import { useStore } from "effector-react";
import { updateIsController } from "../../../../src/store/controller";
import styles from "../../../styles.module.scss";

function Header() {
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
                Router.push(`/${username}/did/wallet`);
              }}
            >
              <p>wallet menu</p>
            </button>
          </div>
          <h2 style={{ color: "#ffff32", margin: "10%" }}>Updates</h2>
        </div>
        <Updates />
      </Layout>
    </>
  );
}

export default Header;
