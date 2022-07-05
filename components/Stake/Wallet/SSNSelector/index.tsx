import styles from './styles.module.scss'

function SSN({ onChange, title }) {
    return (
        <div style={{ width: '100%' }}>
            <div className={styles.titleCardRight}>{title}</div>
            <select className={styles.selector} onChange={onChange}>
                <option value="">Select SSN</option>
                <option value="cex.io">CEX.IO</option>
                <option value="moonlet.io">Moonlet.io</option>
                <option value="atomicwallet">AtomicWallet</option>
                <option value="binance staking">Binance Staking</option>
                <option value="zillet">Zillet</option>
                <option value="ignite dao">Ignite DAO</option>
                <option value="valkyrie investments">
                    Valkyrie Investments
                </option>
                <option value="viewblock">ViewBlock</option>
                <option value="kucoin">KuCoin</option>
                <option value="zilliqa">Zilliqa</option>
                <option value="huobi staking">Huobi Staking</option>
                <option value="shardpool.io">Shardpool.io</option>
                <option value="ezil.me">Ezil.me</option>
                <option value="nodamatics.com">Nodamatics.com</option>
                <option value="everstake.one">Everstake.one</option>
                <option value="zilliqa2">Zilliqa2</option>
            </select>
        </div>
    )
}

export default SSN
