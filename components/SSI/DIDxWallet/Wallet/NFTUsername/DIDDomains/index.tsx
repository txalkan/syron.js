import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { CreateDomain } from '../../../../..'
import styles from './styles.module.scss'
import { useStore } from 'effector-react'
import { $arconnect } from '../../../../../../src/store/arconnect'
import controller from '../../../../../../src/hooks/isController'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'

function Component() {
    const { t } = useTranslation()
    const Router = useRouter()
    const loading = useSelector(
        (state: RootState) => state.modal.txStatusLoading
    )
    const arConnect = useStore($arconnect)
    const [hideVC, setHideVC] = useState(true)
    const [vcLegend, setVCLegend] = useState('.vc')
    const [hideDex, setHideDex] = useState(true)
    const [dexLegend, setDexLegend] = useState('.zil') //@todo-i improve this component so it is easier to add more domains
    const { isController } = controller()

    useEffect(() => {
        isController()
    })

    const resetState = () => {
        setHideDex(true)
        setHideVC(true)
        setDexLegend('.zil')
    }

    const spinner = (
        <i
            style={{ color: 'silver' }}
            className="fa fa-lg fa-spin fa-circle-notch"
            aria-hidden="true"
        ></i>
    )

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
            }}
        >
            {!hideVC || !hideDex ? (
                <button
                    onClick={resetState}
                    className="button"
                    style={{ marginBottom: '10%' }}
                >
                    <p>{t('BACK')}</p>
                </button>
            ) : (
                <></>
            )}
            {loading !== 'idle' &&
            loading !== 'confirmed' &&
            loading !== 'failed' &&
            loading !== 'rejected' ? (
                spinner
            ) : (
                <>
                    <div>
                        {hideVC && (
                            <div>
                                {hideDex ? (
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideDex(false)
                                        }}
                                    >
                                        <p className={styles.buttonColorText}>
                                            {dexLegend}
                                        </p>
                                    </button>
                                ) : (
                                    <></>
                                )}
                            </div>
                        )}
                        {!hideDex && (
                            <CreateDomain
                                {...{
                                    domain: 'zil',
                                }}
                            />
                        )}
                    </div>
                    {/* <div>
                        {hideDex && (
                            <>
                                {hideVC ? (
                                    <>
                                        <h4
                                            style={{
                                                color: 'silver',
                                                marginTop: '70px',
                                            }}
                                        >
                                            for community management
                                        </h4>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                if (arConnect === null) {
                                                    toast.warning(
                                                        'Connect with ArConnect.',
                                                        {
                                                            position:
                                                                'top-center',
                                                            autoClose: 2000,
                                                            hideProgressBar:
                                                                false,
                                                            closeOnClick: true,
                                                            pauseOnHover: true,
                                                            draggable: true,
                                                            progress: undefined,
                                                            theme: 'dark',
                                                        }
                                                    )
                                                } else {
                                                    toast.warning(
                                                        'If you want a Tyron VC, go to tyron.vc instead!',
                                                        {
                                                            position:
                                                                'top-right',
                                                            autoClose: 3000,
                                                            hideProgressBar:
                                                                false,
                                                            closeOnClick: true,
                                                            pauseOnHover: true,
                                                            draggable: true,
                                                            progress: undefined,
                                                            theme: 'dark',
                                                        }
                                                    )
                                                    setHideVC(false)
                                                    setVCLegend('back')
                                                }
                                            }}
                                        >
                                            <p
                                                className={
                                                    styles.buttonBlueText
                                                }
                                            >
                                                {vcLegend}
                                            </p>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h2>
                                            Verifiable credential DID domain
                                        </h2>
                                    </>
                                )}
                            </>
                        )}
                        {!hideVC && (
                            <CreateDomain
                                {...{
                                    domain: 'vc',
                                }}
                            />
                        )}
                    </div> */}
                </>
            )}
        </div>
    )
}

export default Component
