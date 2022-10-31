import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { updateTydraModal } from '../../../src/store/modal'
function Component() {
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    return (
        <div className={styles.cardActiveWrapper}>
            <div onClick={() => updateTydraModal(true)} className={styles.card}>
                <div className={styles.cardTitle3}>DEPLOY TYDRA</div>
            </div>
        </div>
    )
}

export default Component
