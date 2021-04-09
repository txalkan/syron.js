import React, {useState, useEffect} from "react";
import useArConnect from 'use-arconnect';
import Arweave from 'arweave';
import * as DKMS from '../lib/dkms';
import * as TR from "../lib/travel-rule-passport";
import * as SmartWeave from 'smartweave';
import { selectWeightedAyjaHolder } from "../lib/select-weighted-ayja-holder";
import { Link, withRouter } from "react-router-dom";

function Permawallet() {   
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

    const message = {
        firstName: "",
        lastName: "",
        streetName: "",
        buildingNumber: "",
        country: ""
    };
    const[ivms101, setIvms101] = useState(message);
    
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

	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{marginBottom: '2%'}}><Link to="/">🔙</Link></span>
            <h2 class="major">SSI Permawallet</h2>
                <p>The amount of keys that a decentralized identity requires as <Link to="/did">verification methods</Link> is an issue. Most wallets in the market rely on third parties, so the secure management of private keys can be a problem for the user - even more when they have private keys for different blockchains. The Tyron SSI Protocol Dapp solves this issue by implementing its own <a href="https://www.youtube.com/watch?v=LOrXOxc2yp0">Decentralized Key Management System</a> on-chain on the immutable permaweb and backing up the user's SSI private keys into their Self-Sovereign Identity Permawallet.</p>
                <p>An SSI Permawallet is a smart contract owned by its user where all keys got encrypted by the user's Permaweb SSI Key (their Arweave main key). Whenever necessary, the user can read the data from their on-chain wallet, decrypt it and use it to make the signatures required by their self-sovereign identity.</p>
                <p>With an SSI Permawallet, the user must only worry about one private key: their Permaweb SSI Key. This improved user experience also brings to the user peace of mind that all their other private keys and personal information are encrypted, safely stored and always available on their on-chain wallet that lives on the permaweb - a decentralized, immutable and uncensorable Web 3.0.</p>
            <section>
                <h3>Travel Rule SSI Passport for multi-chain KYC</h3>
                <p>The SSI Permawallet also stores the user's Travel Rule SSI Passport: An <a href="https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf">IVMS101 message</a> that makes this self-hosted wallet compliant with the FATF Travel Rule. This passport has the user's personal information encrypted by the user's Travel Rule SSI Key. When executing a virtual asset transfer, the user attaches a copy of this key encrypted by the beneficiary's SSI Communication Key - so that the beneficiary, and only the beneficiary, can read their Travel Rule SSI Passport.</p>
            </section>    
            <section>
                <h3>The SSI Communication Key</h3>
                <p>Self-sovereign identities can send messages to each other, encrypting them with the receiver's SSI Communication Key - so that only the receiver can read them. For example, when sending a transfer, the originator can attach their Travel Rule SSI Key encrypted by the beneficiary's SSI Communication Key so they can read the originator's Travel Rule Passport.</p>
            </section>
            <section style={{width:'100%'}}>
                <h3 class="major">Create an SSI Permawallet</h3>
                <ol>
                    <li>Create a new or load an existing Arweave wallet on the <a href="https://arconnect.io/">ArConnect</a> browser extension. Choose carefully since the private key of this wallet will be your Permaweb SSI Key.</li>
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
                                            setAyjaID('ZgELSX7eJHc9sqmGuC1I3n2CRWG3PCRxG7rqDS2at5E');
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
                    <li>
                        <h4>Travel Rule SSI Passport</h4>
                        <p>Generate an <a href="https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf">IVMS101 message</a> for KYC to make your self-hosted wallet compliant with the FATF Travel Rule to counteract money laundering and terrorism financing, and thus building a web of trust. This personal information will get encrypted by a Travel Rule SSI Key generated by your SSI Permawallet - only you decide who can read this message. You won't need to give this information anymore to other third parties, over and over again. Your Travel Rule SSI (private) Key will get encrypted by your Permaweb SSI Key and saved into your wallet, so only you can access it. When making a transfer, you will have the option to attach this secret encrypted by the beneficiary's SSI Communication Key so they can read your Travel Rule Passport.</p>
                        <form>
                            <div class="fields">
                                <div class="field half">
                                    <label>First name</label>
                                    <input type="text" onChange={handleFirstName} />
                                </div>
                                <div class="field half">
                                    <label>Last name</label>
                                    <input type="text" onChange={handleLastName} />
                                </div>
                            </div>
                            <section style={{width:'100%', marginBottom:"3%"}}>
                                <h4>Residential address</h4>
                                <div class="fields">
                                    <input type="text" placeholder="Street name" onChange={handleStreetName} />
                                </div>
                            </section>
                            <div class="fields">
                                <div class="field half">
                                    <input type="text" placeholder="Building number" onChange={handleBuildingNumber} />
                                </div>
                                <div class="field half">
                                    <select onChange={handleCountry}>
                                        <option value="" disabled selected>Select country of residence</option>
                                        <option value="Argentina">Argentina</option>
                                        <option value="Denmark">Denmark</option>
                                        <option value="Singapore">Singapore</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                    </select>
                                </div>
                            </div>
                            <ul class="actions">
                                <li><input class="button primary" type="button" value="Save Travel Rule SSI Passport"
                                    onClick={() => {
                                        setIvms101({
                                            firstName: firstName,
                                            lastName: lastName,
                                            streetName: streetName,
                                            buildingNumber: buildingNumber,
                                            country: country
                                        })
                                        alert("Information received.")
                                    }}
                                    />
                                </li>
                                <li><input type="reset" value="Reset" /></li>
                            </ul>
                        </form>
                    </li>
                    <li>
                        <p>Deploy your SSI Permawallet smart contract:</p>
                        <input type="button" class="button primary" value="Create your Self-Sovereign Identity Permawallet"
                            onClick={ async() => {
                                let arweave;
                                switch (host) {
                                    case 'arweave.net':
                                        {
                                            arweave = Arweave.init({
                                                host: 'arweave.net',
                                                port: 443,
                                                protocol: 'https'
                                            });
                                        }                                        
                                        break;
                                    default:
                                        alert(`Go back to step 2.`)
                                        break;
                                }

                                if(arweave !== undefined ) {
                                    // SSI Communication Keys
                                    const ssiCommKeys = await DKMS.generateSsiKeys(arweave);
                                    
                                    // Travel Rule Passport
                                    const trSsiKeys = await DKMS.generateSsiKeys(arweave);
                                    const encryptedTrPassport = await TR.encryptTravelRulePassport(ivms101, trSsiKeys.publicEncryption);
                                    const encryptedTrSsiKey = await DKMS.encryptKey(arConnect, trSsiKeys.privateKey);
                                    
                                    /*For testing
                                    const decryptedTrSsiKey = await DKMS.decryptKey(arConnect, encryptedTrSsiKey);
                                    alert(`TR decrypted key: ${decryptedTrSsiKey}`);

                                    const decryptedTrPassport = await TR.decryptTravelRulePassport(encryptedTrPassport, trSsiKeys.privateKey);
                                    alert(decryptedTrPassport);*/

                                    let permawalletInitState = await SmartWeave.readContract(arweave, permawalletTemplateID);
                                    permawalletInitState.ssi = addr;
                                    permawalletInitState.comm = ssiCommKeys.publicEncryption;
                                    permawalletInitState.trp.message = encryptedTrPassport;
                                    permawalletInitState.trp.key = encryptedTrSsiKey;
                                    alert(JSON.stringify(permawalletInitState));
                                    
                                    // Fee paid to the PSC

                                    const ayjaState = await SmartWeave.readContract(arweave, ayjaID);
                                    alert(JSON.stringify(ayjaState));
                                    const holder = selectWeightedAyjaHolder(ayjaState.accounts);
                                    const fee = arweave.ar.arToWinston('0.00001');

                                    const permawebKey = {
                                        "kty":"RSA",
                                        "n":"4_p_UZtqwMZQU7_mNWK_r-MVT6Bbgzm1DOKdmYOBbd4fEfvONUQ3DxDtLVYZ3LNqsRM6mf04d86yjE44huh28av7IsG0rwnQM09Jd_KLDnkSzDUI_RcGuKXFgPEov-6P7wxsovRPvLd_FPWFxqvfXweyuzutpnBgB3ST01McSXUXyrBqGDAHsYqmVLghMuGaroz9ucNlKsn0vt2OK5NQtFM3oVLsgD2OmTGxwvKH9q2UR1-YiK2tqXxO5PN9p84ddwdMz-a3BG3wIor5CucE74OJMWwyeF27g-IeftGF3s0A4S70ABhfdDJb1BXf72I4QuYP80SLO4B92xwfNpG-sgT8F8mxZZPV1eHYxDgvf6oTIiIaKpRAITpq5Q0aSzDoMtyxXohoi_0yT4mSQ2qnf26Anz-W3qLMpy9RzThIYwDvG3Tjk5HUqKv4mPbdUucc-pO0FY_QlkPad6x7txJWH3FVtLtl0eCO_RvbCppw0b8YHepED5oaWwyQLTfvP41_8EplbrMSLGIFw962gJTM3gtz0iK37e1RpuEXbpqyb4W9eSf5LtgUnK1_JpsnEYvNJXBb6D8NTuiJmElS1cLtuspAEZgX5DruWxwl_0Rnb3SEBoXuitYvSzRVwT5C1t17BDZ9WFaiWYRQfQUYMnCI9sRP1cDmJpcb7RR0wSfkEOs",
                                        "e":"AQAB",
                                        "d":"v1oiQ30PvX63LZSExYp9GkSgPpV6OkrVjFsprRCUMoOd0JpqGouHKz4p1UPPsU9m3fol1dqU6vqzItEE4Td9npubzzCHV-QEvQxvvh32Wc-F16EsSkJpgdKiU_gXHAJBDYSAKsalpuDd6dmqz3azpi_v9PfCaVEpSRiwe0_nDkEaFya75lFqI7scoT9rnil-i8QLs0AuShv5MbsE-c5Mjw7KQr43g-wnJK5xZg_rz0EilEXI4e_lM70C-2jkr1RxptaZwmcEdtNQG65KGryNh_v_y1vlgOIr4iaJMijrFHc9pcSjSPEsLXuXWAyESYlHb99qw-VkeC0BdkfEaykpxOxhlbpzseatVGteaRbNM-7_crSZtnBXcHewIT09Ywbf99DgvSYhL2cXl8spO19nl9Z7cCjUZIWeGgQ7xGlvrKhQs5oSXBif7p2ekRatnXu87xXsP2SZRS6g6AEzJNrVxjdVH7__G1mYsnbHmpXqumtMpiyqs7HQlKHZgrERVJVIvJUu7QWR-Te_lAPH5JiH4NDU-3wApo7ufBie1T4HhY1AzZcPxVEO2lk7TqSOJQ5ZsPWhHKsfDHv7cdy7rLTXx74d8otcmrkWVrOKDN7pzRo5FVm6ZoycaVfLtAIsdaFfBGFEc9OoDF4lhhoeWvuaGoPTZBW8cRUjUtm6XxvaKwE",
                                        "p":"-fLW-9PIPoFGO1dBRMYnNi7X_nTTcPsfZMAoi_sFIMr5YRWguiZW2meY9xajl-JFj1aqSJJ2JpURmPHPbwMQR1Qh9E0GHcHwdBY3UQy4L4nzTcwLcXuZM_iScb93dPEAdhQOf2ZW4dSGb-xKo7MKeKUF_vy87ft_VkHBN0zuJk7RVBvsq8u992Q0yYm5R5Gbn-vJdG--mGxDh88v4ucqElgXuxky8LzJwq3U_4DwCUJqbeuf_1pru0Fy-JbvszLw0ov5aeGy7F32Hpc5iMhVOoymoBcpCrsKBx6IR6TUYzvKHVB_GYThUraQsbEXWSUmb76z1ijS-sKihd3vt2CQvQ",
                                        "q":"6X99IwGYvi0egJd1AI_d5_ZNLF_j-Q897fBREW-K2I04qOp08zMQ6K3Tv5ofj0tMWOTTScwzpSixkv9MsQ05mBwcTOJAaJ_dnAx1Ww-neyMi4piQXo1il1_ttVJ8A0ir84i6PaQ2OegghYmy3r1nkEhrfxTWChJRkvIRaFc77WJ7AbNh6hc6ZZnouB3Y32ql72Bc5IIatSbc_Ia6fPvz5IxsL4fWhRvBKF8OveqXUzCig8TvSM2VdjezIJGPdbi4Suzn4skm7iGFjw2BL60xvNdus-DpboMLeFMELgPDRPwvOb-W2v5YJXSGBE2wybPU9OSkVOt2FElRuBPMa-2mxw",
                                        "dp":"kqZ8pLyZnLLUtjR3wxZQI2ZQrKd2968fuElWgOsDEz6EGwZJi267PuHRygeqbI8CKRu8RWBJmlGURZx7DLNLdc5TLbeTgxorLrFqO0-vMZVK_7ZccHUIaonJwpuIR0Cv-JfD-dPd3hqH1ltZX7rIxghtADLh1u_cwotKBlxIzokoIKVRs2qTRvewUR9RakBwguAhDwQRW_UJmkFh40umT6UIJ2qdjMn3xxWfB1pre8NQFrZM5dHzq6a3Akvsz8NvsNkXuZwHEs_-e-xWgX6pIvUrPnrYRceAFrU_WGnJg3-tEo4MRLjGS3V6aAdzn4ZAiwflFB5Xy3EvUkPpRjqOMQ",
                                        "dq":"ikCmQ1fqrI_ig5kp-c81QOchAqk0Pn-712p3Va-JsnbLmZhY7rbJyDtEKSqEjT-0UN4MDKIP4jaaDcOEEUEXXO0oBI3iPRCLEp59zhESxWIkga57rMBiI-b0xGu2aetZhLTsMRtN0DOVLfw-IIxdCZ0XqQMZSJVYH32cuP8NyJyK4JLp4sUmGopqtLlXc9GdtoKD_fja_2-nYQ4U1XQJEMXkOLBhYCby04iVHfYM64DceNDeLWksmfaY5SvKmZVp6VMkaa9YkZ7fibghSa1uybV1IqSFEp4c6H2e9-_aaro27CZ4l-oJHwRDZcDqcEM-UFIgyvcvzwsqi6eNXko0eQ",
                                        "qi":"HTIz2vU_GRadVXv8iJmXdUAH_mGjLbscQKJ6ghINN5FlwBKxPIfmzmnhibOeaPZxhxm8VbzQnk9ZdnkValZbhE3BCVMT2WbBoQfJBdA7htwgttZoHzlk9y5oRI_MDtEXo9IL3NEHvd5fhE1Vr0gIiBPw_afP0s1XWA2LXB7a0XEzE9Tmw-iRtsKBgksVynI-cDsRQ2n-vVsEPSPXPuLAvlsM-SIqttIULWxKDh1GoR7A-PS7F88xZh_j0oH9cwv-2FkJYXdnv83dRuWc_tyV97gHmTRW0T0VtLfEGte9kVeo0_1C0alZYg5T4pWg5wQZDZO61IFw-WR-sRvP_53KKw"
                                    };

                                    if (window.confirm("The fee to create your SSI Permawallet is 0.00001 $AR. Click OK to accept.")) {
                                        alert("Processing...")
                                        const tx = await arweave.createTransaction({
                                            target: holder,
                                            quantity: fee
                                        });

                                        await arweave.transactions.sign(tx, permawebKey);
                                        //await arConnect.sign(tx);
                                        
                                        await arweave.transactions.post(tx);
                                        alert("Paid out to PSC member.");
                                    }

                                    const permawalletID = await DKMS.createPermawallet(arweave, arConnect, permawalletInitState, permawalletTemplateID, permawebKey);
                                    alert(`Success! Your permawallet ID is: ${permawalletID}`);
                                }
                            }}
                        />
                    </li>
                    <li style={{marginTop:"4%", marginBottom:"4%"}}>Go to the <Link to="/browser">browser</Link> and have fun!</li>
                </ol>
            </section>
        </div>
	);
}

export default withRouter(Permawallet);
