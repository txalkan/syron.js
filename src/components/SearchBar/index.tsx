import React, { useState } from 'react';
import {
    SMART_CONTRACTS_URLS,
    VALID_SMART_CONTRACTS
} from '../../constants/tyron';
import { DOMAINS } from '../../constants/domains';
import { fetchAddr, isValidUsername, resolve } from './utils';
import { PublicIdentity, BuyNFTUsername, SSIWallet } from '../index';
import styles from './styles.module.scss';
import { updateUsername } from 'src/store/username';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $wallet } from 'src/store/wallet';
import { useStore } from 'effector-react';
import { $contract, updateContract } from 'src/store/contract';
import { updateDid } from 'src/store/did-doc';

const zilpay = new ZilPayBase();

function SearchBar() {
    const admin = useStore($contract);
    const address = useStore($wallet);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [register, setRegister] = useState(false);
    
    const [value, setValue] = useState('');
    const [username, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [user, setUser] = useState(false);
    
    const [created, setCreated] = useState(false);
    
    const [showWallet, setShowWallet] = useState(false);
    const [displayLegend, setDisplay] = useState('Access SSI Wallet');
    
    const spinner = (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
    );

    const handleSearchBar = ({
        currentTarget: { value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setUser(false);
        setRegister(false);
        setCreated(false);
        setShowWallet(false);
        setDisplay('Access SSI Wallet');

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
            case DOMAINS.COOP: {
                (async () => {
                    setLoading(true);
                    updateUsername({
                        nft: username,
                        domain: domain
                    });
                    await fetchAddr({ username: username, domain })
                        .then(async (addr) => {
                            setUser(true);    
                            const this_admin = await zilpay.getSubState(
                                addr,
                                'admin_'
                            );
                            updateContract({
                                base16: this_admin,
                                addr: addr,
                                isAdmin: this_admin === address?.base16.toLowerCase()
                            });
                            const doc = await resolve({ addr })
                            .then( did_doc => {
                                setCreated(true)
                                return did_doc
                            })
                            .catch(() => {
                                return null
                            });
                            updateDid(doc);
                        })
                        .catch(() => setRegister(true));
                    setLoading(false);                    
                })();
            }
            break;
            case DOMAINS.DID: {
                (async () => {
                    setLoading(true);
                    if (isValidUsername(username)) {
                        alert("@todo")
                    } else {
                        setError(
                            'Invalid username. It must be between 7 and 15 characters.'
                        );
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
            <label htmlFor="">
                Type a username to access their SSI public identity
            </label>
            <div className={styles.searchDiv}>
                <input
                    type="text"
                    className={styles.searchBar}
                    onChange={handleSearchBar}
                    onKeyPress={handleOnKeyPress}
                    value={value}
                    placeholder="If the NFT username is available, you can buy it!"
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
                register &&
                    <BuyNFTUsername />

            }
            {
                user &&
                    <PublicIdentity
                        {...{
                            doc: created
                        }}
                    />
            }
            {      
                user && !showWallet && address !== null && admin?.isAdmin &&
                    <div style={{ marginTop: '9%' }}>
                    <button
                        type="button"
                        className={styles.button}
                        onClick={() => { 
                            setShowWallet(true);
                            setDisplay('Hide SSI Wallet')
                        }}
                    >
                        <p className={styles.buttonShow}>
                            {displayLegend}
                        </p>
                    </button>
                </div>
            }
            {      
                showWallet && address !== null &&
                    <div style={{ marginTop: '7%' }}>
                    <button
                        type="button"
                        className={styles.button}
                        onClick={() => { 
                            setShowWallet(false);
                            setDisplay('Access SSI Wallet')
                        }}
                    >
                        <p className={styles.buttonHide}>
                            {displayLegend}
                        </p>
                    </button>
                </div>
            }
            {
                showWallet && address !== null &&
                    <SSIWallet 
                        {...{
                            name: username,
                            domain
                        }}
                    />
            }
        </div>
    );
}
// @todo research/decide which router (consider working with next.js) & explain use of <>
export default SearchBar;
