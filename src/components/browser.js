import React, { useState } from "react";
import { Link, withRouter } from "react-router-dom";
import Arweave from 'arweave';
import * as SmartWeave from 'smartweave';
import { ayjaPstID, Profile, CreateAccount } from ".";

function Browser() {
    const[username, setUsername] = useState('');
    const[domain, setDomain] = useState('mapu');
    const[account, setAccount] = useState({ username: '', domain: '', registered: ''});
    
    const handleUsername = event => {
        event.preventDefault();
        setUsername(event.target.value);
    };
    const handleDomain = event => {
        setDomain(event.target.value);
    };
    const handleReset = () => {
        setAccount({ username: '', domain: '', registered: ''});
    };

	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{marginBottom: '2%'}}><Link to="/">🔙</Link></span>
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
                                    switch (domain) {
                                        case 'mapu':
                                            const arweave = Arweave.init({
                                                host: 'arweave.net',
                                                port: 443,
                                                protocol: 'https'
                                            });
                                            const ayjaState = await SmartWeave.readContract(arweave, ayjaPstID);
                                            if(ayjaState.accounts[username] === undefined){
                                                setAccount({
                                                    username: username,
                                                    domain: domain,
                                                    registered: undefined
                                                });
                                            } else {
                                                setAccount({
                                                    username: username,
                                                    domain: domain,
                                                    registered: ayjaState.accounts[username]
                                                });
                                            }
                                            break;
                                    }
                                }}
                                />
                        </li>
                        <li><input type="reset" value="Reset" onClick={ handleReset } /></li>
                    </ul>
                </form>
            </section>
            <section>
                { account.registered === undefined && account.username !== '' && <CreateAccount account={ account }/> }
                { account.registered !== undefined && account.username !== '' && <Profile account={ account }/> }
            </section>
        </div>
	);
}

export default withRouter(Browser);
