import { useStore } from "effector-react";
import { $loading } from "../../src/store/loading";
import Layout from "../../components/Layout";
import { BuyNFTUsername } from "../../components";

function Header() {
  const loading = useStore($loading)
  return (
    <>
      <Layout>
        {!loading && <BuyNFTUsername />}
      </Layout>
    </>
  );
}

export default Header;
