import styles from './styles.module.scss'

function ThunderIco({ onClick, type }) {
    return (
        <div
            onClick={onClick}
            className={type === 'regular' ? styles.thunder : styles.thunderSm}
        >
            ⚡️
        </div>
    )
}

export default ThunderIco
