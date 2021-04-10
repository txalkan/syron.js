import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import Arweave from 'arweave';
import { ayjaPstID } from ".";
import * as DKMS from '../lib/dkms';
import * as SmartWeave from "smartweave";

function Settings({ username, domain, account, pscMember, wallet }) {
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
                <form><div class="fields">
                    <div class="field half">
                        <select onChange={ handleUpdate }>
                            <option value="" disabled selected>Select</option>
                            <option value="ssiAyja">SSI address in $AYJA</option>
                            <option value="permawallet">Permawallet address</option>
                            <option value="ssiPermawallet">SSI address in permawallet</option>
                        </select>
                    </div>
                    
                    <div class="field half"><input type="text" placeholder="New address" onChange={ handleNewAddress } /></div>
                    
                    <div class="field half">
                        <input type="button" class="button" value="Update"
                            onClick={ async() => {
                                try {
                                    if( !wallet.key ) {
                                        throw new Error(`At this version, there is a bug in ArConnect that prevents signing transactions - but their team will fix it soon! In the meantime, you have to choose a keyfile.`)
                                    }

                                    const arweave = Arweave.init({
                                        host: 'arweave.net',
                                        port: 443,
                                        protocol: 'https'
                                    });

                                    let input;
                                    let contractId;
                                    switch (update) {
                                        case 'ssiAyja':
                                            input = {
                                                function: 'updateSsi',
                                                username: username,
                                                ssi: newAddress
                                            };
                                            contractId = ayjaPstID;
                                            break;
                                        case 'permawallet':
                                            input = {
                                                function: 'updateWallet',
                                                username: username,
                                                oWallet: newAddress
                                            };
                                            contractId = ayjaPstID;  
                                            break;
                                        case 'ssiPermawallet':
                                            input = {
                                                function: 'ssi',
                                                ssi: newAddress
                                            };
                                            contractId = account.wallet;
                                            break;                                        
                                        default:
                                            alert('Wrong choice.')
                                            break;
                                    }
                                    
                                    const fee = arweave.ar.arToWinston('0.1');
                                    
                                    if (window.confirm("The fee to update an address in your SSI is 0.1 $AR, paid to the $AYJA profit sharing community. Click OK to proceed.")) {
                                        if( pscMember === account.ssi ){
                                            alert(`You got randomly selected as the PSC winner for this transaction - lucky you! That means no fee.`)
                                            const tx = await SmartWeave.interactWrite(arweave, JSON.parse(wallet.key), contractId, input);
                                            alert(`Transaction ID: ${tx}`);
                                        } else {
                                            const tx = await SmartWeave.interactWrite(arweave, JSON.parse(wallet.key), contractId, input, [], pscMember, fee);
                                            alert(`Transaction ID: ${tx}`);
                                        }                                       
                                    }
                                } catch (error) {
                                    alert(error)
                                }
                            }}
                        />
                    </div>
                </div></form>
            </section>
            <section style={{ width: "100%" }}>
                <h4 class="major">Generate a new key</h4>
                <form><div class="fields">
                    <div class="field half">
                        <select onChange={ handleKeyId }>
                            <option value="" disabled selected>Select</option>
                            <option value="ssiComm">SSI Communication Key</option>
                            <option value="byId">Key by ID</option>
                        </select>
                    </div>
                    
                    { keyId === "byId" && <div class="field half"><input type="text" placeholder="Key ID" onChange={ handleSpecificId } /></div> }
                    
                    <div class="field half">
                        <input type="button" class="button" value="Encrypt and save in your permawallet"
                            onClick={ async() => {
                                try {
                                    if( !wallet.key ) {
                                        throw new Error(`At this version, there is a bug in ArConnect that prevents signing transactions - but their team will fix it soon! In the meantime, you have to choose a keyfile.`);
                                    }

                                    if( !account.wallet || account.wallet === "") {
                                        throw new Error(`It seems like you don't have any SSI Permawallet registered.`);
                                    }

                                    const arweave = Arweave.init({
                                        host: 'arweave.net',
                                        port: 443,
                                        protocol: 'https'
                                    });
                                    const publicEncryption = await DKMS.generatePublicEncryption(JSON.parse(wallet.key));
                                    let input;
                                    switch (keyId) {
                                        case 'ssiComm':
                                            {
                                                const ssiCommKeys = await DKMS.generateSsiKeys(arweave);
                                                const ssiCommPrivate = await DKMS.encryptData(ssiCommKeys.privateKey, publicEncryption);
                                                input = {
                                                    function: 'ssiComm',
                                                    ssiComm: ssiCommKeys.publicEncryption,
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
                                            alert('Wrong choice.')
                                            break;
                                    }
                                    const fee = arweave.ar.arToWinston('0.1');
                                    
                                    if (window.confirm("The fee to create a new key in your permawallet is 0.1 $AR, paid to the $AYJA profit sharing community. Click OK to proceed.")) {
                                        if( pscMember === account.ssi ){
                                            alert(`You got randomly selected as the PSC winner for this transaction - lucky you! That means no fee.`)
                                            const tx = await SmartWeave.interactWrite(arweave, JSON.parse(wallet.key), account.wallet, input);
                                            alert(`Transaction ID: ${tx}`);
                                        } else {
                                            const tx = await SmartWeave.interactWrite(arweave, JSON.parse(wallet.key), account.wallet, input, [], pscMember, fee);
                                            alert(`Transaction ID: ${tx}`);
                                        }                                       
                                    }
                                } catch (error) {
                                    alert(error)
                                }                            
                            }}
                        />
                    </div>
                </div></form>
            </section>
        </div>
	);
}

export default withRouter(Settings);
