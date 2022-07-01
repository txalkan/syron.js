import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import styles from './styles.module.scss'
import { useStore } from 'effector-react'
import { $user } from '../../../../../src/store/user'
import { toast } from 'react-toastify'
import controller from '../../../../../src/hooks/isController'

function Component() {
    const user = useStore($user)
    const Router = useRouter()
    const [hideTransfer, setHideTransfer] = useState(true)
    const [showDIDDomain, setShowDIDDomain] = useState(false)
    const [showManageNFT, setShowManageNFT] = useState(false)
    const { isController } = controller()

    useEffect(() => {
        isController()
    })

    const back = () => {
        if (!hideTransfer) {
            setHideTransfer(true)
        } else if (showManageNFT) {
            setShowManageNFT(false)
        } else if (showDIDDomain) {
            setShowDIDDomain(false)
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
            }}
        >
            {showDIDDomain || showManageNFT ? (
                <button
                    onClick={back}
                    className="button"
                    style={{ marginBottom: '50%' }}
                >
                    <p>BACK</p>
                </button>
            ) : (
                <></>
            )}
            {!showDIDDomain && !showManageNFT && (
                <>
                    <h2>
                        <div
                            onClick={() => {
                                Router.push(
                                    `/${user?.name}/did/wallet/nft/domains`
                                )
                            }}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <p className={styles.cardTitle3}>
                                        DID DOMAINS
                                    </p>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <p className={styles.cardTitle2}>
                                        create new did domains
                                    </p>
                                </div>
                            </div>
                        </div>
                    </h2>
                    <h2>
                        <div
                            onClick={() => {
                                Router.push(
                                    `/${user?.name}/did/wallet/nft/manage`
                                )
                            }}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <p className={styles.cardTitle3}>
                                        MANAGE NFT USERNAME
                                    </p>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <p className={styles.cardTitle2}>
                                        extra functionality
                                    </p>
                                </div>
                            </div>
                        </div>
                    </h2>
                </>
            )}
        </div>
    )
}

export default Component
