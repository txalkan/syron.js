import * as tyron from 'tyron';
import React, { useState } from 'react';
import {
    SMART_CONTRACTS_URLS,
    VALID_SMART_CONTRACTS
} from '../../constants/tyron';
import { DOMAINS } from '../../constants/domains';
import { fetchAddr, isValidUsername, resolve } from './utils';
import { PublicIdentity, BuyNFTUsername, SSIWallet } from '../index';
import styles from './styles.module.scss';
import { updateUser } from 'src/store/user';
import { useStore } from 'effector-react';
import { updateContract } from 'src/store/contract';
import { updateDid } from 'src/store/did-doc';
import { $connected } from 'src/store/connected';
import { updateLoggedIn } from 'src/store/loggedIn';
import { updateDonation } from 'src/store/donation';
import { $wallet } from 'src/store/wallet';
import { $isAdmin, updateIsAdmin } from 'src/store/admin';

function SearchBar() {
    const zil_address = useStore($wallet);
    const is_admin = useStore($isAdmin);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [input, setInput] = useState('');

    const [register, setRegister] = useState(false);

    const [username, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [exists, setExists] = useState(false);

    const [created, setCreated] = useState(false);

    const spinner = (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
    );

    const handleSearchBar = ({
        currentTarget: { value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setExists(false);
        setRegister(false);
        setCreated(false);

        setInput(value.toLowerCase());
        const [name = '', domain = ''] = value.split('.');
        setName(name.toLowerCase());
        setDomain(domain.toLowerCase());
        updateLoggedIn(null);
        updateDonation(null);
        updateContract(null);
        updateIsAdmin({
            verified: false,
            hideWallet: true,
            legend: 'access SSI wallet'
        })
    };

    const handleOnKeyPress = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            getResults();
        }
    };

    const resolveUser = async () => {
        updateUser({
            nft: username,
            domain: domain
        });
        if (isValidUsername(username) || username === 'tyron') {
            await fetchAddr({ username, domain })
                .then(async (addr) => {
                    const init = new tyron.ZilliqaInit.default(tyron.DidScheme.NetworkNamespace.Testnet);
                    const state = await init.API.blockchain.getSmartContractState(addr)
                    const controller = state.result.controller;
                    updateContract({
                        addr: addr,
                        controller: controller,
                    });
                    if ( controller.toLowerCase() === zil_address?.base16.toLowerCase()) {
                        updateIsAdmin({
                            verified: true,
                            hideWallet: true,
                            legend: 'access SSI wallet'
                        });
                    } else {
                        updateIsAdmin({
                            verified: false,
                            hideWallet: true,
                            legend: 'access SSI wallet'
                        });
                    }
                    //alert(JSON.stringify(state));
                    setExists(true);
                    /**
                    const doc = await resolve({ addr })
                        .then( result => {
                            setCreated(true);
                            alert("1")
                            const controller = result.controller;
                            updateContract({
                                addr: addr,
                                controller: controller,
                            });
                            alert(controller);
                            const zil_address = useStore($wallet);
                            if ( controller.toLowerCase() === zil_address?.base16.toLowerCase()) {
                                alert("si")
                                updateIsAdmin({
                                    verified: true
                                });
                            } else {
                                updateIsAdmin({
                                    verified: false
                                });
                            }
                            return result.doc
                        })
                        .catch(() => {
                            setError(`address ${addr} has no DID Document.`)
                            return null
                        });
                    updateDid(doc);
                    */
                })
                .catch(() => {
                    if( domain === 'did' ){ setRegister(true) } else {
                        setError(`uninitialized identity. First, buy the ${username}.did NFT Username.`)
                    }
                });
        } else {
            setError('a username must be between 7 and 15 characters.');
        }
    };

    const getResults = async () => {
        setLoading(true);
        setError('');
        setExists(false);
        setRegister(false);
        setCreated(false);
        switch (domain) {
            case DOMAINS.TYRON:
                if (VALID_SMART_CONTRACTS.includes(username))
                    window.open(
                        SMART_CONTRACTS_URLS[
                        username as unknown as keyof typeof SMART_CONTRACTS_URLS
                        ]
                    );
                else setError('invalid smart contract');
                break;
            case DOMAINS.COOP: await resolveUser();
                break;
            case DOMAINS.DID: await resolveUser();
                break;
            default: setError('valid domains are .did & .coop');
        }
        setLoading(false);
    };

    return (
        <div className={ styles.container }>
            <label htmlFor="">
                Type a username to access their SSI public identity
            </label>
            <div className={styles.searchDiv}>
                <input
                    type="text"
                    className={styles.searchBar}
                    onChange={handleSearchBar}
                    onKeyPress={handleOnKeyPress}
                    value={input}
                    placeholder="If the NFT Username is available, you can buy it!"
                    autoFocus
                />
                <div>
                    <button onClick={getResults} className={styles.searchBtn}>
                        {loading ? spinner : <i className="fa fa-search"></i>}
                    </button>
                </div>
            </div>
            {
                error !== '' &&
                <code>Error: {error}</code>
            }
            {
                register &&
                <BuyNFTUsername />

            }
            {
                exists && is_admin?.hideWallet &&
                <PublicIdentity
                    {...{
                        doc: created
                    }}
                />
            }
            {
                is_admin?.verified && !is_admin.hideWallet &&
                <SSIWallet />
            }
        </div>
    );
}
// @todo research/decide which router (consider working with next.js) & explain use of <>
export default SearchBar;
