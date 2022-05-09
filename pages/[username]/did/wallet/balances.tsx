import Layout from "../../../../components/Layout";
import { Headline, Balances } from "../../../../components";
import { useRouter } from "next/router";
import { $user } from "../../../../src/store/user";
import { $loadingDoc, updateLoadingDoc } from "../../../../src/store/loading";
import { useStore } from "effector-react";
import { updateIsController } from "../../../../src/store/controller";
import styles from "../../../styles.module.scss";

function Header() {
  const Router = useRouter();
  const username = useStore($user)?.name;
  const loadingDoc = useStore($loadingDoc);

  return (
    <>
      <Layout>
        {!loadingDoc && (
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
          </div>
        )}
        <Balances />
      </Layout>
    </>
  );
}

export default Header;
