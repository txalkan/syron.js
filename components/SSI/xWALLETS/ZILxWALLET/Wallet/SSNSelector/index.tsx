import styles from './styles.module.scss'
import Image from 'next/image'
import InfoBlue from '../../../../../../src/assets/icons/info_blue.svg'
import InfoDefaultReg from '../../../../../../src/assets/icons/info_default.svg'
import InfoDefaultBlack from '../../../../../../src/assets/icons/info_default_black.svg'
import Selector from '../../../../../Selector'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'

function SSN({ onChange, title, value }) {
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const InfoDefault = isLight ? InfoDefaultBlack : InfoDefaultReg
    const optionMainnet = [
        {
            value: 'ssncex.io',
            label: 'CEX.IO',
        },
        {
            value: 'ssnmoonlet.io',
            label: 'Moonlet.io',
        },
        {
            value: 'ssnatomicwallet',
            label: 'AtomicWallet',
        },
        {
            value: 'ssnbinancestaking',
            label: 'Binance Staking',
        },
        {
            value: 'ssnzillet',
            label: 'Zillet',
        },
        {
            value: 'ssnignitedao',
            label: 'Ignite DAO',
        },
        {
            value: 'ssnvalkyrie2',
            label: 'Valkyrie2',
        },
        {
            value: 'ssnviewblock',
            label: 'ViewBlock',
        },
        {
            value: 'ssnkucoin',
            label: 'KuCoin',
        },
        {
            value: 'ssnzilliqa',
            label: 'Zilliqa',
        },
        {
            value: 'ssnhuobistaking',
            label: 'Huobi Staking',
        },
        {
            value: 'ssnshardpool.io',
            label: 'Shardpool.io',
        },
        {
            value: 'ssnezil.me',
            label: 'Ezil.me',
        },
        {
            value: 'ssnnodamatics.com',
            label: 'Nodamatics.com',
        },
        {
            value: 'ssneverstake.one',
            label: 'Everstake.one',
        },
        {
            value: 'ssnzilliqa2',
            label: 'Zilliqa2',
        },
    ]

    const optionTestnet = [
        {
            value: 'ssnmoonlet.io',
            label: 'Moonlet.io',
        },
        {
            value: 'ssnzillet',
            label: 'Zillet',
        },
    ]

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
