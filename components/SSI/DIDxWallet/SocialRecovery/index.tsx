import React, { useEffect, useState } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { Lock, Sign, Spinner } from '../../..'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { $doc } from '../../../../src/store/did-doc'
import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import { $loadingDoc } from '../../../../src/store/loading'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'
import toastTheme from '../../../../src/hooks/toastTheme'
import useArConnect from '../../../../src/hooks/useArConnect'
import { $arconnect } from '../../../../src/store/arconnect'
import routerHook from '../../../../src/hooks/router'
import fetch from '../../../../src/hooks/fetch'

function Component() {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const { fetchDoc } = fetch()
    const doc = useStore($doc)
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const domainNavigate = domain !== '' ? domain + '@' : ''
    const { connect } = useArConnect()
    const loadingDoc = useStore($loadingDoc)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const [hideLock, setHideLock] = useState(true)
    const [lockLegend, setLockLegend] = useState('LOCK')

    const [hideSig, setHideSig] = useState(true)
    const [sigLegend, setSigLegend] = useState('SIGN ADDRESS')

    const is_operational =
        resolvedInfo?.status !== tyron.Sidetree.DIDStatus.Deactivated &&
        resolvedInfo?.status !== tyron.Sidetree.DIDStatus.Locked

    const spinner = <Spinner />

    useEffect(() => {
        fetchDoc()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                        <div
                            style={{ marginBottom: '2rem' }}
                            className={styles.title}
                        >
                            {t(
                                'Social Recovery has not been enabled by X yet.',
                                { name: username }
                            )}
                        </div>
                    )}
                    <ul>
                        <li>
                            {doc?.guardians.length !== 0 &&
                                hideLock &&
                                hideSig && (
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
                                                navigate(
                                                    `/${domainNavigate}${username}/didx/recovery/now`
                                                )
                                            }}
                                        >
                                            <div
                                                className={
                                                    styles.buttonColorText
                                                }
                                            >
                                                {t('SOCIAL RECOVER')}
                                            </div>
                                        </button>
                                    </>
                                )}
                        </li>
                        <li>
                            {doc?.guardians.length !== 0 &&
                                is_operational &&
                                resolvedInfo?.status !==
                                    tyron.Sidetree.DIDStatus.Deployed &&
                                hideSig &&
                                hideLock && (
                                    <div>
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
                                            onClick={async () => {
                                                await connect().then(() => {
                                                    const arConnect =
                                                        $arconnect.getState()
                                                    if (arConnect) {
                                                        setHideLock(false)
                                                        setLockLegend('back')
                                                    }
                                                })
                                            }}
                                        >
                                            <div
                                                className={
                                                    styles.buttonColorDText
                                                }
                                            >
                                                {t(lockLegend)}
                                            </div>
                                        </button>
                                    </div>
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
