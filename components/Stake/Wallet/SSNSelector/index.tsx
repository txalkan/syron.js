import styles from './styles.module.scss'
import Image from 'next/image'
import Warning from '../../../../src/assets/icons/warning.svg'
import Selector from '../../../Selector'

function SSN({ onChange, title, value }) {
    const option = [
        {
            key: '',
            name: 'Select SSN',
        },
        {
            key: 'cex.io',
            name: 'CEX.IO',
        },
        {
            key: 'moonlet.io',
            name: 'Moonlet.io',
        },
        {
            key: 'atomicwallet',
            name: 'AtomicWallet',
        },
        {
            key: 'binance staking',
            name: 'Binance Staking',
        },
        {
            key: 'zillet',
            name: 'Zillet',
        },
        {
            key: 'ignite dao',
            name: 'Ignite DAO',
        },
        {
            key: 'valkyrie investments',
            name: 'Valkyrie Investments',
        },
        {
            key: 'viewblock',
            name: 'ViewBlock',
        },
        {
            key: 'kucoin',
            name: 'KuCoin',
        },
        {
            key: 'zilliqa',
            name: 'Zilliqa',
        },
        {
            key: 'huobi staking',
            name: 'Huobi Staking',
        },
        {
            key: 'shardpool.io',
            name: 'Shardpool.io',
        },
        {
            key: 'ezil.me',
            name: 'Ezil.me',
        },
        {
            key: 'nodamatics.com',
            name: 'Nodamatics.com',
        },
        {
            key: 'everstake.one',
            name: 'Everstake.one',
        },
        {
            key: 'zilliqa2',
            name: 'Zilliqa2',
        },
    ]

    return (
        <div style={{ width: '100%' }}>
            <div className={styles.titleCardRight}>
                {title}&nbsp;
                <span className={styles.tooltip}>
                    <Image
                        alt="warning-ico"
                        src={Warning}
                        width={20}
                        height={20}
                    />
                    <span className={styles.tooltiptext}>
                        <div
                            style={{
                                fontSize: '14px',
                            }}
                        >
                            More info on{' '}
                            <a
                                style={{ color: '#ffff32' }}
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
