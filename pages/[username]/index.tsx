import Layout from "../../components/Layout"
import { SSI, Treasury, VerifiableCredentials } from "../../components";
import { useEffect, useState } from "react";
import { $loading } from "../../src/store/loading";
import { useStore } from "effector-react"

function Header() {
  const loading = useStore($loading)
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
          <>
            {!loading ? (
              <SSI>
                <div /> {/*@todo-1 is this needed?*/}
              </SSI>
            ):(<></>)}
          </>
        )}
      </Layout>
    </>
  );
}

export default Header;
