import styles from './styles.module.scss'
import Image from 'next/image'
import InfoBlue from '../../../../../../src/assets/icons/info_blue.svg'
import InfoDefaultReg from '../../../../../../src/assets/icons/info_default.svg'
import InfoDefaultBlack from '../../../../../../src/assets/icons/info_default_black.svg'
import Selector from '../../../../../Selector'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'
import { $net } from '../../../../../../src/store/network'
import {
    optionMainnet,
    optionTestnet,
} from '../../../../../../src/constants/staking-nodes'

function SSN({ onChange, title }) {
    const net = $net.state.net as 'mainnet' | 'testnet'

    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const InfoDefault = isLight ? InfoDefaultBlack : InfoDefaultReg

    const option = net === 'mainnet' ? optionMainnet : optionTestnet

    return (
        <div style={{ width: '100%' }}>
            <div className={styles.titleCardRight}>
                {title}&nbsp;
                <span className={styles.tooltip}>
                    <div className={styles.ico}>
                        <div className={styles.icoDefault}>
                            <Image
                                alt="info-ico"
                                src={InfoDefault}
                                width={20}
                                height={20}
                            />
                        </div>
                        <div className={styles.icoColor}>
                            <Image
                                alt="info-ico"
                                src={InfoBlue}
                                width={20}
                                height={20}
                            />
                        </div>
                    </div>
                    <span className={styles.tooltiptext}>
                        <div
                            style={{
                                fontSize: '14px',
                            }}
                        >
                            More info on{' '}
                            <a
                                style={{ color: '#0000FF' }}
                                href="https://stake.zilliqa.com/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Zillion
                            </a>
                        </div>
                    </span>
                </span>
            </div>
            <div className={styles.selector}>
                <Selector
                    option={option}
                    onChange={onChange}
                    placeholder="Select SSN"
                />
            </div>
        </div>
    )
}

export default SSN
