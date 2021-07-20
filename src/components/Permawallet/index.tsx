import React, { useState } from 'react';
import * as DKMS from '../../lib/dkms';
import * as SmartWeave from 'smartweave';
import { permawalletTemplateID, permawalletSourceID } from '../.';
import { IpermaWallet } from '../../interfaces/IPermawallet';
import arweave from 'src/config/arweave';
import { useSelector } from '../../context';

function PermaWallet({ travelRule }: IpermaWallet) {
    const [savePassport] = useState<string>('Save Travel Rule SSI Passport');
    const [executeButton, setExecuteButton] =
        useState<string>('button primary');
    const [legendButton, setLegendButton] = useState<string>(
        'Create SSI permaWallet'
    );
    const { arAddress, keyFile, arConnect } = useSelector(
        (state) => state.user
    );

    const onClickFunction = () => async (): Promise<void> => {
        try {
            if (!keyFile && !arConnect) {
                throw new Error(
                    `You have to connect with arConnect or your SSI key file.`
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
                travelRule,
                trSsiKeys.publicEncryption
            );
            alert(
                `This is your encrypted SSI Travel Rule Passport: ${encryptedTrPassport}`
            );

            // Encrypt private keys
            let ssiCommPrivate: Uint8Array | string;
            let ssiTravelRulePrivate: Uint8Array | string;
            if (arConnect !== '') {
                ssiCommPrivate = await DKMS.encryptKey(
                    arConnect,
                    ssiCommKeys.privateKey
                );
                ssiTravelRulePrivate = await DKMS.encryptKey(
                    arConnect,
                    trSsiKeys.privateKey
                );
            } else {
                const publicEncryption = await DKMS.generatePublicEncryption(
                    keyFile
                );
                ssiCommPrivate = await DKMS.encryptData(
                    ssiCommKeys.privateKey,
                    publicEncryption
                );
                ssiTravelRulePrivate = await DKMS.encryptData(
                    trSsiKeys.privateKey,
                    publicEncryption
                );
            }

            const decryptedTrSsiKey = await DKMS.decryptData(
                ssiTravelRulePrivate,
                keyFile
            );
            alert(`SSI TR decrypted key: ${decryptedTrSsiKey}`);
            const decryptedTrPassport = await DKMS.decryptData(
                encryptedTrPassport,
                decryptedTrSsiKey
            );
            alert(decryptedTrPassport);

            // Permawallet initial state

            const permawalletInitState = await SmartWeave.readContract(
                arweave,
                permawalletTemplateID.toString()
            );
            permawalletInitState.ssi = arAddress;
            permawalletInitState.ssiComm = ssiCommKeys.publicEncryption;
            permawalletInitState.trp.message = encryptedTrPassport;
            permawalletInitState.trp.key = ssiTravelRulePrivate;
            permawalletInitState.keys.ssiComm = ssiCommPrivate;

            let tx;

            if (arConnect !== '') {
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
                    keyFile!,
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
            setExecuteButton('button');
            setLegendButton('done');
        } catch (error) {
            alert(error);
        }
    };

    return (
        <>
            <input
                type="button"
                className={executeButton}
                value={legendButton}
                onClick={() => onClickFunction()}
            />
        </>
    );
}

export default PermaWallet;
