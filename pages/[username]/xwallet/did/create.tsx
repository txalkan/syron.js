import Layout from "../../../../components/Layout";
import { Headline, NewDoc } from "../../../../components";
import { useRouter } from "next/router";
import { updateIsController } from "../../../../src/store/controller";
import { useStore } from "effector-react";
import { $user } from "../../../../src/store/user";

function Create() {
  const Router = useRouter();
  const username = useStore($user)?.name;

  return (
    <>
      <Layout>
        <div style={{ width: '70%', textAlign: 'center' }}>
          <Headline />
        </div>
        <div>
          <button
            type="button"
            className="button"
            onClick={() => {
              updateIsController(true);
              Router.push(`/${username}/xwallet/did`)
            }}
          >
            <p style={{ color: 'silver' }}>operations menu</p>
          </button>
        </div>
        <h2 style={{ color: '#ffff32', margin: '7%' }}>
          DID create
        </h2>
        <h4>
          Generate a globally unique Decentralized Identifier (DID) and its DID Document.
        </h4>
        <NewDoc typeInput="create" />
      </Layout>
    </>
  );
}

export default Create;
