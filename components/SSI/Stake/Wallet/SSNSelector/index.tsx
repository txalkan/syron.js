import styles from './styles.module.scss'
import Image from 'next/image'
import Info from '../../../../../src/assets/icons/info_blue.svg'
import Selector from '../../../../Selector'

function SSN({ onChange, title, value }) {
    const option = [
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

    return (
        <div style={{ width: '100%' }}>
            <div className={styles.titleCardRight}>
                {title}&nbsp;
                <span className={styles.tooltip}>
                    <Image alt="info-ico" src={Info} width={20} height={20} />
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
