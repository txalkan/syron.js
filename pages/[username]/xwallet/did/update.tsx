import Layout from "../../../../components/Layout";
import { DIDxWallet, DIDOperations, DidUpdate } from "../../../../components";

function Create() {
  return (
    <>
      <Layout>
        <DIDxWallet>
          <DIDOperations>
            <DidUpdate />  
          </DIDOperations>
        </DIDxWallet>
      </Layout>
    </>
  );
}

export default Create;
