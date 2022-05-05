import Layout from "../../../../components/Layout";
import { Headline, Balances } from "../../../../components";
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
<<<<<<< HEAD:pages/[username]/xwallet/did/update.tsx
                Router.push(`/${username}/xwallet/did`);
              }}
            >
              <p style={{ color: "silver" }}>operations menu</p>
            </button>
          </div>
          <h2 style={{ color: "#ffff32", margin: "10%" }}>DID update</h2>
          <h4>With this transaction, you will update your DID Document.</h4>
=======
                Router.push(`/${username}/did/wallet`);
              }}
            >
              <p>wallet menu</p>
            </button>
          </div>
          <h2 style={{ color: "#ffff32", margin: "10%" }}>Balances</h2>
>>>>>>> 006cc58f69f6f59dee584e3b715bf384cf892e31:pages/[username]/did/wallet/balances.tsx
        </div>
        <Balances />
      </Layout>
    </>
  );
}

export default Header;
