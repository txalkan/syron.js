import { useStore } from "effector-react";
import { $loading } from "../../src/store/loading";
import Layout from "../../components/Layout";
import { AddFunds } from "../../components";

function Header() {
  const loading = useStore($loading)
  return (
    <>
      <Layout>
        {!loading && <AddFunds />}
      </Layout>
    </>
  );
}

export default Header;
