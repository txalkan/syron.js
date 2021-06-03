// @TODO: Delete this eslint's disable statement once props interfaces are defined. Check this with @Tralcan
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { permawalletTemplateID, permawalletSourceID } from '.';
import * as DKMS from '../lib/dkms';
import * as SmartWeave from 'smartweave';

function CreateAccount({
  username,
  domain,
  address,
  pscMember,
  arweave,
  arconnect,
  keyfile
}) {
  const emptyMessage = {
    firstName: '',
    lastName: '',
    streetName: '',
    buildingNumber: '',
    country: ''
  };
  const [ivms101, setIvms101] = useState(emptyMessage);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [streetName, setStreetName] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [country, setCountry] = useState('');
  const handleFirstName = (event) => {
    setFirstName(event.target.value);
  };
  const handleLastName = (event) => {
    setLastName(event.target.value);
  };
  const handleStreetName = (event) => {
    setStreetName(event.target.value);
  };
  const handleBuildingNumber = (event) => {
    setBuildingNumber(event.target.value);
  };
  const handleCountry = (event) => {
    setCountry(event.target.value);
  };

  const [passportButton, setPassportButton] = useState('button primary');
  const [savePassport, setSavePassport] = useState(
    'Save Travel Rule SSI Passport'
  );
  const [registerButton, setRegisterButton] = useState('button primary');
  const [register, setRegister] = useState(
    'Register Self-Sovereign Identity Permawallet'
  );

  return (
    <div id="main">
      <h2 style={{ width: '100%', textAlign: 'center' }} className="major">
        {' '}
        Register {username}.{domain}{' '}
      </h2>
      <p style={{ width: '100%' }}>
        {' '}
        {username}.{domain} is available for you to register!{' '}
      </p>
      <section style={{ width: '100%' }}>
        <ol>
          <li style={{ marginTop: '4%' }}>
            <h4 className="major">Generate your Travel Rule SSI Passport</h4>
            <p>
              Create an{' '}
              <a href="https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf">
                IVMS101 message
              </a>{' '}
              for KYC to make your digital identity compliant with the FATF
              Travel Rule to counteract money laundering and terrorism
              financing, and thus building a web of trust. This personal
              information will get encrypted by your SSI Travel Rule Key generated
              by your permawallet - only you decide who can read this
              message. You won&apos;t need to give this information anymore to
              third parties, over and over again. Your SSI Travel Rule - private
              - Key will get encrypted by your SSI Permawallet Key and saved into
              your wallet, so only you can access it. When making a transfer,
              you will have the option to attach this secret encrypted by the
              beneficiary&apos;s SSI Communication Key so they can read your
              Travel Rule Passport.
            </p>
            <form>
              <div className="fields">
                <div className="field half">
                  <label>First name</label>
                  <input type="text" onChange={handleFirstName} />
                </div>
                <div className="field half">
                  <label>Last name</label>
                  <input type="text" onChange={handleLastName} />
                </div>
              </div>
              <section style={{ width: '100%', marginBottom: '3%' }}>
                <h4>Residential address</h4>
                <div className="fields">
                  <input
                    type="text"
                    placeholder="Street name"
                    onChange={handleStreetName}
                  />
                </div>
              </section>
              <div className="fields">
                <div className="field half">
                  <input
                    type="text"
                    placeholder="Building number"
                    onChange={handleBuildingNumber}
                  />
                </div>
                <div className="field half">
                  <select onChange={handleCountry}>
                    <option value="">Select country of residence</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Denmark">Denmark</option>
                    <option value="Singapore">Singapore</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
              </div>
              <ul className="actions">
                <li>
                  <input
                    type="button"
                    className={passportButton}
                    value={savePassport}
                    onClick={() => {
                      setIvms101({
                        firstName: firstName,
                        lastName: lastName,
                        streetName: streetName,
                        buildingNumber: buildingNumber,
                        country: country
                      });
                      setSavePassport('Saved');
                      setPassportButton('button');
                    }}
                  />
                </li>
                <li>
                  <input
                    type="reset"
                    value="Reset"
                    onClick={() => {
                      setIvms101(emptyMessage);
                      setSavePassport('Save SSI Travel Rule Passport');
                      setPassportButton('button primary');
                    }}
                  />
                </li>
              </ul>
            </form>
          </li>
          <li style={{ marginTop: '6%' }}>
            <h4 className="major">
              Create your SSI Permawallet for {username}.{domain}
            </h4>
            <input
              type="button"
              className={registerButton}
              value={register}
              onClick={async () => {
                try {
                  if (keyfile === '' && arconnect === '') {
                    throw new Error(
                      `You have to connect with ArConnect or your keyfile.`
                    );
                  }
                  if (savePassport === 'Save Travel Rule SSI Passport') {
                    throw new Error(
                      'You have to fill up and save the Travel Rule SSI Passport information first.'
                    );
                  }
                  // SSI Communication Keys
                  const ssiCommKeys = await DKMS.generateSsiKeys(arweave);

                  // Travel Rule Passport
                  const trSsiKeys = await DKMS.generateSsiKeys(arweave);
                  const encryptedTrPassport = await DKMS.encryptData(
                    ivms101,
                    trSsiKeys.publicEncryption
                  );
                  alert(
                    `This is your encrypted SSI Travel Rule Passport: ${encryptedTrPassport}`
                  );

                  // Encrypt private keys
                  let ssiCommPrivate;
                  let ssiTravelRulePrivate;
                  if (arconnect !== '') {
                    ssiCommPrivate = await DKMS.encryptKey(
                      arconnect,
                      ssiCommKeys.privateKey
                    );
                    ssiTravelRulePrivate = await DKMS.encryptKey(
                      arconnect,
                      trSsiKeys.privateKey
                    );
                  } else {
                    const publicEncryption =
                      await DKMS.generatePublicEncryption(keyfile);
                    ssiCommPrivate = await DKMS.encryptData(
                      ssiCommKeys.privateKey,
                      publicEncryption
                    );
                    ssiTravelRulePrivate = await DKMS.encryptData(
                      trSsiKeys.privateKey,
                      publicEncryption
                    );
                  }

                  /*For testing
                  const decryptedTrSsiKey = await DKMS.decryptData(ssiTravelRulePrivate, keyfile);
                  alert(`SSI TR decrypted key: ${decryptedTrSsiKey}`);
                  const decryptedTrPassport = await DKMS.decryptData(encryptedTrPassport, JSON.parse(decryptedTrSsiKey));
                  alert(decryptedTrPassport);
                  */

                  // Permawallet initial state

                  let permawalletInitState = await SmartWeave.readContract(
                    arweave,
                    permawalletTemplateID.toString()
                  );
                  permawalletInitState.ssi = address;
                  permawalletInitState.ssiComm = ssiCommKeys.publicEncryption;
                  permawalletInitState.trp.message = encryptedTrPassport;
                  permawalletInitState.trp.key = ssiTravelRulePrivate;
                  permawalletInitState.keys.ssiComm = ssiCommPrivate;

                  // Fee paid to the PSC

                  let tx;

                  if (arconnect !== '') {
                    tx = await arweave
                      .createTransaction({
                        data: JSON.stringify(permawalletInitState)
                      })
                      .catch((err) => {
                        throw err;
                      });
                    tx.addTag('Dapp', 'ssiprotocol');
                    tx.addTag('App-Name', 'SmartWeaveContract');
                    tx.addTag('App-Version', '0.3.0');
                    tx.addTag('Contract-Src', permawalletSourceID.toString());
                    tx.addTag('Content-Type', 'application/json');

                    await arweave.transactions.sign(tx).catch((err) => {
                      throw err;
                    });
                    await arweave.transactions.post(tx).catch((err) => {
                      throw err;
                    });
                    tx = tx.id;
                  } else {
                    tx = await SmartWeave.createContractFromTx(
                          arweave,
                          keyfile,
                          permawalletSourceID.toString(),
                          JSON.stringify(permawalletInitState)
                      ).catch((err) => {
                        throw err;
                      });
                  }
                  if (tx === undefined) {
                    alert(`Transaction rejected.`);
                  } else {
                    alert(`Your permawallet ID is: ${tx}`);
                  }
                } catch (error) {
                  alert(error);
                }
              }}
            />
            {register === 'registered' && (
              <p style={{ marginTop: '4%' }}>
                To access your private profile, search for {username}.{domain}
                in the browser and make sure your SSI Permawallet Key is connected.
              </p>
            )}
          </li>
        </ol>
      </section>
    </div>
  );
}

export default CreateAccount;
