import { useStore } from 'effector-react'
import {
    $investorItems,
    $modalInvestor,
    updateInvestorModal,
} from '../../../src/store/modal'
import Close from '../../../src/assets/icons/ic_cross.svg'
import styles from './styles.module.scss'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'

function Component() {
    const modalInvestor = useStore($modalInvestor)
    const investorItems = useStore($investorItems)
    const net = useSelector((state: RootState) => state.modal.net)

    const [showMsgBlock, setShowMsgBlock] = useState(false)
    const [currentBlock, setCurrentBlock] = useState<any>(null)

    const getBlockChainInfo = () => {
        let network = tyron.DidScheme.NetworkNamespace.Mainnet
        if (net === 'testnet') {
            network = tyron.DidScheme.NetworkNamespace.Testnet
        }
        const init = new tyron.ZilliqaInit.default(network)
        init.API.blockchain.getBlockChainInfo().then((res) => {
            if (investorItems) {
                if (
                    Number(investorItems[0]) <
                    Number(res.result?.CurrentMiniEpoch)
                ) {
                    setCurrentBlock(Number(res.result?.CurrentMiniEpoch))
                    setShowMsgBlock(true)
                }
            }
        })
    }

    useEffect(() => {
        getBlockChainInfo()
    })

    if (!modalInvestor) {
        return null
    }

    return (
        <>
            <div
                onClick={() => updateInvestorModal(false)}
                className={styles.outerWrapper}
            />
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div
                            onClick={() => updateInvestorModal(false)}
                            className="closeIcon"
                        >
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={15}
                                height={15}
                            />
                        </div>
                        <h5 className={styles.headerTxt}>Investor Modal</h5>
                    </div>
                    <div className={styles.contentWrapper}>
                        <div>Current block: {currentBlock}</div>
                        <div>
                            Next release block: {investorItems[0]}{' '}
                            {showMsgBlock && (
                                <span style={{
                                    fontSize: '13px'
                                    /**
                                    @todo-i add neon glow
                                    - put info inside of a box
                                    */
                                }}>
                                    =&gt; You can unlock a quota now by transferring any amount (for example, 1 TYRON) to another wallet.
                                </span>
                            )}
                        </div>
                        <div>Block period: {investorItems[1]}</div>
                        <div>
                            Token locked amount:{' '}
                            {Number(investorItems[2] / 1e12).toFixed(2)}
                        </div>
                        <div>
                            Token quota:{' '}
                            {Number(investorItems[3] / 1e12).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Component
