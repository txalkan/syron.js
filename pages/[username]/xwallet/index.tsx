import Layout from "../../../components/Layout";
import { DIDxWallet, CardList } from "../../../components";

function Header() {
  return (
    <>
      <Layout>
        <DIDxWallet>
          <CardList />
        </DIDxWallet>
      </Layout>
    </>
  );
}

export default Header;
