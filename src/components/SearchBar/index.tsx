import React, { useState } from 'react';
import {
    SMART_CONTRACTS_URLS,
    VALID_SMART_CONTRACTS
} from '../../constants/tyron';
import { DOMAINS } from '../../constants/domains';
import { fetchAddr, isValidUsername, resolve } from './utils';
import { PublicIdentity, BuyNFTUsername, SSIWallet } from '../index';
import styles from './styles.module.scss';
import {
    BrowserRouter as Router,
    withRouter
} from 'react-router-dom';
import { updateUsername } from 'src/store/username';
import { updateDid } from 'src/store/did-doc';
import { $wallet } from 'src/store/wallet';

const empty_doc: any[] = [];

function SearchBar() {
    const address = $wallet.getState();
    const [value, setValue] = useState('');
    const [username, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [register, setRegister] = useState(false);
    const [error, setError] = useState('');
    const [did, setDid] = useState(empty_doc);
    const [wallet, setWallet] = useState(false);
    const [loading, setLoading] = useState(false);

    const spinner = (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
    );

    const handleSearchBar = ({
        currentTarget: { value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setDid(empty_doc);
        setRegister(false);

        setValue(value.toLowerCase());
        if (value) {
            const [name = '', domain = ''] = value.split('.');
            setName(name.toLowerCase());
            setDomain(domain.toLowerCase());
        }
    };

    const handleOnKeyPress = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            getResults();
        }
    };

    const getResults = () => {
        let did_doc: any = [];
        switch (domain) {
            case DOMAINS.TYRON:
                if (VALID_SMART_CONTRACTS.includes(username))
                    window.open(
                        SMART_CONTRACTS_URLS[
                            username as unknown as keyof typeof SMART_CONTRACTS_URLS
                        ]
                    );
                else setError('Invalid smart contract');
                break;
            case DOMAINS.COOP:
                {
                    (async () => {
                        setLoading(true);
                        await fetchAddr({ username: username, domain })
                            .then(async (addr) => { // todo addr admin not contract
                                did_doc = await resolve({ addr });
                                if( addr === address?.base16 ){
                                    setWallet(true)
                                }
                                alert(addr)
                                setDid(did_doc);
                            })
                            .catch(() => setRegister(true));
                        setLoading(false);
                        updateUsername(
                            {
                                nft: username,
                                domain: domain
                            }
                        );
                        updateDid(did_doc);
                    })();
                }
                break;
            case DOMAINS.DID:
                {
                    (async () => {
                        setLoading(true);
                        if (isValidUsername(username)) {
                            await fetchAddr({ username, domain })
                                .then(async (addr) => {
                                    did_doc = await resolve({ addr });
                                    setDid(did_doc);
                                })
                                .catch(() => setRegister(true));
                            setLoading(false);
                            updateUsername(
                                {
                                    nft: username,
                                    domain: domain
                                }
                            );
                            updateDid(did_doc);
                        } else {
                            setError('Invalid username. It must be between 7 and 15 characters.');
                            setLoading(false);
                        }
                    })();
                }
                break;
            default:
                setError('Invalid SSI web portal. It must be a username.did');
        }
    };

    return (
        <div className={styles.container}>
            <label htmlFor="">Type a username to access their SSI public identity</label>
            <div className={styles.searchDiv}>
                <input
                    type="text"
                    className={styles.searchBar}
                    onChange={handleSearchBar}
                    onKeyPress={handleOnKeyPress}
                    value={value}
                    placeholder='If the NFT username is available, you can buy it!'
                    autoFocus
                />
                <div>
                    <button onClick={getResults} className={styles.searchBtn}>
                        {loading ? spinner : <i className="fa fa-search"></i>}
                    </button>
                </div>
            </div>
            <p className={styles.errorMsg}>{error}</p>
            {
                did !== empty_doc && !wallet && (
                    <>
                        <Router>
                            <PublicIdentity />
                        </Router>
                    </>
                )
            }
            {
                wallet && <SSIWallet />
            }
            {
                register && <BuyNFTUsername/>
            }
        </div>
    );
}
// todo which router (next) & <>
export default withRouter(SearchBar);
