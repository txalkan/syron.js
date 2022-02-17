import Layout from '../../components/Layout'
import { PublicIdentity } from '../../components';
import SocialRecovery from '../../components/PublicIdentity/SocialRecovery'

function Header() {
    return (
        <>
          <Layout>
            <PublicIdentity>
              <SocialRecovery />
            </PublicIdentity>
          </Layout>
        </>
    );
}

export default Header;
