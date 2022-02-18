import Layout from '../../components/Layout'
import { PublicIdentity } from '../../components';
import { Transfers } from '../../components'

function Header() {
    return (
        <>
          <Layout>
            <PublicIdentity>
              <Transfers />
            </PublicIdentity>
          </Layout>
        </>
    );
}

export default Header;
