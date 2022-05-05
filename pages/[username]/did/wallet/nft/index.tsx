import Layout from "../../../../../components/Layout";
import { Headline, NFTUsername } from "../../../../../components";
import { useRouter } from "next/router";
import { updateIsController } from "../../../../../src/store/controller";
import { useStore } from "effector-react";
import { $user } from "../../../../../src/store/user";
import styles from "../../../../styles.module.scss";

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
<<<<<<< HEAD:pages/[username]/xwallet/nft.tsx
                Router.push(`/${username}/xwallet`);
=======
                Router.push(`/${username}/did/wallet`);
>>>>>>> 006cc58f69f6f59dee584e3b715bf384cf892e31:pages/[username]/did/wallet/nft/index.tsx
              }}
            >
              <p>wallet menu</p>
            </button>
          </div>
<<<<<<< HEAD:pages/[username]/xwallet/nft.tsx
          <h2 style={{ color: "#ffff32", margin: "10%" }}>DID domains</h2>
=======
          <h2 style={{ color: "#ffff32", margin: "10%" }}>NFT Username</h2>
>>>>>>> 006cc58f69f6f59dee584e3b715bf384cf892e31:pages/[username]/did/wallet/nft/index.tsx
        </div>
        <NFTUsername />
      </Layout>
    </>
  );
}

export default Header;
