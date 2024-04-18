import React, { useEffect, useState } from 'react'
import { useStore as effectorStore } from 'effector-react'
import * as tyron from 'tyron'
import { Lock } from '../../..'
import styles from './styles.module.scss'
import { $doc } from '../../../../src/store/did-doc'
import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import { $loadingDoc } from '../../../../src/store/loading'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'
import toastTheme from '../../../../src/hooks/toastTheme'
import useArConnect from '../../../../src/hooks/useArConnect'
import { $arconnect } from '../../../../src/store/arconnect'
import useRouterHook from '../../../../src/hooks/router'
import useFetch from '../../../../src/hooks/fetch'
import { toast } from 'react-toastify'
import { useStore } from 'react-stores'
import ThreeDots from '../../../Spinner/ThreeDots'

function Component() {
    const { t } = useTranslation()
    const { navigate } = useRouterHook()
    const { fetchDoc, checkVersion } = useFetch()
    const doc = effectorStore($doc)
    const controller_ = effectorStore($doc)?.controller.toLowerCase()
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedSubdomain = resolvedInfo?.user_subdomain
    const domainNavigate =
        resolvedSubdomain !== '' ? resolvedSubdomain + '@' : ''
    const { connect } = useArConnect()
    const loadingDoc = effectorStore($loadingDoc)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const zilpay_addr =
        loginInfo?.zilAddr !== null
            ? loginInfo?.zilAddr.base16.toLowerCase()
            : ''
    const [hideLock, setHideLock] = useState(true)
    const [lockLegend, setLockLegend] = useState('LOCK')

    const is_operational =
        resolvedInfo?.status !== tyron.Sidetree.DIDStatus.Deactivated &&
        resolvedInfo?.status !== tyron.Sidetree.DIDStatus.Locked

    useEffect(() => {
        fetchDoc()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedDomain])

    return (
        <div className={styles.wrapper}>
            {loadingDoc ? (
                <ThreeDots color="da-igual" />
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
                    {doc?.guardians.length === 0 && hideLock && (
                        <div style={{}} className={styles.info}>
                            {t(
                                'Social Recovery has not been enabled by X yet.',
                                { name: resolvedDomain }
                            )}
                        </div>
                    )}
                    {doc?.guardians.length !== 0 && hideLock && (
                        <div className={styles.sectionWrapper}>
                            <div className={styles.headline}>
                                {t('EXECUTE RECOVERY')}
                            </div>
                            <div className={styles.info}>
                                {t('X HAS X GUARDIANS', {
                                    name: resolvedDomain,
                                    value: doc?.guardians.length,
                                })}
                            </div>
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
                        </div>
                    )}
                    {controller_ === zilpay_addr && (
                        <div className={styles.sectionWrapper}>
                            <div className={styles.headline}>
                                {t('CONFIGURE RECOVERY')}
                            </div>
                            <button
                                onClick={async () => {
                                    if (
                                        checkVersion(resolvedInfo?.version!) >=
                                        6
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
                                {t('SETTINGS')}
                            </button>
                        </div>
                    )}
                    {doc?.guardians.length !== 0 &&
                        is_operational &&
                        resolvedInfo?.status !==
                            tyron.Sidetree.DIDStatus.Deployed &&
                        hideLock && (
                            <div className={styles.sectionWrapper}>
                                <div className={styles.headline}>
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
                                    <span>{t(lockLegend)}</span>
                                </button>
                            </div>
                        )}
                    {!hideLock && <Lock />}
                </>
            )}
        </div>
    )
}

export default Component
