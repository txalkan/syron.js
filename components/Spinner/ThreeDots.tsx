import styles from './styles.module.scss'

function ThreeDots({ color }) {
    return (
        <div
            className={
                color === 'basic' ? styles.dotFlashingBasic : styles.dotFlashing
            }
        />
    )
}

export default ThreeDots
