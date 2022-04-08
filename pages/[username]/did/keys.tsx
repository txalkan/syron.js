import Layout from "../../../components/Layout";
import { Headline, Keys } from "../../../components";
import { useRouter } from "next/router";
import { useStore } from "effector-react";
import { $user } from "../../../src/store/user";
import styles from "../styles.module.scss";

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
                Router.push(`/${username}/did`);
              }}
            >
              <p>DID Doc</p>
            </button>
          </div>
          <h2 style={{ color: "#ffff32", margin: "10%" }}>DID keys</h2>
        </div>
        <Keys />
      </Layout>
    </>
  );
}

export default Header;
