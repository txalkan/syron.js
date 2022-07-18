import React, { useEffect, useState } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { Lock, SocialRecover, Sign } from '../../..'
import styles from './styles.module.scss'
import { $doc } from '../../../../src/store/did-doc'
import { $user } from '../../../../src/store/user'
import { $arconnect } from '../../../../src/store/arconnect'
import fetchDoc from '../../../../src/hooks/fetchDoc'
import { $loadingDoc } from '../../../../src/store/loading'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'

function Component() {
    const { t } = useTranslation()
    const doc = useStore($doc)
    const username = useStore($user)?.name
    const resolvedUsername = useSelector(
        (state: RootState) => state.modal.resolvedUsername
    )
    const arConnect = useStore($arconnect)
    const loadingDoc = useStore($loadingDoc)

    const [hideRecovery, setHideRecovery] = useState(true)
    const [recoveryLegend, setRecoveryLegend] = useState('SOCIAL RECOVER')

    const [hideLock, setHideLock] = useState(true)
    const [lockLegend, setLockLegend] = useState('LOCK')

    const [hideSig, setHideSig] = useState(true)
    const [sigLegend, setSigLegend] = useState('SIGN ADDRESS')

    const is_operational =
        resolvedUsername?.status !== tyron.Sidetree.DIDStatus.Deactivated &&
        resolvedUsername?.status !== tyron.Sidetree.DIDStatus.Locked

    const { fetch } = fetchDoc()

    useEffect(() => {
        fetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
            }}
        >
            {loadingDoc ? (
                spinner
            ) : (
                <>
                    {doc?.guardians.length === 0 && hideSig && hideLock && (
                        <p>
                            {t(
                                'Social Recovery has not been enabled by X yet.',
                                { name: username }
                            )}
                        </p>
                    )}
                    <ul>
                        <li>
                            {doc?.guardians.length !== 0 &&
                                hideLock &&
                                hideSig &&
                                hideRecovery && (
                                    <>
                                        <h4>
                                            {t('X HAS X GUARDIANS', {
                                                name: username,
                                                value: doc?.guardians.length,
                                            })}
                                        </h4>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideRecovery(false)
                                                setRecoveryLegend('back')
                                            }}
                                        >
                                            <p
                                                className={
                                                    styles.buttonColorText
                                                }
                                            >
                                                {t(recoveryLegend)}
                                            </p>
                                        </button>
                                    </>
                                )}
                            {!hideRecovery && (
                                <div>
                                    <SocialRecover />
                                </div>
                            )}
                        </li>
                        <li>
                            {hideRecovery && hideLock && hideSig && (
                                <div style={{ marginTop: '20%' }}>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            if (arConnect === null) {
                                                toast.warning(
                                                    'Connect with ArConnect.',
                                                    {
                                                        position: 'top-center',
                                                        autoClose: 2000,
                                                        hideProgressBar: false,
                                                        closeOnClick: true,
                                                        pauseOnHover: true,
                                                        draggable: true,
                                                        progress: undefined,
                                                        theme: 'dark',
                                                    }
                                                )
                                            } else {
                                                setHideSig(false)
                                                setSigLegend('back')
                                            }
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {t(sigLegend)}
                                        </p>
                                    </button>
                                </div>
                            )}
                            {!hideSig && <Sign />}
                        </li>
                        <li>
                            {is_operational &&
                                resolvedUsername?.status !==
                                    tyron.Sidetree.DIDStatus.Deployed &&
                                hideRecovery &&
                                hideSig &&
                                hideLock && (
                                    <p>
                                        <h5
                                            style={{
                                                color: 'red',
                                                marginTop: '20%',
                                            }}
                                        >
                                            {t('DANGER ZONE')}
                                        </h5>
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
                                                    setHideLock(false)
                                                    setLockLegend('back')
                                                }
                                            }}
                                        >
                                            <p
                                                className={
                                                    styles.buttonColorDText
                                                }
                                            >
                                                {t(lockLegend)}
                                            </p>
                                        </button>
                                    </p>
                                )}
                            {!hideLock && (
                                <div>
                                    <Lock />
                                </div>
                            )}
                        </li>
                    </ul>
                </>
            )}
        </div>
    )
}

export default Component
