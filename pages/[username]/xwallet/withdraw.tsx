import Layout from "../../../components/Layout";
import { Headline, Withdrawals } from "../../../components";
import { useRouter } from "next/router";
import { $user } from "../../../src/store/user";
import { useStore } from "effector-react";
import { updateIsController } from "../../../src/store/controller";
import styles from "./styles.module.scss";

function Header() {
  const Router = useRouter();
  const username = useStore($user)?.name;

  return (
    <>
      <Layout>
        <div className={styles.headlineWrapper}>
          <Headline />
          <div style={{ textAlign: 'left' }}>
            <button
              className="button"
              onClick={() => {
                updateIsController(true);
                Router.push(`/${username}/xwallet`)
              }}
            >
              <p>wallet menu</p>
            </button>
          </div>
          <h2 style={{ color: '#ffff32', margin: '7%' }}>
            Withdrawals
          </h2>
        </div>
        <Withdrawals />
      </Layout>
    </>
  );
}

export default Header;
