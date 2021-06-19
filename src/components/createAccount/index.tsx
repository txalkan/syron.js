import React, { useState } from 'react';
import SSIPassport from '../SSIPassport/travelRule';
import Permawallet from '../Permawallet';
import { IPermawallet } from '../../interfaces/IPermawallet';

function CreateAccount({
  username,
  domain,
  address,
  arweave,
  arconnect,
  keyfile
}: IPermawallet) {
  const [ivms101, setIvms101] = useState<string | undefined>();
  return (
    <div id="main">
      <h2 style={{ width: '100%', textAlign: 'center' }} className="major">
        Register {username}.{domain}
      </h2>
      <p style={{ width: '100%' }}>
        {username}.{domain} is available for you to register!
      </p>
      <section style={{ width: '100%' }}>
        <ol>
          <li style={{ marginTop: '4%' }}>{<SSIPassport />}</li>

          <li style={{ marginTop: '6%' }}>
            <Permawallet
              {...{
                arweave,
                arconnect,
                address,
                username,
                domain,
                keyfile,
                ivms101
              }}
            />
          </li>
        </ol>
      </section>
    </div>
  );
}

export default CreateAccount;
