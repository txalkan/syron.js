import Layout from "../../../../components/Layout";
import { DIDxWallet, DIDOperations, NewDoc } from "../../../../components";

function Recover() {
  return (
    <>
      <Layout>
        <NewDoc typeInput="recover" />
      </Layout>
    </>
  );
}

export default Recover;
