import React, { useState } from 'react';
import {
    SMART_CONTRACTS_URLS,
    VALID_SMART_CONTRACTS
} from '../../constants/tyron';
import { DOMAINS } from '../../constants/domains';
import { fetchAddr, resolve } from './utils';
import { PublicProfile, CreateAccount } from '../index';
import styles from './styles.module.scss';

const empty_doc: any[] = [];

function SearchBar() {
    const [value, setValue] = useState('');
    const [username, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [register, setRegister] = useState('');
    const [error, setError] = useState('');
    const [did, setDid] = useState(empty_doc);
    const [loading, setLoading] = useState(false);
    const [deploy, setDeploy] = useState('');

    const spinner = (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
    );

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
                            .catch(() => setRegister('true'));
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
                            .catch(() => setRegister('true'));
                        setLoading(false);
                                
                    })();
                }
                break;
            default:
                setError('Invalid domain');
        }
    };

    const handleOnKeyPress = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            getResults();
        }
    };

    const handleSearchBar = ({
        currentTarget: { value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setDid(empty_doc);
        setRegister('');
        setDeploy('');
        setValue(value);
        if (value) {
            const [name = '', domain = ''] = value.split('.');
            setName(name);
            setDomain(domain);
        }
    };

    return (
        <div className={styles.container}>
            <label htmlFor="">Enter SSI domain name</label>
            <div className={styles.searchDiv}>
                <input
                    type="text"
                    className={styles.searchBar}
                    onKeyPress={handleOnKeyPress}
                    onChange={handleSearchBar}
                    value={value}
                    placeholder="For example: tyron.coop"
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
                <PublicProfile
                    {...{
                        username,
                        domain,
                        did
                    }}
                />
            )}
            {register === 'true' && deploy === '' && (
                <>
                <div style={{ marginTop: '10px' }}>
                    <button type="button" onClick={() => setDeploy('true')} className={'button primary'}>
                        Register {username}.{domain}
                    </button>
                </div>
                </>
            )}
            {deploy === 'true' && (
                <CreateAccount
                    {...{
                        username,
                        domain
                    }}
                />
            )}
        </div>
    );
}

export default SearchBar;
