import React, { useState } from 'react'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { $loading, $loadingDoc } from '../../src/store/loading'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import rightChrome from '../../src/assets/icons/arrow_right_chrome.svg'
import rightDark from '../../src/assets/icons/arrow_right_dark.svg'
import leftChrome from '../../src/assets/icons/arrow_left_chrome.svg'
import { useTranslation } from 'next-i18next'
import { $prev, updatePrev } from '../../src/store/router'
import routerHook from '../../src/hooks/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'

function Component({ data }) {
    const Router = useRouter()
    const loading = useStore($loading)
    const loadingDoc = useStore($loadingDoc)
    const prev = useStore($prev)
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const path = window.location.pathname
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const replaceLangPath = () => {
        return path
            .replace('/es', '')
            .replace('/cn', '')
            .replace('/id', '')
            .replace('/ru', '')
    }

    const isDidx =
        replaceLangPath().split('/')[2] === 'didx' &&
        replaceLangPath().split('/').length === 3

    const goBack = () => {
        updatePrev(window.location.pathname)
        Router.back()
    }

    const goForward = () => {
        Router.push(prev)
    }

    const possibleForward = () => {
        const prevLength = prev?.split('/').length
        const pathLength = path.split('/').length
        if (prev === '/') {
            return false
        } else if (prevLength > pathLength) {
            return true
        } else if (prevLength === pathLength && prev !== path) {
            return true
        } else {
            return false
        }
    }

    const isZil = replaceLangPath().replace('/', '').includes('/zil')
    const isSbt = replaceLangPath().replace('/', '').includes('/sbt')

    if (loading || loadingDoc) {
        return null
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.wrapperBreadcrumbs}>
                <h6 className={styles.txtBreadcrumbs}>
                    <span
                        onClick={() => {
                            Router.push('/')
                            updatePrev('/')
                        }}
                        className={styles.txtBreadcrumbsSpan}
                    >
                        {t('HOMEPAGE')}
                    </span>{' '}
                    <span>
                        {data[0]?.name !== 'DidDomains' && (
                            <>
                                |{' '}
                                {isDidx ? (
                                    <span
                                        onClick={() =>
                                            navigate(`/${domain}@${username}`)
                                        }
                                        className={styles.txtBreadcrumbsSpan}
                                    >
                                        {t('SOCIAL TREE')}
                                    </span>
                                ) : (
                                    <span
                                        onClick={() =>
                                            navigate(
                                                `/${domain}@${username}/${
                                                    isZil
                                                        ? 'zil'
                                                        : isSbt
                                                        ? 'sbt'
                                                        : 'didx'
                                                }`
                                            )
                                        }
                                        className={
                                            isZil
                                                ? styles.txtBreadcrumbsSpanBlue
                                                : styles.txtBreadcrumbsSpan
                                        }
                                    >
                                        <span style={{ textTransform: 'none' }}>
                                            {domain !== '' &&
                                                domain !== 'did' &&
                                                `${domain}@`}
                                        </span>
                                        {username}.did
                                    </span>
                                )}{' '}
                                {data.map((val) => (
                                    <span key={val.name}>
                                        &gt;{' '}
                                        <span
                                            key={val.name}
                                            onClick={() =>
                                                navigate(
                                                    `/${domain}@${username}${val.route}`
                                                )
                                            }
                                            className={
                                                styles.txtBreadcrumbsSpan
                                            }
                                        >
                                            {val.name}
                                        </span>{' '}
                                    </span>
                                ))}
                            </>
                        )}
                    </span>
                </h6>
                <div style={{ display: 'flex' }}>
                    <div onClick={goBack} style={{ cursor: 'pointer' }}>
                        <Image src={leftChrome} alt="arrow" />
                    </div>
                    &nbsp;&nbsp;
                    {possibleForward() ? (
                        <div onClick={goForward} style={{ cursor: 'pointer' }}>
                            <Image src={rightChrome} alt="arrow" />
                        </div>
                    ) : (
                        <div>
                            <Image src={rightDark} alt="arrow" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Component
