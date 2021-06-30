import React, { useState } from "react";

export interface IProfile {
  username: string;
  domain: string;
  did: any;
}

function PublicProfile({
	username,
	domain,
	did
}: IProfile) {
	const [TransferAmount, setTransferAmount] = useState("");
	const handleTransferAmount = (event: React.ChangeEvent<HTMLInputElement>) => setTransferAmount(event.target.value);

	const [message, setMessage] = useState("");
	const handleMessage = (event: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(event.target.value);

	return (
		<div id="main">
		<h2 style={{ width: "100%", textAlign: "center" }}>
			Public profile of {username}.{domain}
		</h2>
		<div>
			{ did.map((res: any) => {
				return(
					<div key={res}>
					<p>{res[0]}</p>
					{ res[1].map((element: any) => {
						return(
							<p key={element}>{element}</p>
						);
						})}
					</div>
				);
			})}
		</div>
		<section style={{ width: "100%", marginTop: "4%" }}>
			<h4 className="major">Transfers</h4>
			<form>
			<div className="fields">
				<div className="field half">
				<input
					type="text"
					placeholder="Amount"
					onChange={handleTransferAmount}
				/>
				</div>
				<div className="field half">
				<input
					type="button"
					className="button primary"
					value="Transfer"
					onClick={async () => {
					/*
					try {
						if (keyfile === "" && arconnect === "") {
						throw new Error(
							`You have to connect with ArConnect or your keyfile.`
						);
						}
						if (
						window.confirm(
							`You are about to donate ${TransferAmount} $AR to '${username}.${domain}'. Click OK to proceed.`
						)
						) {
						let tx;
						if (arconnect !== "") {
							tx = await arweave.createTransaction({
							target: account.ssi,
							quantity: arweave.ar.arToWinston(TransferAmount),
							});
							await arweave.transactions.sign(tx);
						} else {
							tx = await arweave.createTransaction(
							{
								target: account.ssi,
								quantity: arweave.ar.arToWinston(TransferAmount),
							},
							keyfile
							);
							await arweave.transactions.sign(tx, keyfile);
						}
						const result = await arweave.transactions.post(tx);
						alert(`Transaction: ${tx}. Status: ${result.status}`);
						}
					} catch (error) {
						alert(error);
					}
					*/
					}}
				/>
				</div>
			</div>
			</form>
		</section>
		{ /*account.wallet !== "" && */(
			<section style={{ width: "100%", marginTop: "4%" }}>
			<h4 className="major">SSI Communication</h4>
			<p>Send them an encrypted message:</p>
			<form method="post" action="#">
				<div className="fields">
				<div className="field">
					<textarea onChange={handleMessage} rows={4}></textarea>
				</div>
				</div>
				<ul className="actions">
				<li>
					<input
					type="button"
					className="button primary"
					value="Encrypt & send"
					onClick={async () => {
						try {
						/*
						if (keyfile === "" && arconnect === "") {
							throw new Error(
							`You have to connect with ArConnect or your keyfile.`
							);
						}

						const userPermawallet = await SmartWeave.readContract(
							arweave,
							account.wallet
						);
						const userSsiComm = userPermawallet.ssiComm;
						const encryptedMessage = await DKMS.encryptData(
							message,
							userSsiComm
						);

						if (
							window.confirm(
							`You are about to send a message to ${username}.${domain}'. Click OK to proceed.`
							)
						) {
							let tx;
							if (arconnect !== "") {
							tx = await arweave.createTransaction({
								target: account.ssi,
								data: Arweave.utils.concatBuffers([
								encryptedMessage,
								]),
								quantity: arweave.ar.arToWinston("0"),
							});
							await arweave.transactions.sign(tx);
							} else {
							tx = await arweave.createTransaction(
								{
								target: account.ssi,
								data: Arweave.utils.concatBuffers([
									encryptedMessage,
								]),
								quantity: arweave.ar.arToWinston("0"),
								},
								keyfile
							);
							await arweave.transactions.sign(tx, keyfile);
							}
							const result = await arweave.transactions.post(tx);
							alert(
							`Transaction: ${JSON.stringify(tx)}. Status: ${
								result.status
							}`
							);
						}
						*/
						} catch (error) {
						alert(error);
						}
					}}
					/>
				</li>
				<li>
					<input type="reset" value="Reset" />
				</li>
				</ul>
			</form>
			</section>
		)}
		</div>
	);
}

export default PublicProfile;
