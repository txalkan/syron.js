import React, { useState } from "react";
import { Link, withRouter } from "react-router-dom";
import Arweave from 'arweave';
import * as SmartWeave from 'smartweave';
import { ayjaPstStateID, ConnectWallet } from ".";
import { selectWeightedAyjaHolder } from "../lib/select-weighted-ayja-holder";

function Browser() {
    const[username, setUsername] = useState('');
    const[domain, setDomain] = useState('mapu');
    const[account, setAccount] = useState({});
    const[pscMember, setPscMember] = useState('');
    const[taken, setTaken] = useState('no');

    const handleUsername = event => {
        event.preventDefault();
        setUsername(event.target.value);
    };
    const handleDomain = event => {
        setDomain(event.target.value);
    };
    const handleReset = () => {
        setAccount({});
        setPscMember('');
        setAccount({});
        setTaken('no');
    };

	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{ marginTop:"7%", marginBottom: '2%' }}><Link to="/">🔙</Link></span>
            <h2 class="major">Browser</h2>
            <section style={{width:'100%'}}>
                <p>Search for a self-sovereign identity by username and domain:</p>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Domain</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>.mapu</td>
                                <td>Access any <Link to="/mapu">.Mapu</Link> profile or create yours!</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <form onChange={ handleReset } onSubmit= { e => e.preventDefault() }>
                    <div class="fields">
                        <div class="field half">
                            <label>Username</label>
                            <input type="text" onChange={ handleUsername } />
                        </div>
                        <div class="field half">
                            <label for="domain">Domain</label>
                            <select onChange={ handleDomain }>
                                <option value="mapu">.mapu</option>
                            </select>
                        </div>
                    </div>
                    <ul class="actions">
                        <li><input class="button primary" type="button" value="Search"
                                onClick={ async() => {
                                    const arweave = Arweave.init({
                                        host: 'arweave.net',
                                        port: 443,
                                        protocol: 'https'
                                    });
                                    const ayjaState = await SmartWeave.readContract(arweave, ayjaPstStateID);
                                    const pscMember = await selectWeightedAyjaHolder(ayjaState.accounts).catch( _err => { return "3SW6cE4cTiHMPO0z9ZszgfzjbsgZaMefpNmIy4dFhl0" })
                                    setPscMember(pscMember);

                                    if( ayjaState.accounts[username] !== undefined ) {
                                        setAccount(ayjaState.accounts[username]);
                                        setTaken('yes');
                                    };
                                }}
                                />
                        </li>
                        <li><input type="reset" value="Reset" onClick={ handleReset } /></li>
                    </ul>
                </form>
            </section>
            <section style={{width:'100%'}}>
                { pscMember !== '' && <ConnectWallet taken={ taken } username={ username } domain={ domain } account={ account } pscMember={ pscMember }/>}
            </section>
        </div>
	);
}

export default withRouter(Browser);
