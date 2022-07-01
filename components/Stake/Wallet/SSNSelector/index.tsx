import styles from './styles.module.scss'

function SSN({ onChange, title }) {
    return (
        <div style={{ width: '100%' }}>
            <div className={styles.titleCardRight}>{title}</div>
            <select className={styles.selector} onChange={onChange}>
                <option value="">Select SSN</option>
                <option value="CEX.IO">CEX.IO</option>
                <option value="Moonlet.io">Moonlet.io</option>
                <option value="AtomicWallet">AtomicWallet</option>
                <option value="Binance Staking">Binance Staking</option>
                <option value="Zillet">Zillet</option>
                <option value="Ignite DAO">Ignite DAO</option>
                <option value="Valkyrie Investments">
                    Valkyrie Investments
                </option>
                <option value="ViewBlock">ViewBlock</option>
                <option value="KuCoin">KuCoin</option>
                <option value="Zilliqa">Zilliqa</option>
                <option value="Huobi Staking">Huobi Staking</option>
                <option value="Shardpool.io">Shardpool.io</option>
                <option value="Ezil.me">Ezil.me</option>
                <option value="Nodamatics.com">Nodamatics.com</option>
                <option value="Everstake.one">Everstake.one</option>
                <option value="Zilliqa2">Zilliqa2</option>
            </select>
        </div>
    )
}

export default SSN
