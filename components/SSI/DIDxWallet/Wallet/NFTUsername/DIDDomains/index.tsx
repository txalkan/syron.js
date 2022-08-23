import React, { useEffect, useState } from 'react'
import { CreateDomain, Spinner } from '../../../../..'
import styles from './styles.module.scss'
import controller from '../../../../../../src/hooks/isController'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'

function Component() {
    const { t } = useTranslation()
    const loading = useSelector(
        (state: RootState) => state.modal.txStatusLoading
    )
    const [hideVC, setHideVC] = useState(true)
    const [hide, setHide] = useState(true)
    const [legend, setLegend] = useState('ZIL Staking Wallet') //@todo-i improve this component so it is easier to add more domains, e.g. DeFi xWallet
    const { isController } = controller()

    useEffect(() => {
        isController()
    })

    const resetState = () => {
        setHide(true)
        setHideVC(true)
        setLegend('ZIL Staking Wallet')
    }

    const spinner = <Spinner />

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
            }}
        >
            {!hideVC || !hide ? (
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
                                {hide ? (
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHide(false)
                                        }}
                                    >
                                        <p className={styles.buttonColorText}>
                                            {legend}
                                        </p>
                                    </button>
                                ) : (
                                    <></>
                                )}
                            </div>
                        )}
                        {!hide && (
                            <CreateDomain
                                {...{
                                    dapp: 'zilstake',
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
