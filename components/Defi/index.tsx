import { useStore } from 'effector-react'
import { useSelector } from 'react-redux'
import { $doc } from '../../src/store/did-doc'
import { useRouter } from 'next/router'
import styles from './styles.module.scss'
import { RootState } from '../../src/app/reducers'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { useState } from 'react'
import ThreeDots from '../Spinner/ThreeDots'

function Component() {
    const Router = useRouter()
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name

    const [loadingCard1, setLoadingCard1] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)
    const [loadingCard3, setLoadingCard3] = useState(false)
    // const doc = useStore($doc)
    // const controller = resolvedUsername?.controller
    // const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1 style={{ marginBottom: '10%' }}>
                <div className={styles.username}>{username}.defi</div>
                <div>DID Domain</div>
            </h1>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'row',
                }}
            ></div>
            <div
                style={{
                    marginTop: '7%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <h2>
                        <div
                            className={styles.card1}
                            onClick={() => {
                                setLoadingCard1(true)
                                Router.push(`/${username}`)
                                setTimeout(() => {
                                    setLoadingCard1(false)
                                }, 1000)
                            }}
                        >
                            <div className={styles.cardTitle3}>
                                {loadingCard1 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'DeFi'
                                )}
                            </div>
                            <div className={styles.cardTitle2}>
                                {loadingCard1 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'Decentralized Identifier document'
                                )}
                            </div>
                        </div>
                    </h2>
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <h2>
                        <div
                            className={styles.card}
                            onClick={() => {
                                setLoadingCard2(true)
                                Router.push(`/${username}.defi/p2p`)
                                setTimeout(() => {
                                    setLoadingCard2(false)
                                }, 1000)
                                // if (controller === address) {
                                //   updateIsController(true);
                                //   Router.push(`/${username}/xwallet`);
                                // } else {
                                //   toast.error(
                                //     `Only ${username}'s DID Controller can access this wallet.`,
                                //     {
                                //       position: "top-right",
                                //       autoClose: 3000,
                                //       hideProgressBar: false,
                                //       closeOnClick: true,
                                //       pauseOnHover: true,
                                //       draggable: true,
                                //       progress: undefined,
                                //       theme: "dark",
                                //     }
                                //   );
                                // }
                            }}
                        >
                            <div className={styles.cardTitle3}>
                                {loadingCard2 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'Peer to Peer'
                                )}
                            </div>
                            <div className={styles.cardTitle2}>
                                {loadingCard2 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'desc'
                                )}
                            </div>
                        </div>
                    </h2>
                    <h2>
                        <div
                            className={styles.card}
                            onClick={() => {
                                setLoadingCard3(true)
                                Router.push(`/${username}.defi/defi/funds`)
                                setTimeout(() => {
                                    setLoadingCard3(false)
                                }, 1000)
                            }}
                        >
                            <div className={styles.cardTitle3}>
                                {loadingCard3 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'add funds'
                                )}
                            </div>
                            <div className={styles.cardTitle2}>
                                {loadingCard3 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'top up wallet'
                                )}
                            </div>
                        </div>
                    </h2>
                </div>
            </div>
        </div>
    )
}

export default Component
