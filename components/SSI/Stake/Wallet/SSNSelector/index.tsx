import styles from './styles.module.scss'
import Image from 'next/image'
import InfoBlue from '../../../../../src/assets/icons/info_blue.svg'
import InfoDefaultReg from '../../../../../src/assets/icons/info_default.svg'
import InfoDefaultBlack from '../../../../../src/assets/icons/info_default_black.svg'
import Selector from '../../../../Selector'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../src/app/reducers'

function SSN({ onChange, title, value }) {
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const InfoDefault = isLight ? InfoDefaultBlack : InfoDefaultReg
    const optionMainnet = [
        {
            key: '',
            name: 'Select SSN',
        },
        {
            key: 'ssncex.io',
            name: 'CEX.IO',
        },
        {
            key: 'ssnmoonlet.io',
            name: 'Moonlet.io',
        },
        {
            key: 'ssnatomicwallet',
            name: 'AtomicWallet',
        },
        {
            key: 'ssnbinancestaking',
            name: 'Binance Staking',
        },
        {
            key: 'ssnzillet',
            name: 'Zillet',
        },
        {
            key: 'ssnignitedao',
            name: 'Ignite DAO',
        },
        {
            key: 'ssnvalkyrie2',
            name: 'Valkyrie2',
        },
        {
            key: 'ssnviewblock',
            name: 'ViewBlock',
        },
        {
            key: 'ssnkucoin',
            name: 'KuCoin',
        },
        {
            key: 'ssnzilliqa',
            name: 'Zilliqa',
        },
        {
            key: 'ssnhuobistaking',
            name: 'Huobi Staking',
        },
        {
            key: 'ssnshardpool.io',
            name: 'Shardpool.io',
        },
        {
            key: 'ssnezil.me',
            name: 'Ezil.me',
        },
        {
            key: 'ssnnodamatics.com',
            name: 'Nodamatics.com',
        },
        {
            key: 'ssneverstake.one',
            name: 'Everstake.one',
        },
        {
            key: 'ssnzilliqa2',
            name: 'Zilliqa2',
        },
    ]

    const optionTestnet = [
        {
            key: '',
            name: 'Select SSN',
        },
        {
            key: 'ssnmoonlet.io',
            name: 'Moonlet.io',
        },
        {
            key: 'ssnzillet',
            name: 'Zillet',
        },
    ]

    const option = net === 'mainnet' ? optionMainnet : optionTestnet

    return (
        <div style={{ width: 'fit-content' }}>
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
                <Selector option={option} onChange={onChange} value={value} />
            </div>
        </div>
    )
}

export default SSN
