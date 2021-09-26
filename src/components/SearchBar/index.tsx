import React, { useState } from 'react';
import {
    SMART_CONTRACTS_URLS,
    VALID_SMART_CONTRACTS
} from '../../constants/tyron';
import { DOMAINS } from '../../constants/domains';
import { fetchAddr, resolve } from './utils';
import { PublicPortal, BuyUsernameNFT } from '../index';
import styles from './styles.module.scss';
import {
    BrowserRouter as Router,
    withRouter
} from 'react-router-dom';

const empty_doc: any[] = [];

function SearchBar() {
    const [value, setValue] = useState('');
    const [username, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [register, setRegister] = useState(false);
    const [error, setError] = useState('');
    const [did, setDid] = useState(empty_doc);
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
        // @TODO: Handle other domains
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
                            .then(async (addr) => {
                                const did_doc = await resolve({ addr });
                                setDid(did_doc);
                            })
                            .catch(() => setRegister(true));
                        setLoading(false);
                    })();
                }
                break;
            case DOMAINS.DID:
                {
                    (async () => {
                        setLoading(true);
                        await fetchAddr({ username, domain })
                            .then(async (addr) => {
                                const did_doc = await resolve({ addr });
                                setDid(did_doc);
                            })
                            .catch(() => setRegister(true));
                        setLoading(false);
                    })();
                }
                break;
            default:
                setError('Invalid SSI web portal');
        }
    };

    return (
        <div className={styles.container}>
            <label htmlFor="">Type a username to access their SSI public portal.</label>
            <div className={styles.searchDiv}>
                <input
                    type="text"
                    className={styles.searchBar}
                    onChange={handleSearchBar}
                    onKeyPress={handleOnKeyPress}
                    value={value}
                    placeholder='Such as tyron.coop &#9889; If available, you can buy it!'
                    autoFocus
                />
                <div>
                    <button onClick={getResults} className={styles.searchBtn}>
                        {loading ? spinner : <i className="fa fa-search"></i>}
                    </button>
                </div>
            </div>
            <p className={styles.errorMsg}>{error}</p>
            {did !== empty_doc && (
                <>
                    <Router>
                        <PublicPortal
                            {...{
                                username,
                                domain,
                                did
                            }}
                        />
                    </Router>
                </>
            )}
            {register && (
                <>
                    <Router>
                        <BuyUsernameNFT/>
                    </Router>
                </>
            )}
        </div>
    );
}

export default withRouter(SearchBar);
