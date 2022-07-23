import React, { useEffect } from 'react'
import { useStore } from 'effector-react'
import { $doc } from '../../../../src/store/did-doc'
import styles from './styles.module.scss'
import { $net } from '../../../../src/store/wallet-network'
import { $loadingDoc } from '../../../../src/store/loading'
import fetchDoc from '../../../../src/hooks/fetchDoc'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../src/hooks/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'

function Component() {
    const { t } = useTranslation()
    const net = useStore($net)
    const loadingDoc = useStore($loadingDoc)
    const resolvedInfo = useSelector(
        (state: RootState) => state.modal.resolvedInfo
    )
    const username = resolvedInfo.name
    const doc = useStore($doc)?.doc
    let exists = false

    const { fetch } = fetchDoc()
    const { navigate } = routerHook()

    useEffect(() => {
        fetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const spinner = (
        <i
            style={{ color: '#ffff32' }}
            className="fa fa-lg fa-spin fa-circle-notch"
            aria-hidden="true"
        ></i>
    )

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
            }}
        >
            {loadingDoc ? (
                spinner
            ) : (
                <>
                    {doc !== null &&
                        doc?.map((res: any) => {
                            if (res[0] === 'Decentralized identifier') {
                                const did = res[1] as string
                                switch (did) {
                                    case 'Not activated yet.':
                                        return (
                                            <div
                                                key={res}
                                                className={styles.docInfo}
                                            >
                                                <p className={styles.didkey}>
                                                    This DID has not been
                                                    created by {username} yet.
                                                </p>
                                            </div>
                                        )
                                    default: {
                                        exists = true
                                        /* let's use the logged-in network instead of:
                    let network = did.substring(14, 18);
                    switch (network) {
                      case "test":
                        network = "testnet";
                        break;
                      case "main":
                        network = "mainnet";
                        break;
                    }
                    */
                                        const addr = did.substring(19)
                                        return (
                                            <p
                                                key={res}
                                                className={styles.docInfo}
                                            >
                                                <span
                                                    className={styles.blockHead}
                                                >
                                                    ID
                                                </span>
                                                <span className={styles.did}>
                                                    <a
                                                        href={`https://devex.zilliqa.com/address/${addr}?network=https%3A%2F%2F${net === 'mainnet'
                                                            ? ''
                                                            : 'dev-'
                                                            }api.zilliqa.com`}
                                                        rel="noreferrer"
                                                        target="_blank"
                                                    >
                                                        {did.substring(0, 19)}
                                                        {addr}
                                                    </a>
                                                </span>
                                            </p>
                                        )
                                    }
                                }
                            }
                        })}
                    {exists && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: '7%',
                            }}
                        >
                            <div
                                onClick={() => {
                                    navigate(`/${username}/did/doc/keys`)
                                }}
                                className={styles.flipCard}
                            >
                                <div className={styles.flipCardInner}>
                                    <div className={styles.flipCardFront}>
                                        <h5 className={styles.cardTitle3}>
                                            {t('KEYS')}
                                        </h5>
                                    </div>
                                    <div className={styles.flipCardBack}>
                                        <p className={styles.cardTitle2}>
                                            {t('VERIFICATION METHODS')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div
                                onClick={() => {
                                    navigate(`/${username}/did/doc/services`)
                                }}
                                className={styles.flipCard}
                            >
                                <div className={styles.flipCardInner}>
                                    <div className={styles.flipCardFront}>
                                        <h5 className={styles.cardTitle3}>
                                            {t('SOCIAL TREE')}
                                        </h5>
                                    </div>
                                    <div className={styles.flipCardBack}>
                                        <p className={styles.cardTitle2}>
                                            {t('DID SERVICES')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
