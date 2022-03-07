import Layout from "../../../components/Layout";
import { DIDxWallet, NFTUsername } from "../../../components";

function Header() {
  return (
    <>
      <Layout>
        <DIDxWallet>
          <NFTUsername />
        </DIDxWallet>
      </Layout>
    </>
  );
}

export default Header;
