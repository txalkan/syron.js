import React, { useState } from 'react';

import {
  SMART_CONTRACTS_URLS,
  VALID_SMART_CONTRACTS
} from '../../constants/tyron';
import { DOMAINS } from '../../constants/domains';

import { fetchAddr, resolve } from './utils';
import styles from './styles.module.scss';
import CreateAccount from '../createAccount';

const empty_doc: any[] = [];

function SearchBar() {
  const [value, setValue] = useState('');
  const [username, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [register, setRegister] = useState('')
  const [error, setError] = useState('');
  const [did, setDid] = useState(empty_doc);
  const [deploy, setDeploy] = useState('');

  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === 'Enter') {
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
              await fetchAddr({ username, domain })
              .then( async addr => {
                const did_doc = await resolve({ addr });
                setDid(did_doc);
              }).catch( () => setRegister('coop'))
            })();
          }
          break;
          case DOMAINS.DID:
            {
              (async () => {
                await fetchAddr({ username, domain })
                .then( async addr => {
                  const did_doc = await resolve({ addr });
                  setDid(did_doc);
                }).catch( () => setRegister('xwallet'))
              })();
            }
            break;
        default:
          setError('Invalid domain');
      }
    }
  };

  const handleSearchBar = ({
    currentTarget: { value }
  }: React.ChangeEvent<HTMLInputElement>) => {
    setDid(empty_doc);
    setRegister('');
    setValue(value);
    if (value) {
      const [name = '', domain = ''] = value.split('.');
      setName(name);
      setDomain(domain);
    } else {
      setError('');
    }
  };

  return (
    <div className={styles.container}>
		<input
			type='text'
			className={styles.searchBar}
			onKeyPress={handleOnKeyPress}
			onChange={handleSearchBar}
			value={value}
		/>
		<p className={styles.errorMsg}>{error}</p>
		{did &&
			<>
			<div>
				{ did.map((res: any) => {
				return(
					<div key={res} className={styles.did}>
					<p className={styles.did}>{res[0]}</p>
					{ res[1].map((element: any) => {
						return(
							<p key={element}className={styles.did}>{element}</p>
						);
						})}
					</div>
				);
				})}
				</div> 
			</>
		}
		{register === 'coop' &&
			<>
				<p>Register this NFT cooperative project</p>
			</>
		}
		{register === 'xwallet' &&
			<>
				<button
				type="button"
				onClick={ () => setDeploy("true")}
				>
					<p>Register this xWallet</p>
				</button>
			</>
		}
		{deploy === 'true' &&
			<CreateAccount
			{...{
                username,
                domain
            }}
			/>
		}
    </div>
  );
}

export default SearchBar;
