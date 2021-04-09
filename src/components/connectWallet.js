import React, {useState, useEffect} from "react";
import useArConnect from 'use-arconnect';
import Arweave from 'arweave';
import * as DKMS from '../lib/dkms';
import * as TR from "../lib/travel-rule-passport";
import * as SmartWeave from 'smartweave';
import { selectWeightedAyjaHolder } from "../lib/select-weighted-ayja-holder";
import { Link, withRouter } from "react-router-dom";
import { ayjaPstID } from ".";

function ConnectWallet() {   
    const[value, setValue] = useState('Connect your Permaweb SSI Key');
    const[addr,setAddr] = useState('');
    const[host, setHost] = useState('');
    
    const arConnect = useArConnect();
    useEffect(() => {
        if (!arConnect) return;
        (async () => {
            try {
                const permissions = await arConnect.getPermissions();
                if (permissions.includes("ACCESS_ADDRESS")) {
                    setAddr(await arConnect.getActiveAddress());
                    setHost('arweave.net');
                    setValue('Disconnect your Permaweb SSI Key');
                }
            } catch {}
        })();
    }, [arConnect]);

    const[ayjaID, setAyjaID] = useState('');
    const[permawalletTemplateID, setpermawalletTemplateID] = useState('');

    return(
		<div id="main">
            <section>
                <input class="button primary" type="button" value={value} style={{marginTop:"4%", marginBottom:"4%"}}
                    onClick={ async() => {
                        switch (value) {
                            case "Disconnect your Permaweb SSI Key":
                                await arConnect.disconnect()
                                setValue('Connect your Permaweb SSI Key');
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
                                        setHost('arweave.net');
                                        setAyjaID(ayjaPstID);
                                        setpermawalletTemplateID('ZdGlXLsq-wYJ8KbAgwY6VyCSI6EMvkZrmqGrjiGehp4');
                                        setValue("Disconnect your Permaweb SSI Key");
                                    }
                                } catch(err) {
                                    alert(`${err}.`)
                                }
                                break;
                        }
                    }}
                />
            </section>
        </div>
	);
}

export default withRouter(ConnectWallet);
