import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { CreateDomain, Spinner } from '../../../../..'
import styles from './styles.module.scss'
import controller from '../../../../../../src/hooks/isController'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'
import backIco from '../../../../../../src/assets/icons/arrow_left_chrome.svg'

function Component() {
    const { t } = useTranslation()
    const loading = useSelector(
        (state: RootState) => state.modal.txStatusLoading
    )
    const [selectedDomain, setSelectedDomain] = useState('')
    const { isController } = controller()

    useEffect(() => {
        isController()
    })

    const resetState = () => {
        setSelectedDomain('')
    }

    const listDomains = ['ZIL Staking Wallet'] // to add further DID domains

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
            {selectedDomain !== '' ? (
                <button
                    onClick={resetState}
                    className="button"
                    style={{
                        marginBottom: '10%',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Image src={backIco} alt="back-ico" />
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
                        <div>
                            {selectedDomain === '' ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    {listDomains.map((val, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setSelectedDomain(val)
                                            }}
                                        >
                                            <p
                                                className={
                                                    styles.buttonColorText
                                                }
                                            >
                                                {val}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                        {selectedDomain === 'ZIL Staking Wallet' && (
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
                                                            theme: toastTheme(isLight),
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
                                                            theme: toastTheme(isLight),
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
