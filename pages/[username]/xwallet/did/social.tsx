import Layout from "../../../../components/Layout";
import { DIDxWallet, DIDOperations, DidSocialRecovery } from "../../../../components";

function Social() {
  return (
    <>
      <Layout>
        <DIDxWallet>
          <DIDOperations>
            <DidSocialRecovery />  
          </DIDOperations>
        </DIDxWallet>
      </Layout>
    </>
  );
}

export default Social;
