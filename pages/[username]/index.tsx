import Layout from "../../components/Layout"
import { SSI, Treasury, VerifiableCredentials } from "../../components";
import { useEffect, useState } from "react";

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
          <VerifiableCredentials />
        ) : domain === 'treasury' ? (
          <Treasury />
        ) : (
          <SSI>
            <div /> {/*@todo-1 is this needed?*/}
          </SSI>
        )}
      </Layout>
    </>
  );
}

export default Header;
