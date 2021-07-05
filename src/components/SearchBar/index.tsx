import React, { useState } from 'react';
import {
    SMART_CONTRACTS_URLS,
    VALID_SMART_CONTRACTS
} from '../../constants/tyron';
import { DOMAINS } from '../../constants/domains';
import { fetchAddr, resolve } from './utils';
import styles from './styles.module.scss';
import CreateAccount from '../CreateAccount';
import { PublicProfile } from '../index';

const empty_doc: any[] = [];

function SearchBar() {
    const [value, setValue] = useState('');
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [register, setRegister] = useState('');
    const [error, setError] = useState('');
    const [did, setDid] = useState(empty_doc);
    const [loading, setLoading] = useState(false);

    const spinner = (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
    );

    const getResults = () => {
        // @TODO: Handle other domains
        switch (domain) {
            case DOMAINS.TYRON:
                if (VALID_SMART_CONTRACTS.includes(name))
                    window.open(
                        SMART_CONTRACTS_URLS[
                            name as unknown as keyof typeof SMART_CONTRACTS_URLS
                        ]
                    );
                else setError('Invalid smart contract');
                break;
            case DOMAINS.COOP:
                {
                    (async () => {
                        setLoading(true);
                        await fetchAddr({ username: name, domain })
                            .then(async (addr) => {
                                const did_doc = await resolve({ addr });
                                setLoading(false);
                                setDid(did_doc);
                            })
                            .catch(() => setRegister('coop'));
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
        setValue(value);
        if (value) {
            const [name = '', domain = ''] = value.split('.');
            setName(name);
            setDomain(domain);
        }
    };

    return (
        <div className={styles.container}>
            <label htmlFor="">Enter Username</label>
            <div className={styles.searchDiv}>
                <input
                    type="text"
                    className={styles.searchBar}
                    onKeyPress={handleOnKeyPress}
                    onChange={handleSearchBar}
                    value={value}
                    placeholder="Example - tyron.did"
                    autoFocus
                />
                <div>
                    <button onClick={getResults} className={styles.searchBtn}>
                        {loading ? spinner : <i className="fa fa-search"></i>}
                    </button>
                </div>
            </div>
            <p className={styles.errorMsg}>{error}</p>
            {register === 'coop' && (
                <>
                    <p>Register this NFT cooperative project</p>
                </>
            )}
            {did && (
                <>
                    <div>
                        {did.map((res: any) => {
                            return (
                                <div key={res} className={styles.docInfo}>
                                    <h3 className={styles.blockHead}>
                                        {res[0]}
                                    </h3>
                                    {res[1].map((element: any) => {
                                        return (
                                            <p
                                                key={element}
                                                className={styles.did}
                                            >
                                                {element}
                                            </p>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default SearchBar;
