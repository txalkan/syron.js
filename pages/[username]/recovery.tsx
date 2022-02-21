import Layout from "../../components/Layout";
import { SSI, SocialRecovery } from "../../components";

function Header() {
  return (
    <>
      <Layout>
        <SSI>
          <SocialRecovery />
        </SSI>
      </Layout>
    </>
  );
}

export default Header;
