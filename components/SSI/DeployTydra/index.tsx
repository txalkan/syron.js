import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { updateTydraModal } from '../../../src/store/modal'
import { $arconnect } from '../../../src/store/arconnect'
import { useState } from 'react'
import useArConnect from '../../../src/hooks/useArConnect'
import ThreeDots from '../../Spinner/ThreeDots'
function Component() {
    const { connect } = useArConnect()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const [loadingCard, setLoadingCard] = useState(false)

    const openModal = async () => {
        setLoadingCard(true)
        await connect().then(() => {
            const arConnect = $arconnect.getState()
            if (arConnect) {
                setLoadingCard(false)
                updateTydraModal(true)
            }
        })
    }

    return (
        <div className={styles.cardActiveWrapper}>
            <div onClick={openModal} className={styles.card}>
                <div className={styles.cardTitle3}>
                    {loadingCard ? (
                        <ThreeDots color="yellow" />
                    ) : (
                        <>DEPLOY TYDRA</>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Component
