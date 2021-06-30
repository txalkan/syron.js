import React, { useState } from 'react';
import * as DKMS from '../../lib/dkms';
import * as SmartWeave from 'smartweave';
import { permawalletTemplateID, permawalletSourceID } from '../.';
import { IPermawallet } from '../../interfaces/IPermawallet';
import arweave from 'src/config/arweave';
import { useSelector } from '../../context';

function Permawallet({
	travelRule
}: IPermawallet) {
	const [savePassport] = useState<string>('Save Travel Rule SSI Passport');
	const [registerButton] = useState<string>('button primary');
	const [register] = useState<string>('Register SSI permaWallet');
	const { arAddress, keyfile, arconnect } = useSelector((state) => state.user);

	const onClickFunction = () => async (): Promise<void> => {	
		try {
		if (!keyfile && !arconnect) {
			throw new Error(
			`You have to connect with ArConnect or your key file.`
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
			const publicEncryption = await DKMS.generatePublicEncryption(keyfile);
			ssiCommPrivate = await DKMS.encryptData(
			ssiCommKeys.privateKey,
			publicEncryption
			);
			ssiTravelRulePrivate = await DKMS.encryptData(
			trSsiKeys.privateKey,
			publicEncryption
			);
		}

		const decryptedTrSsiKey = await DKMS.decryptData(ssiTravelRulePrivate, keyfile);
		alert(`SSI TR decrypted key: ${decryptedTrSsiKey}`);
		const decryptedTrPassport = await DKMS.decryptData(encryptedTrPassport, decryptedTrSsiKey);
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
	};

	return (
		<>
		<input
			type="button"
			className={registerButton}
			value={register}
			onClick={() => onClickFunction()}
		/>
		</>
	);
}

export default Permawallet;
