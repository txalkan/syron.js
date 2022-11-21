import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import styles from './styles.module.scss'

function ThreeDots({ color }) {
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    return (
        <div
            className={
                color === 'basic'
                    ? styles.dotFlashingBasic
                    : isLight
                    ? styles.dotFlashingLight
                    : styles.dotFlashing
            }
        />
    )
}

export default ThreeDots
