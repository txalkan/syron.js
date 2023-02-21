import Layout from "../../../components/Layout";
import { Headline, DIDxWallet, CardList } from "../../../components";
import styles from "./styles.module.scss";

function Header() {
  return (
    <>
      <Layout>
        <div className={styles.headlineWrapper}>
          <Headline />
          <h1 className={styles.title}>
            DID<span style={{ textTransform: "lowercase" }}>x</span>Wallet
          </h1>
          <h3 style={{ color: "silver" }}>
            Decentralized Identifier smart contract wallet
          </h3>
        </div>
        <DIDxWallet>
          <CardList />
        </DIDxWallet>
      </Layout>
    </>
  );
}

export default Header;
