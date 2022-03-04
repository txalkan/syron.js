import Layout from "../../../../components/Layout";
import { DIDxWallet, DIDOperations } from "../../../../components";

function Header() {
  return (
    <>
      <Layout>
        <DIDxWallet>
          <DIDOperations />
        </DIDxWallet>
      </Layout>
    </>
  );
}

export default Header;
