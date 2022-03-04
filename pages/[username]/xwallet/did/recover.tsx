import Layout from "../../../../components/Layout";
import { DIDxWallet, DIDOperations, NewDoc } from "../../../../components";

function Recover() {
  return (
    <>
      <Layout>
        <DIDxWallet>
          <DIDOperations>
            <NewDoc />  
          </DIDOperations>
        </DIDxWallet>
      </Layout>
    </>
  );
}

export default Recover;
