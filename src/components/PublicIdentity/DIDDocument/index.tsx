import { useStore } from 'effector-react';
import React from 'react';
import { $doc } from '../../../store/did-doc';
import styles from './styles.module.scss';

function Component() {
    const doc = useStore($doc)?.doc;

    return (
        <div style={{ marginTop: '14%' }}>
            {
                doc !== null &&
                doc?.map((res: any) => {
                    if (res[0] === 'Decentralized identifier') {
                        const did = res[1] as string;
                        switch (did) {
                            case 'not activated yet.':
                                return (
                                    <div key={res} className={styles.docInfo}>
                                        <h3 className={styles.blockHead}>
                                            {res[0]}
                                        </h3>
                                        <p className={styles.didkey}>
                                            {did}
                                        </p>
                                    </div>
                                )
                            default: {
                                let network = did.substring(14, 18);
                                switch (network) {
                                    case 'test':
                                        network = 'testnet'
                                        break;
                                    case 'main':
                                        network = 'mainnet'
                                        break;
                                }
                                const addr = did.substring(19);
                                return (
                                    <div key={res} className={styles.docInfo}>
                                        <h3 className={styles.blockHead}>
                                            {res[0]}
                                        </h3>
                                        <p className={styles.did}>
                                            {did.substring(0, 19)}
                                            <a
                                                style={{ color: 'yellow' }}
                                                href={`https://viewblock.io/zilliqa/address/${addr}?network=${network}`}
                                                rel="noreferrer" target="_blank"
                                            >
                                                {addr}
                                            </a>
                                        </p>
                                    </div>
                                )

                            }
                        }
                    } else if (res[0] === 'DID services') {
                        return (
                            <div key={res} className={styles.docInfo}>
                                <h3 className={styles.blockHead}>
                                    {res[0]}
                                </h3>
                                {res[1].map((element: any) => {
                                    let https = 'https://'
                                    switch (element[0]) {
                                        case 'bitcoin':
                                            https = 'https://www.blockchain.com/btc/address/'
                                            break;
                                        case 'twitter':
                                            https = 'https://twitter.com/'
                                            break;
                                        case 'github':
                                            https = 'https://github.com/'
                                            break;
                                        case 'phonenumber':
                                            return (
                                                <p
                                                    key={element}
                                                    className={styles.did}
                                                >
                                                    <span className={styles.id}>
                                                        phone number{' '}
                                                    </span>
                                                    {element[1]}
                                                </p>
                                            );
                                    }
                                    let link;
                                    const prefix = element[1].substring(0, 8);
                                    if (prefix === https) {
                                        link = element[1]
                                    } else {
                                        link = https + element[1];
                                    }
                                    return (
                                        <p
                                            key={element}
                                            className={styles.did}
                                        >
                                            <a
                                                href={`${link}`}
                                                rel="noreferrer" target="_blank"
                                            >
                                                {element[0]}
                                            </a>
                                        </p>
                                    );
                                })}
                            </div>
                        )
                    } else {
                        return (
                            <div key={res} className={styles.docInfo}>
                                <h3 className={styles.blockHead}>
                                    {res[0]}
                                </h3>
                                {res[1].map((element: any) => {
                                    return (//@todo copy to clipboard
                                        <p
                                            key={element}
                                            className={styles.didkey}
                                        >
                                            {element}
                                        </p>
                                    );
                                })}
                            </div>
                        );
                    }
                })
            }
        </div>
    );
}

export default Component
