import Layout from '../../components/Layout'
import { PublicIdentity, Treasury, VerifiableCredentials } from '../../components';
import { useEffect, useState } from 'react';

function Header() {
    const [domain, setDomain] = useState('')
    useEffect(() => {
      const { pathname } = window.location
      setDomain(pathname.replace('/', '').toLowerCase().split('.')[1])
    }, [setDomain])
    
    return (
        <>
            <Layout>
              {domain === 'vc' ? (
                  <VerifiableCredentials/>
                ) : domain === 'treasury' ? (
                  <Treasury />
                ) : (
                  <PublicIdentity>
                    <div />
                  </PublicIdentity>
                )}
            </Layout>
        </>
    );
}

export default Header;
