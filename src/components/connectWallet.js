import React, { useState, useEffect } from "react";
import useArConnect from 'use-arconnect';
import { withRouter } from "react-router-dom";
import { Settings, Profile, CreateAccount } from ".";

function ConnectWallet({ taken, username, domain, account, pscMember }) {   
    const[value, setValue] = useState('Connect with ArConnect');
    const[addr, setAddr] = useState('');

    const arConnect = useArConnect();
    const wallet = {
        arConnect: arConnect
    }
    
    useEffect(() => {
        if (!arConnect) return;
        (async () => {
            try {
                const permissions = await arConnect.getPermissions();
                if (permissions.includes("ACCESS_ADDRESS")) {
                    setAddr(await arConnect.getActiveAddress());
                    setValue('Disconnect');
                    window.addEventListener("walletSwitch", e => { setAddr(e.detail.address)});                }
            } catch {}
        })();
    }, [arConnect]);

    const fileInput = React.createRef();

    const handleKeyFile = event => {
        event.preventDefault();
        alert(`Selected file: ${fileInput.current.files[0].name}`);
        const fr = new FileReader();
        fr.onload = function (e) {
            wallet.key = e.target.result;
        };
        fr.readAsText(fileInput.current.files[0]);
    };

    return(
		<div id="main">
            <section>
                <input class="button primary" type="button" value={ value }
                    onClick={ async() => {
                        switch (value) {
                            case "Disconnect":
                                await arConnect.disconnect()
                                setValue('Connect with ArConnect');
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
                                    }
                                    } catch(err) {
                                alert(`${err}.`)
                                }
                                break;
                        }
                    }}
                />
            </section>
            <section style={{ marginTop: "3%" }}>
                <h4>Choose a keyfile with your SSI Permaweb Key:</h4>
                <input type="file" ref={ fileInput } />
                <input class="button" type="button" value="Save keyfile"
                        onClick={ handleKeyFile }
                />
            </section>
            { value === "Disconnect" && account.ssi === addr && <Settings username={ username } domain={ domain } account={ account } pscMember={ pscMember } wallet={ wallet } /> }
            { taken === "yes" && value === "Connect with ArConnect" && <Profile username={ username } domain={ domain } account={ account } /> }
            { taken === "no" && <CreateAccount username={ username } domain={ domain } pscMember={ pscMember } wallet={ wallet } /> }
        </div>
        
	);
}

export default withRouter(ConnectWallet);
