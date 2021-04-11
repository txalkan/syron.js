import React, { useState, useEffect } from "react";
import useArConnect from 'use-arconnect';
import { withRouter } from "react-router-dom";
import { Settings, Profile, CreateAccount } from ".";
import Arweave from 'arweave';

function ConnectWallet({ taken, username, domain, account, pscMember }) {   
    const[value, setValue] = useState('ArConnect');
    const[addr, setAddr] = useState('');
    const[arconnect, setArconnect] = useState('');
    const[keyfile, setKeyfile] = useState('');

    const arConnect = useArConnect();
    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https'
    });

    useEffect(() => {
        if (!arConnect) return;
        (async () => {
            try {
                const permissions = await arConnect.getPermissions();
                if (permissions.includes("ACCESS_ADDRESS")) {
                    setAddr(await arConnect.getActiveAddress());
                    setValue('Disconnect');
                    window.addEventListener("walletSwitch", e => { setAddr(e.detail.address)});
                    setArconnect(arConnect);
                }
            } catch {}
        })();
    }, [arConnect]);

    const fileInput = React.createRef();

    const handleKeyFile = event => {
        event.preventDefault();
        alert(`Selected file: ${fileInput.current.files[0].name}`);
        const fr = new FileReader();
        fr.onload = function (e) {
            const file = JSON.parse(e.target.result);
            setKeyfile(file);
        };
        fr.readAsText(fileInput.current.files[0]);
    };

    return(
		<div id="main" style={{ marginTop:"4%" }}>
            <section style={{ width:'100%' }}>
                <p>You can connect your SSI Permaweb Key to access or create your account:</p>
                <ul class="actions">
                    <li><input class="button" type="button" value={ value }
                        onClick={ async() => {
                            switch (value) {
                                case "Disconnect":
                                    await arConnect.disconnect()
                                    setValue('ArConnect');
                                    setArconnect('');
                                    setAddr('');
                                    alert(`Your wallet got successfully disconnected.`)
                                    return;
                                default:
                                    const permissions = [
                                        "ACCESS_ADDRESS",
                                        "SIGN_TRANSACTION",
                                        "ENCRYPT",
                                        "DECRYPT"
                                    ]
                                    try {
                                        if (!arConnect) {
                                            if (window.confirm("You have to download the ArConnect browser extension. Click OK to get redirected.")) {
                                                window.open("https://arconnect.io/")
                                            }                    
                                        } else {
                                            await arConnect.connect(permissions);
                                            setAddr(await arConnect.getActiveAddress());
                                            setValue("Disconnect");
                                            setArconnect(arConnect);
                                        }
                                        } catch(err) {
                                    alert(`${err}.`)
                                    }
                                    break;
                            }
                        }}
                    /></li>
                    <li><input type="file" ref={ fileInput } onChange={ handleKeyFile } />
                    <input class="button" type="button" value="Save keyfile"
                        onClick={ async() => {
                            if( keyfile !== ''){
                                const address = await arweave.wallets.jwkToAddress(keyfile);
                                alert(`The address of this keyfile is: ${address}`)
                                setAddr(address);
                            } else{
                                alert(`Address not retrieved from keyfile.`)
                            }
                        }}
                    /></li>
                </ul>
                <hr />
            </section>
            <section style={{ width:'100%' }}>
                { addr !== '' && account.ssi === addr && <Settings username={ username } domain={ domain } account={ account } pscMember={ pscMember } arweave={ arweave } arconnect={ arconnect } keyfile={ keyfile } /> }
                { taken === "yes" && account.ssi !== addr && <Profile username={ username } domain={ domain } account={ account } arweave={ arweave } arconnect={ arconnect } keyfile={ keyfile } /> }
                { taken === "no" && <CreateAccount username={ username } domain={ domain } address={ addr } pscMember={ pscMember } arweave={ arweave } arconnect={ arconnect } keyfile={ keyfile } /> }
            </section>
        </div>
        
	);
}

export default withRouter(ConnectWallet);
