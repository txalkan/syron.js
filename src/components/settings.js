import React, { useState } from "react";
import { ayjaPstStateID } from ".";
import * as DKMS from '../lib/dkms';
import * as SmartWeave from "smartweave";

function Settings({ username, domain, account, pscMember, arweave, arconnect, keyfile }) {
    const[update, setUpdate] = useState('');
    const handleUpdate = event => {
        setUpdate(event.target.value);
    };

    const[newAddress, setNewAddress] = useState('');
    const handleNewAddress = event => {
        setNewAddress(event.target.value);
    };

    const[keyId, setKeyId] = useState('');
    const handleKeyId = event => {
        setKeyId(event.target.value);
    };

    const[specificId, setSpecificId] = useState('');
    const handleSpecificId = event => {
        setSpecificId(event.target.value);
    };

    return(
		<div id="main" style={{ marginTop:"4%" }}>
            <section style={{ width: "100%" }}>
                <h4>Hi { username }.{ domain }, welcome back!</h4>
                <h3 class="major">Your settings</h3>
                <h4 class="major">Update an address</h4>
                <form>
                    <div class="fields">
                        <div class="field half">
                            <select onChange={ handleUpdate }>
                                <option value="">Select</option>
                                <option value="ssiAyja">SSI address in $AYJA</option>
                                <option value="permawallet">Permawallet address</option>
                                <option value="ssiPermawallet">SSI address in permawallet</option>
                            </select>
                        </div>
                        
                        { update !== "" && <div class="field half"><input type="text" placeholder="New address" onChange={ handleNewAddress } /></div> }
                    </div>
                    <ul class="actions">
                        <li><input type="button" class="button" value="Update"
                            onClick={ async() => {
                                try {
                                    if( keyfile === '' &&  arconnect === '' ){
                                        throw new Error(`You have to connect with ArConnect or your keyfile.`)
                                    }

                                    let input;
                                    let contractId;
                                    switch (update) {
                                        case 'ssiAyja':
                                            input = {
                                                function: 'updateSsi',
                                                username: username,
                                                ssi: newAddress
                                            };
                                            contractId = ayjaPstStateID;
                                            break;
                                        case 'permawallet':
                                            input = {
                                                function: 'updateWallet',
                                                username: username,
                                                owallet: newAddress
                                            };
                                            contractId = ayjaPstStateID;  
                                            break;
                                        case 'ssiPermawallet':
                                            input = {
                                                function: 'ssi',
                                                ssi: newAddress
                                            };
                                            contractId = account.wallet;
                                            break;                                        
                                        default:
                                            throw new Error('Wrong selection.');
                                    }
                                    
                                    const fee = arweave.ar.arToWinston('0.1');
                                    
                                    let tx;
                                    if( arconnect !== '' ){
                                        if( window.confirm("The fee to update an address in your SSI is 0.1 $AR, paid to the $AYJA profit sharing community. Click OK to proceed.")) {
                                            if( pscMember === account.ssi ){
                                                alert(`You got randomly selected as the PSC winner for this transaction - lucky you! That means no fee.`);
                                                alert(`You got randomly selected as the PSC winner for this transaction - lucky you! That means no fee.`)
                                                tx = await arweave.createTransaction(
                                                    { 
                                                        data: Math.random().toString().slice(-4) 
                                                    }
                                                ).catch( err => { throw err });
                                            } else{
                                                tx = await arweave.createTransaction(
                                                    {
                                                        data: Math.random().toString().slice(-4),
                                                        target: pscMember.toString(),
                                                        quantity: fee.toString(),
                                                    }
                                                ).catch( err => { throw err });
                                            }
                                            tx.addTag('Dapp', 'tyron');
                                            tx.addTag('App-Name', 'SmartWeaveAction');
                                            tx.addTag('App-Version', '0.3.0');
                                            tx.addTag('Contract', contractId.toString());
                                            tx.addTag('Input', JSON.stringify(input));
    
                                            await arweave.transactions.sign(tx).catch( err => { throw err });
                                            await arweave.transactions.post(tx).catch( err => { throw err });                                    
                                        }
                                    } else{
                                        if(window.confirm("The fee to update an address in your SSI is 0.1 $AR, paid to the $AYJA profit sharing community. Click OK to proceed.")) {
                                            if( pscMember === account.ssi ){
                                                alert(`You got randomly selected as the PSC winner for this transaction - lucky you! That means no fee.`)
                                                tx = await SmartWeave.interactWrite(arweave, keyfile, contractId, input).catch( err => { throw err });
                                            } else{
                                                tx = await SmartWeave.interactWrite(arweave, keyfile, contractId, input, [], pscMember, fee).catch( err => { throw err });
                                            }                                       
                                        }
                                    }
                                    alert(`Transaction successful! ID: ${ tx }`);                             
                                } catch (error) {
                                    alert(error)
                                }
                            }}
                        /></li>
                        <li><input type="reset" value="Reset" onClick={ _event => { setUpdate("") }} /></li>
                    </ul>
                </form>
            </section>
            <section style={{ width: "100%" }}>
                <h4 class="major">Generate a new key</h4>
                <form>
                    <div class="fields">
                        <div class="field half">
                            <select onChange={ handleKeyId }>
                                <option value="">Select</option>
                                <option value="ssiComm">SSI Communication Key</option>
                                <option value="byId">Key by ID</option>
                            </select>
                        </div>
                        
                        { keyId === "byId" && <div class="field half"><input type="text" placeholder="Key ID" onChange={ handleSpecificId } /></div> }
                    </div>    
                    <ul class="actions">
                        <li><input type="button" class="button" value="Encrypt and save in your permawallet"
                            onClick={ async() => {
                                try {
                                    if( keyfile === '' &&  arconnect === '' ){
                                        throw new Error(`You have to connect with ArConnect or your keyfile.`)
                                    }

                                    if( !account.wallet || account.wallet === "") {
                                        throw new Error(`It seems like you don't have any SSI Permawallet registered.`);
                                    }

                                    if( arconnect !== '' ){ 
                                        throw new Error(`Please use a keyfile instead.`);
                                        let input;
                                        switch (keyId) {
                                            case 'ssiComm':
                                                {
                                                    const ssiCommKeys = await DKMS.generateSsiKeys(arweave);
                                                    const ssiCommPrivate = await DKMS.encryptKey(arconnect, ssiCommKeys.privateKey);
                                                    input = {
                                                        function: 'ssiComm',
                                                        ssicomm: ssiCommKeys.publicEncryption,
                                                        key: ssiCommPrivate
                                                    };
                                                }
                                                break;
                                            case 'byId':
                                                {
                                                    const keys = await DKMS.generateSsiKeys(arweave);
                                                    const key = await DKMS.encryptKey(arconnect, keys.privateKey);
                                                    input = {
                                                        function: 'registerKey',
                                                        id: specificId,
                                                        key: key
                                                    };
                                                }
                                                break;                                
                                            default:
                                                throw new Error('Wrong selection.');
                                        }
                                        const fee = arweave.ar.arToWinston('0.1');
                                        
                                        if(window.confirm("The fee to create a new key in your permawallet is 0.1 $AR, paid to the $AYJA profit sharing community. Click OK to proceed.")) {
                                            if(  pscMember === account.ssi ){
                                                alert(`You got randomly selected as the PSC winner for this transaction - lucky you! That means no fee.`)
                                                const tx = await SmartWeave.interactWrite(arweave, keyfile, account.wallet, input);
                                                alert(`Transaction successful! ID: ${ tx }`);
                                            } else{
                                                const tx = await SmartWeave.interactWrite(arweave, keyfile, account.wallet, input, [], pscMember, fee);
                                                alert(`Transaction successful! ID: ${ tx }`);
                                            }                                       
                                        }
                                    } else{
                                        const publicEncryption = await DKMS.generatePublicEncryption(keyfile);
                                        let input;
                                        switch (keyId) {
                                            case 'ssiComm':
                                                {
                                                    const ssiCommKeys = await DKMS.generateSsiKeys(arweave);
                                                    const ssiCommPrivate = await DKMS.encryptData(ssiCommKeys.privateKey, publicEncryption);
                                                    input = {
                                                        function: 'ssiComm',
                                                        ssicomm: ssiCommKeys.publicEncryption,
                                                        key: ssiCommPrivate
                                                    };
                                                }
                                                break;
                                            case 'byId':
                                                {
                                                    const keys = await DKMS.generateSsiKeys(arweave);
                                                    const key = await DKMS.encryptData(keys.privateKey, publicEncryption);
                                                    input = {
                                                        function: 'registerKey',
                                                        id: specificId,
                                                        key: key
                                                    };
                                                }
                                                break;                                
                                            default:
                                                throw new Error('Wrong selection.');
                                        }
                                        const fee = arweave.ar.arToWinston('0.1');
                                        
                                        if( window.confirm("The fee to create a new key in your permawallet is 0.1 $AR, paid to the $AYJA profit sharing community. Click OK to proceed.")) {
                                            if( pscMember === account.ssi ){
                                                alert(`You got randomly selected as the PSC winner for this transaction - lucky you! That means no fee.`)
                                                const tx = await SmartWeave.interactWrite(arweave, keyfile, account.wallet, input);
                                                alert(`Transaction successful! ID: ${ tx }`);
                                            } else{
                                                const tx = await SmartWeave.interactWrite(arweave, keyfile, account.wallet, input, [], pscMember, fee);
                                                alert(`Transaction successful! ID: ${ tx }`);
                                            }                                       
                                        }
                                    }
                                } catch (error) {
                                    alert(error)
                                }                            
                            }}
                        /></li>
                        <li><input type="reset" value="Reset" onClick={ _event => { setKeyId("") }}/></li>
                    </ul>
                </form>
            </section>
        </div>
	);
}

export default Settings;
