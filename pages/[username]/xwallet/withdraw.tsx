import Layout from "../../../components/Layout";
import { DIDxWallet, Withdrawals } from "../../../components";

function Header() {
  return (
    <>
      <Layout>
        <DIDxWallet>
          <Withdrawals />
        </DIDxWallet>
      </Layout>
    </>
  );
}

export default Header;
