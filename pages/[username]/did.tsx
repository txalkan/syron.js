import Layout from '../../components/Layout'
import { PublicIdentity } from '../../components';
import DIDDocument from '../../components/PublicIdentity/DIDDocument'

function Header() {
    return (
        <>
          <Layout>
            <PublicIdentity>
              <DIDDocument />
            </PublicIdentity>
          </Layout>
        </>
    );
}

export default Header;
