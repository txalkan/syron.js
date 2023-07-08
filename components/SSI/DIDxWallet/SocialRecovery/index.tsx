import React, { useEffect, useState } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import Image from 'next/image'
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
import CloseReg from '../../../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../../../src/assets/icons/ic_cross_black.svg'

function Component() {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const { fetchDoc, checkVersion } = fetch()
    const doc = useStore($doc)
    const controller_ = useStore($doc)?.controller
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedSubdomain = resolvedInfo?.user_subdomain
    const domainNavigate =
        resolvedSubdomain !== '' ? resolvedSubdomain + '@' : ''
    const { connect } = useArConnect()
    const loadingDoc = useStore($loadingDoc)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg

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
    }, [resolvedDomain])

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                marginBottom: '17px',
            }}
            // className="sectionWrapper"
        >
            {loadingDoc ? (
                spinner
            ) : (
                <>
                    {/* <div
                        onClick={() => {
                            navigate(
                                `/${domainNavigate}${resolvedDomain}/didx/`
                            )
                        }}
                        className={styles.closeIcoWrapper}
                    >
                        <div className={styles.closeIco}>
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={15}
                                height={15}
                            />
                        </div>
                    </div> */}
                    {doc?.guardians.length === 0 && hideSig && hideLock && (
                        <div
                            style={{ marginBottom: '2rem' }}
                            className={styles.title}
                        >
                            {t(
                                'Social Recovery has not been enabled by X yet.',
                                { name: resolvedDomain }
                            )}
                        </div>
                    )}
                    <div>
                        {doc?.guardians.length !== 0 && hideLock && hideSig && (
                            <>
                                <h4>
                                    {t('X HAS X GUARDIANS', {
                                        name: resolvedDomain,
                                        value: doc?.guardians.length,
                                    })}
                                </h4>
                                <button
                                    className={styles.button}
                                    onClick={() => {
                                        navigate(
                                            `/${domainNavigate}${resolvedDomain}/didx/recovery/now`
                                        )
                                    }}
                                >
                                    <span>{t('SOCIAL RECOVER')}</span>
                                </button>
                            </>
                        )}
                    </div>
                    <div>
                        {doc?.guardians.length !== 0 &&
                            is_operational &&
                            resolvedInfo?.status !==
                                tyron.Sidetree.DIDStatus.Deployed &&
                            hideSig &&
                            hideLock && (
                                <div>
                                    <div
                                        style={{
                                            color: 'red',
                                            margin: '10%',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {t('DANGER ZONE')}
                                    </div>
                                    <button
                                        className={styles.buttonLock}
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
                                            style={{
                                                color: 'red',
                                                textTransform: 'uppercase',
                                            }}
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
                    </div>
                    {controller_ === zilAddr?.base16 && (
                        <div className={styles.buttonWrapper}>
                            <button
                                onClick={async () => {
                                    if (
                                        checkVersion(resolvedInfo?.version) >= 6
                                    ) {
                                        navigate(
                                            `/${domainNavigate}${resolvedDomain}/didx/wallet/doc/social`
                                        )
                                    } else {
                                        await connect().then(() => {
                                            const arConnect =
                                                $arconnect.getState()
                                            if (arConnect) {
                                                navigate(
                                                    `/${domainNavigate}${resolvedDomain}/didx/wallet/doc/social`
                                                )
                                            }
                                        })
                                    }
                                }}
                                className={styles.button}
                            >
                                <span>settings</span>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
