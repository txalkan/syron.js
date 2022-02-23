import Layout from "../../../components/Layout";
import { SSI } from "../../../components";
import Keys from '../../../components/SSI/DIDDocument/Keys'

function Header() {
  return (
    <>
      <Layout>
        <SSI>
          <Keys />
        </SSI>
      </Layout>
    </>
  );
}

export default Header;
