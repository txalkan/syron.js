import { useStore } from 'effector-react'
import {
    $investorItems,
    $modalInvestor,
    updateInvestorModal,
} from '../../../src/store/modal'
import CloseReg from '../../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../../src/assets/icons/ic_cross_black.svg'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import Spinner from '../../Spinner'

function Component() {
    const modalInvestor = useStore($modalInvestor)
    const investorItems = useStore($investorItems)
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg

    const [showMsgBlock, setShowMsgBlock] = useState(false)
    const [loadingBlock, setLoadingBlock] = useState(true)
    const [currentBlock, setCurrentBlock] = useState<any>(null)

    const getBlockChainInfo = () => {
        let network = tyron.DidScheme.NetworkNamespace.Mainnet
        if (net === 'testnet') {
            network = tyron.DidScheme.NetworkNamespace.Testnet
        }
        const init = new tyron.ZilliqaInit.default(network)
        init.API.blockchain.getBlockChainInfo().then((res) => {
            setCurrentBlock(Number(res.result?.CurrentMiniEpoch))
            if (investorItems) {
                if (
                    Number(investorItems[0]) <
                    Number(res.result?.CurrentMiniEpoch)
                ) {
                    setShowMsgBlock(true)
                }
            }
            setLoadingBlock(false)
        })
    }

    useEffect(() => {
        getBlockChainInfo()
    })

    if (!modalInvestor) {
        return null
    }

    const release_block = investorItems[0]
    const block_period = investorItems[1]
    const locked_amount = Number(investorItems[2] / 1e12).toFixed(2)
    const token_quota = Number(investorItems[3] / 1e12).toFixed(2)
    const vested_factor = (currentBlock - release_block) / block_period
    let claimable = '0'
    let txn;
    if (vested_factor > 0) {
        txn = Math.trunc(vested_factor) + 1
        claimable = (txn * Number(token_quota)).toFixed(2)
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
                        <h2 className={styles.headerTxt}>Investor account</h2>
                    </div>
                    <div className={styles.contentWrapper}>
                        <h3>
                            <div className={styles.txt}>
                                Current block:{' '}
                                {loadingBlock ? <Spinner /> : currentBlock}
                            </div>
                        </h3>
                        <h5>
                            <div className={styles.txt} style={{ display: 'flex' }}>
                                Release block: {release_block}{' '}
                                {showMsgBlock && (
                                    <div className={styles.glow}>
                                        You can unlock tokens now by
                                        transferring any amount (for example, 1
                                        TYRON) to another wallet, such as ZilPay.
                                    </div>
                                )}
                            </div>
                        </h5>
                        <h5>
                            <div className={styles.txt}>
                                period: {block_period} blocks
                            </div>
                        </h5>
                        <h3>
                            <div className={styles.txt}>
                                TYRON tokens
                            </div>
                        </h3>
                        <h5>
                            <div className={styles.txt}>
                                Locked amount:{' '}
                                {locked_amount}
                            </div>
                        </h5>
                        <h5>
                            <div className={styles.txt}>
                                Quota:{' '}
                                {token_quota}
                            </div>
                        </h5>
                        <h5>
                            <div className={styles.txt} style={{ display: 'flex' }}>
                                Claimable amount: {claimable}{' '}
                                {showMsgBlock && (
                                    <div className={styles.glow}>
                                        You can release these tokens in {txn} transaction(s).
                                        Each transaction will unlock a quota of {token_quota} tokens.
                                    </div>
                                )}
                            </div>
                        </h5>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Component
