import { useStore } from 'effector-react'
import {
    $investorItems,
    $modalInvestor,
    updateInvestorModal,
} from '../../../src/store/modal'
import Close from '../../../src/assets/icons/ic_cross.svg'
import styles from './styles.module.scss'
import Image from 'next/image'

function Component() {
    const modalInvestor = useStore($modalInvestor)
    const investorItems = useStore($investorItems)

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
                        <div>Next release block: {investorItems[0]}</div>
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
