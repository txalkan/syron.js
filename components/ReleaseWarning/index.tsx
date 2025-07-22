import styles from './styles.module.scss'
const AlphaWarning = () => (
    <div className={styles.alphaWarning}>
        This is an alpha release on Bitcoin Mainnet for testing only; please use
        small amounts at your own risk.
    </div>
)

export const ReleaseWarning = () => {
    return (
        <div className={styles.panel}>
            <AlphaWarning />
        </div>
    )
}

export default ReleaseWarning
