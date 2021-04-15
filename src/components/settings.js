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

    const emptyMessage = {
        firstName: "",
        lastName: "",
        streetName: "",
        buildingNumber: "",
        country: ""
    };
    const[ivms101, setIvms101] = useState(emptyMessage);
    const[firstName, setFirstName] = useState('');
    const[lastName, setLastName] = useState('');
    const[streetName, setStreetName] = useState('');
    const[buildingNumber, setBuildingNumber] = useState('');
    const[country, setCountry] = useState('');
    const handleFirstName = event => {
        setFirstName(event.target.value);
    };
    const handleLastName = event => {
        setLastName(event.target.value);
    };
    const handleStreetName = event => {
        setStreetName(event.target.value);
    };
    const handleBuildingNumber = event => {
        setBuildingNumber(event.target.value);
    };
    const handleCountry = event => {
        setCountry(event.target.value);
    };

    const[updateAddressLegend, setUpdateAddressLegend] = useState('update');
    const[updateAddressButton, setUpdateAddressButton] = useState('button primary');
    const[sendKey, setSendKey] = useState('encrypt & send to permawallet');
    const[newKeyButton, setNewKeyButton] = useState('button primary');
    const[savePassportLegend, setSavePassportLegend] = useState('save');
    const[savePassportButton, setSavePassportButton] = useState('button primary');
    const[updatePassportLegend, setUpdatePassportLegend] = useState('update');
    const[updatePassportButton, setUpdatePassportButton] = useState('button primary');
    
    return(
		<div id="main">
            <h2 class="major">{ username }.{ domain } settings</h2>
            <p style={{ width: "100%" }}>Hi { username }.{ domain }, welcome back!</p>
            <section style={{ width: "100%", marginTop:"4%" }}>
                <h4 class="major">Update an address</h4>
                <form>
                    <div class="fields">
                        <div class="field half">
                            <select onChange={ handleUpdate }>
                                <option value="">Select</option>
                                <option value="ssiAyja">SSI address in AYJA</option>
                                <option value="permawallet">Permawallet address</option>
                                <option value="ssiPermawallet">SSI address in permawallet</option>
                            </select>
                        </div>
                        
                        { update !== "" && <div class="field half"><input type="text" placeholder="New address" onChange={ handleNewAddress } /></div> }
                    </div>
                    <ul class="actions">
                        <li><input type="button" class={ updateAddressButton } value={ updateAddressLegend }
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
                                        if( window.confirm("The fee to update an address in your SSI is 0.1 $AR, paid to the AYJA profit sharing community. Click OK to proceed.")) {
                                            if( pscMember === account.ssi ){
                                                alert(`You got randomly selected as the PSC winner for this transaction - lucky you! That means no fee.`);
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
                                            tx = tx.id;                                  
                                        }
                                    } else{
                                        if(window.confirm("The fee to update an address in your SSI is 0.1 $AR, paid to the AYJA profit sharing community. Click OK to proceed.")) {
                                            if( pscMember === account.ssi ){
                                                alert(`You got randomly selected as the PSC winner for this transaction - lucky you! That means no fee.`)
                                                tx = await SmartWeave.interactWrite(arweave, keyfile, contractId, input).catch( err => { throw err });
                                            } else{
                                                tx = await SmartWeave.interactWrite(arweave, keyfile, contractId, input, [], pscMember, fee).catch( err => { throw err });
                                            }                                       
                                        }
                                    }
                                    if( tx === undefined ){
                                        alert(`Transaction rejected.`)
                                    } else{
                                        alert(`Your transaction was successful! Its ID is: ${ tx }`);
                                        setUpdateAddressLegend('updated');
                                        setUpdateAddressButton('button');
                                    }                             
                                } catch (error) {
                                    alert(error)
                                }
                            }}
                        /></li>
                        <li><input type="reset" value="Reset" onClick={ _event => { setUpdate(""); setUpdateAddressLegend('update'); setUpdateAddressButton('button primary') }} /></li>
                    </ul>
                </form>
            </section>
            <section style={{ width: "100%", marginTop: "4%" }}>
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
                        <li><input type="button" class={ newKeyButton } value={ sendKey }
                            onClick={ async() => {
                                try {
                                    if( keyfile === '' &&  arconnect === '' ){
                                        throw new Error(`You have to connect with ArConnect or your keyfile.`)
                                    }

                                    if( !account.wallet || account.wallet === "") {
                                        throw new Error(`It seems like you don't have any SSI Permawallet registered.`);
                                    }

                                    let tx;
                                    if( arconnect !== '' ){ 
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
                                        
                                        if(window.confirm("The fee to create a new key in your permawallet is 0.1 $AR, paid to the AYJA profit sharing community. Click OK to proceed.")) {
                                            if( pscMember === account.ssi ){
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
                                            tx.addTag('Contract', ayjaPstStateID.toString());
                                            tx.addTag('Input', JSON.stringify(input));

                                            await arweave.transactions.sign(tx).catch( err => { throw err });
                                            await arweave.transactions.post(tx).catch( err => { throw err });
                                            tx = tx.id;                                   
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
                                        
                                        if( window.confirm("The fee to create a new key in your permawallet is 0.1 $AR, paid to the AYJA profit sharing community. Click OK to proceed.")) {
                                            if( pscMember === account.ssi ){
                                                alert(`You got randomly selected as the PSC winner for this transaction - lucky you! That means no fee.`);
                                                tx = await SmartWeave.interactWrite(
                                                    arweave,
                                                    keyfile,
                                                    account.wallet.toString(),
                                                    input        
                                                ).catch( err => { throw err });
                                            } else{
                                                tx = await SmartWeave.interactWrite(
                                                    arweave,
                                                    keyfile,
                                                    account.wallet.toString(),
                                                    input,
                                                    [],
                                                    pscMember.toString(),
                                                    fee.toString()
                                                ).catch( err => { throw err });
                                            }                                       
                                        }
                                    }
                                    if( tx === undefined ){
                                        alert(`Transaction still processing.`)
                                    } else{
                                        alert(`Your transaction was successful! Its ID is: ${ tx }`);
                                        setSendKey('sent');
                                        setNewKeyButton('button');
                                    }
                                } catch (error) {
                                    alert(error)
                                }                            
                            }}
                        /></li>
                        <li><input type="reset" value="Reset" onClick={ _event => { setKeyId(""); setSendKey('send'); setNewKeyButton('button primary') }}/></li>
                    </ul>
                </form>
            </section>
            <section style={{ width: "100%", marginTop: "4%" }}>
                <h4 class="major">Update your SSI Travel Rule Passport</h4>
                <form>
                    <div class="fields">
                        <div class="field half">
                            <label>First name</label>
                            <input type="text" onChange={ handleFirstName } />
                        </div>
                        <div class="field half">
                            <label>Last name</label>
                            <input type="text" onChange={ handleLastName } />
                        </div>
                    </div>
                    <section style={{width:'100%', marginBottom:"3%"}}>
                        <h4>Residential address</h4>
                        <div class="fields">
                            <input type="text" placeholder="Street name" onChange={ handleStreetName } />
                        </div>
                    </section>
                    <div class="fields">
                        <div class="field half">
                            <input type="text" placeholder="Building number" onChange={ handleBuildingNumber } />
                        </div>
                        <div class="field half">
                            <select onChange={ handleCountry }>
                                <option value="">Select country of residence</option>
                                <option value="Argentina">Argentina</option>
                                <option value="Denmark">Denmark</option>
                                <option value="Singapore">Singapore</option>
                                <option value="United Kingdom">United Kingdom</option>
                            </select>
                        </div>
                    </div>
                    <ul class="actions">
                        <li><input type="button" class={ savePassportButton } value={ savePassportLegend }
                                onClick={ () => {
                                    setIvms101({
                                        firstName: firstName,
                                        lastName: lastName,
                                        streetName: streetName,
                                        buildingNumber: buildingNumber,
                                        country: country
                                    });
                                    setSavePassportLegend('Saved');
                                    setSavePassportButton('button');
                                }}
                                />
                        </li>
                        <li><input type="button" class={ updatePassportButton } value={ updatePassportLegend }
                                onClick={ async() => {
                                    try {
                                        if( keyfile === '' &&  arconnect === '' ){
                                            throw new Error(`You have to connect with ArConnect or your keyfile.`)
                                        }
                                        if( savePassportLegend === 'save' ){
                                            throw new Error('You have to fill up and save the SSI Travel Rule Passport information first.')
                                        }

                                        // Travel Rule Passport
                                        const trSsiKeys = await DKMS.generateSsiKeys(arweave);
                                        const encryptedTrPassport = await DKMS.encryptData(ivms101, trSsiKeys.publicEncryption);
                                        alert(`This is your encrypted SSI Travel Rule Passport: ${ encryptedTrPassport }`);

                                        const fee = arweave.ar.arToWinston('0.1');
                                        
                                        let ssiTravelRulePrivate;
                                        let input;
                                        let tx;
                                        if( arconnect !== '' ){
                                            if( window.confirm("The fee to update your SSI Travel Rule Passport is 0.1 $AR, paid to the AYJA profit sharing community. Click OK to proceed.")) {
                                                ssiTravelRulePrivate = await DKMS.encryptKey(arconnect, trSsiKeys.privateKey);
                                                input = {
                                                    function: 'trp',
                                                    trmessage: encryptedTrPassport,
                                                    trkey: ssiTravelRulePrivate
                                                };
                                                
                                                if( pscMember === account.ssi ){
                                                    alert(`You got randomly selected as the PSC winner for this transaction - lucky you! That means no fee.`);
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
                                                tx.addTag('Contract', account.wallet.toString());
                                                tx.addTag('Input', JSON.stringify(input));
        
                                                await arweave.transactions.sign(tx).catch( err => { throw err });
                                                await arweave.transactions.post(tx).catch( err => { throw err });
                                                tx = tx.id;                                  
                                            }
                                        } else{
                                            if(window.confirm("The fee to update an address in your SSI is 0.1 $AR, paid to the AYJA profit sharing community. Click OK to proceed.")) {
                                                const publicEncryption = await DKMS.generatePublicEncryption(keyfile);
                                                ssiTravelRulePrivate = await DKMS.encryptData(trSsiKeys.privateKey, publicEncryption);
                                                input = {
                                                    function: 'trp',
                                                    trmessage: encryptedTrPassport,
                                                    trkey: ssiTravelRulePrivate
                                                };

                                                if( pscMember === account.ssi ){
                                                    alert(`You got randomly selected as the PSC winner for this transaction - lucky you! That means no fee.`)
                                                    tx = await SmartWeave.interactWrite(arweave, keyfile, account.wallet.toString(), input).catch( err => { throw err });
                                                } else{
                                                    tx = await SmartWeave.interactWrite(arweave, keyfile, account.wallet.toString(), input, [], pscMember, fee).catch( err => { throw err });
                                                }                                       
                                            }
                                        }
                                        if( tx === undefined ){
                                            alert(`Transaction rejected.`)
                                        } else{
                                            alert(`Your transaction was successful! Its ID is: ${ tx }`);
                                            setUpdatePassportLegend('updated');
                                            setUpdatePassportButton('button');
                                        }                            
                                    } catch (error) {
                                        alert(error)
                                    }
                                }}
                            /></li>
                        <li><input type="reset" value="Reset" onClick={ _event => { setIvms101(emptyMessage); setSavePassportLegend('save'); setSavePassportButton('button primary'); setUpdatePassportLegend('update'); setUpdatePassportButton('button primary') }}/></li>  
                    </ul>
                </form>
            </section>
        </div>
	);
}

export default Settings;
