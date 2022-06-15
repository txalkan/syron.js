import React, { useState } from 'react'
import { useStore } from 'effector-react'
import Image from 'next/image'
import { $doc } from '../../../../../src/store/did-doc'
import { $loading } from '../../../../../src/store/loading'
import styles from './styles.module.scss'
import shareIco from '../../../../../src/assets/icons/share.svg'
import discordIco from '../../../../../src/assets/icons/discord_icon.svg'
import facebookIco from '../../../../../src/assets/icons/facebook_icon.svg'
import githubIco from '../../../../../src/assets/icons/github_icon.svg'
import instagramIco from '../../../../../src/assets/icons/instagram_icon.svg'
import twitterIco from '../../../../../src/assets/icons/twitter_icon.svg'
import othersocialIco from '../../../../../src/assets/icons/othersocial_icon.svg'

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
                                    let https = 'https://'
                                    let socialIco = othersocialIco
                                    switch (element[0]) {
                                        case 'bitcoin':
                                            https =
                                                'https://blockchain.coinmarketcap.com/address/bitcoin/'
                                            break
                                        case 'Discord':
                                            https = 'https://discord.gg/'
                                            socialIco = discordIco
                                            break
                                        case 'Facebook':
                                            https = 'https://facebook.com/'
                                            socialIco = facebookIco
                                            break
                                        case 'Github':
                                            https = 'https://github.com/'
                                            socialIco = githubIco
                                            break
                                        case 'Instagram':
                                            https = 'https://github.com/'
                                            socialIco = githubIco
                                            break
                                        case 'Twitter':
                                            https = 'https://twitter.com/'
                                            socialIco = twitterIco
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
                                                        {element[1]}
                                                    </p>
                                                </div>
                                            )
                                    }
                                    let link = ''
                                    if (element[1] !== undefined) {
                                        const prefix = element[1].slice(0, 8)
                                        if (prefix === https) {
                                            link = element[1]
                                        } else {
                                            link = https + element[1]
                                        }
                                    }
                                    return (
                                        <div
                                            key={element}
                                            className={styles.flipCard}
                                        >
                                            <div
                                                className={styles.flipCardInner}
                                            >
                                                <div
                                                    style={{
                                                        backgroundColor:
                                                            'green',
                                                        borderColor: 'green',
                                                    }}
                                                    className={
                                                        styles.socialCardBack
                                                    }
                                                >
                                                    <h4
                                                        style={{
                                                            fontSize: '18px',
                                                        }}
                                                    >
                                                        DESC
                                                    </h4>
                                                </div>
                                                <div
                                                    style={{
                                                        backgroundColor: '#333',
                                                        borderColor: 'green',
                                                    }}
                                                    className={
                                                        styles.socialCard
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.socialCardLeft
                                                        }
                                                    >
                                                        <h4
                                                            style={{
                                                                fontSize:
                                                                    '18px',
                                                            }}
                                                        >
                                                            {element[0]}
                                                        </h4>
                                                        <div
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <Image
                                                                src={shareIco}
                                                                alt="ico-share"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.socialCardIco
                                                        }
                                                    >
                                                        <Image
                                                            src={socialIco}
                                                            alt="social-ico"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        // <div
                                        //     key={element}
                                        //     onClick={() =>
                                        //         window.open(`${link}`)
                                        //     }
                                        //     className={styles.docInfo}
                                        // >
                                        //     <p
                                        //         key={element}
                                        //         className={styles.did}
                                        //     >
                                        //         {element[0]}
                                        //     </p>
                                        // </div>
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
                                style={{ color: '#ffff32' }}
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
