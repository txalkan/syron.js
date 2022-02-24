import Layout from "../../components/Layout"
import { SSI, Treasury, VerifiableCredentials } from "../../components";
import { useEffect, useState } from "react";

function Header() {
  //@todo review repetitive use of path (we have a useEffect in SearchBar already, where is the best place to do it for the whole app?)
  const [domain, setDomain] = useState('')
  useEffect(() => {
    const { pathname } = window.location
    setDomain(pathname.replace('/', '').toLowerCase().split('.')[1])
  }, [setDomain])

  return (
    <>
      <Layout>
        {domain === 'vc' ? (
          <VerifiableCredentials />
        ) : domain === 'treasury' ? (
          <Treasury />
        ) : (
          <SSI>
            <div />
          </SSI>
        )}
      </Layout>
    </>
  );
}

export default Header;
