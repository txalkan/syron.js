import Layout from "../../components/Layout";
import { SSI, DIDDocument } from "../../components";

function Header() {
  return (
    <>
      <Layout>
        <SSI>
          <DIDDocument />
        </SSI>
      </Layout>
    </>
  );
}

export default Header;
