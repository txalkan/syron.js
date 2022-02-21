import Layout from "../../components/Layout";
import { SSI, DIDxWallet } from "../../components";

function Header() {
  return (
    <>
      <Layout>
        <SSI>
          <DIDxWallet />
        </SSI>
      </Layout>
    </>
  );
}

export default Header;
