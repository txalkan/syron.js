import Layout from "../../../../components/Layout";
import { DIDxWallet, DIDOperations, NewDoc } from "../../../../components";

function Create() {
  return (
    <>
      <Layout>
        <DIDxWallet>
          <DIDOperations>
            <NewDoc typeInput="create" />  
          </DIDOperations>
        </DIDxWallet>
      </Layout>
    </>
  );
}

export default Create;
