import Layout from "../../components/Layout";
import { SSI, Transfers } from "../../components";

function Header() {
  return (
    <>
      <Layout>
        <SSI>
          <Transfers />
        </SSI>
      </Layout>
    </>
  );
}

export default Header;
