import Layout from "../../../components/Layout";
import { DIDDocument, Headline } from "../../../components";
import styles from "./styles.module.scss";

function Header() {
  return (
    <>
      <Layout>
        <div className={styles.headlineWrapper}>
          <Headline />
          <h1 style={{ color: "#ffff32", margin: "7%" }}>DID Document</h1>
        </div>
        <DIDDocument />
      </Layout>
    </>
  );
}

export default Header;
