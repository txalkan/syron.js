import Layout from "../../../components/Layout";
import { SSI } from "../../../components";
import Services from '../../../components/SSI/DIDDocument/Services'

function Header() {
  return (
    <>
      <Layout>
        <SSI>
          <Services />
        </SSI>
      </Layout>
    </>
  );
}

export default Header;
