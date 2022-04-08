import { useStore } from "effector-react";
import { $loading } from "../../src/store/loading";
import Layout from "../../components/Layout";
import { Headline, SocialRecovery } from "../../components";
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
            <SocialRecovery />
          </>
        )}
      </Layout>
    </>
  );
}

export default Header;
