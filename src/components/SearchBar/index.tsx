import React, { useState } from 'react';
import {
    SMART_CONTRACTS_URLS,
    VALID_SMART_CONTRACTS
} from '../../constants/tyron';
import { DOMAINS } from '../../constants/domains';
import { fetchAddr, isValidUsername, resolve } from './utils';
import { PublicIdentity, BuyNFTUsername, DIDxWallet } from '../index';
import styles from './styles.module.scss';
import { updateUser } from 'src/store/user';
import { useStore } from 'effector-react';
import { updateContract } from 'src/store/contract';
import { updateDid } from 'src/store/did-doc';
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

    const spinner = (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
    );

    const handleSearchBar = ({
        currentTarget: { value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setExists(false);
        setRegister(false);
        
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
            legend: 'access DID wallet'
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
        if (isValidUsername(username) || username === 'tyron' || username === 'init') {
            await fetchAddr({ username, domain })
                .then(async (addr) => {
                    setExists(true);
                    await resolve({ addr })
                    .then( result => {
                        const controller = (result.controller).toLowerCase();
                        updateContract({
                            addr: addr,
                            controller: controller,
                            status: result.status
                        });
                        if ( controller === zil_address?.base16.toLowerCase()) {
                            updateIsAdmin({
                                verified: true,
                                hideWallet: true,
                                legend: 'access DID wallet'
                            });
                        } else {
                            updateIsAdmin({
                                verified: false,
                                hideWallet: true,
                                legend: 'access DID wallet'
                            });
                        }
                        updateDid(result.doc)
                    }).catch( err => { throw err })                 
                })
                .catch(() => {
                    if( domain === 'did' ){ setRegister(true) } else {
                        setError(`uninitialized domain. You can create it in the NFT Username DNS at ${username}.did!`)
                    }
                });
        } else {
            setError('a username must be between 7 and 15 characters.');
        }
    };

    const didDomain = async () => {
        await resolveUser();
        if( exists === true ){
            const addr = await fetchAddr({ username, domain: 'did' });
            const doc = await resolve({ addr });
            const controller = doc.controller;
            if ( controller.toLowerCase() === zil_address?.base16.toLowerCase()) {
                updateIsAdmin({
                    verified: true,
                    hideWallet: true,
                    legend: 'access DID wallet'
                });
            } else {
                updateIsAdmin({
                    verified: false,
                    hideWallet: true,
                    legend: 'access DID wallet'
                });
            }
        }
    }

    const getResults = async () => {
        setLoading(true);
        setError('');
        setExists(false);
        setRegister(false);
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
            case DOMAINS.DID: await resolveUser();
                break;
            case DOMAINS.DEX: await didDomain();
            break;
            case DOMAINS.STAKE: await didDomain();
                break;
            case DOMAINS.NFT: await didDomain();
                break;
            case DOMAINS.COOP: await didDomain();
                break;
            default: setError('valid domains are did, dex, stake, nft, coop & tyron.');
        }
        setLoading(false);
    };

    return (
        <div className={ styles.container }>
            <label htmlFor="">
                Type a username to access their public identity
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
                    <PublicIdentity />
            }
            {
                is_admin?.verified && !is_admin.hideWallet &&
                    <DIDxWallet />
            }
        </div>
    );
}
// @todo research/decide which router (consider working with next.js)
export default SearchBar;
