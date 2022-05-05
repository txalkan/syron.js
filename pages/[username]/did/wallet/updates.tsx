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
<<<<<<< HEAD:pages/[username]/xwallet/withdraw.tsx
                Router.push(`/${username}/xwallet`);
=======
                Router.push(`/${username}/did/wallet`);
>>>>>>> 006cc58f69f6f59dee584e3b715bf384cf892e31:pages/[username]/did/wallet/updates.tsx
              }}
            >
              <p>wallet menu</p>
            </button>
          </div>
<<<<<<< HEAD:pages/[username]/xwallet/withdraw.tsx
          <h2 style={{ color: "#ffff32", margin: "10%" }}>Withdrawals</h2>
=======
          <h2 style={{ color: "#ffff32", margin: "10%" }}>Updates</h2>
>>>>>>> 006cc58f69f6f59dee584e3b715bf384cf892e31:pages/[username]/did/wallet/updates.tsx
        </div>
        <Updates />
      </Layout>
    </>
  );
}

export default Header;
