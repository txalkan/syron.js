import { useStore } from "effector-react";
import { $loading } from "../../src/store/loading";
import Layout from "../../components/Layout";
import { AddFunds, Headline } from "../../components";
import styles from "./styles.module.scss";

function Header() {
  const loading = useStore($loading);

  return (
    <>
      <Layout>
        {!loading && (
          <>
            <div className={styles.headlineWrapper}>
              <Headline />
            </div>
            <AddFunds type="funds" />
          </>
        )}
      </Layout>
    </>
  );
}

export default Header;
