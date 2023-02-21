import { useStore } from "effector-react";
import { $loading } from "../../src/store/loading";
import Layout from "../../components/Layout";
import { SocialRecovery } from "../../components";

function Header() {
  const loading = useStore($loading);
  return (
    <>
      <Layout>{!loading && <SocialRecovery />}</Layout>
    </>
  );
}

export default Header;
