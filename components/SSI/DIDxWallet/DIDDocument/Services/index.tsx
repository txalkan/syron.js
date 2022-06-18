import React, { useState } from 'react'
import { useStore } from 'effector-react'
import { $doc } from '../../../../../src/store/did-doc'
import { $loading } from '../../../../../src/store/loading'
import styles from './styles.module.scss'

function Component() {
    const doc = useStore($doc)?.doc
    const loading = useStore($loading)

    const [serviceAvailable, setServiceAvaliable] = useState(false)

    return (
        <div className={styles.wrapper}>
            {doc !== null &&
                doc?.map((res: any) => {
                    if (res[0] === 'DID services') {
                        if (!serviceAvailable) {
                            setServiceAvaliable(true)
                        }
                        return (
                            <div key={res}>
                                {res[1].map((element: any) => {
                                    console.log(element)
                                    let https = 'https://'
                                    switch (element[0]) {
                                        case 'bitcoin':
                                            https =
                                                'https://blockchain.coinmarketcap.com/address/bitcoin/'
                                            break
                                        case 'twitter':
                                            https = 'https://twitter.com/'
                                            break
                                        case 'github':
                                            https = 'https://github.com/'
                                            break

                                        // @todo-x to get deprecated
                                        case 'phonenumber':
                                            return (
                                                <div className={styles.docInfo}>
                                                    <p
                                                        key={element}
                                                        className={styles.did}
                                                    >
                                                        <span
                                                            className={
                                                                styles.id
                                                            }
                                                        >
                                                            phone number{' '}
                                                        </span>
                                                        {element[1][1]}
                                                    </p>
                                                </div>
                                            )
                                    }
                                    let link = ''
                                    if (element[1][1] !== undefined) {
                                        const prefix = element[1][1].slice(0, 8)
                                        if (prefix === https) {
                                            link = element[1][1]
                                        } else {
                                            link = https + element[1][1]
                                        }
                                    }
                                    return (
                                        <div
                                            key={element}
                                            onClick={() =>
                                                window.open(`${link}`)
                                            }
                                            className={styles.docInfo}
                                        >
                                            <p
                                                key={element}
                                                className={styles.did}
                                            >
                                                {element[0]}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    }
                })}
            {!serviceAvailable && (
                <>
                    {loading ? (
                        <div>
                            <i
                                className="fa fa-lg fa-spin fa-circle-notch"
                                aria-hidden="true"
                            ></i>
                        </div>
                    ) : (
                        <code>No data yet.</code>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
