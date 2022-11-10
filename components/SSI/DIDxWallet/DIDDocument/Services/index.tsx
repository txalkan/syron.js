import React, { useEffect, useState } from 'react'
import { useStore } from 'effector-react'
import Image from 'next/image'
import { $doc } from '../../../../../src/store/did-doc'
import {
    $loading,
    $loadingDoc,
    $loadingTydra,
} from '../../../../../src/store/loading'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import l_discordIco from '../../../../../src/assets/icons/l_discord.svg'
import l_facebookIco from '../../../../../src/assets/icons/l_facebook.svg'
import l_githubIco from '../../../../../src/assets/icons/l_github.svg'
import l_instagramIco from '../../../../../src/assets/icons/l_instagram.svg'
import l_linkedinIco from '../../../../../src/assets/icons/l_linkedin.svg'
import l_onlyfansIco from '../../../../../src/assets/icons/l_onlyfans.svg'
import l_telegramIco from '../../../../../src/assets/icons/l_telegram.svg'
import l_tiktokIco from '../../../../../src/assets/icons/l_tiktok.svg'
import l_twitchIco from '../../../../../src/assets/icons/l_twitch.svg'
import l_twitterIco from '../../../../../src/assets/icons/l_twitter.svg'
import l_whatsappIco from '../../../../../src/assets/icons/l_whatsapp.svg'
import l_youtubeIco from '../../../../../src/assets/icons/l_youtube.svg'
import d_discordIco from '../../../../../src/assets/icons/d_discord.svg'
import d_facebookIco from '../../../../../src/assets/icons/d_facebook.svg'
import d_githubIco from '../../../../../src/assets/icons/d_github.svg'
import d_instagramIco from '../../../../../src/assets/icons/d_instagram.svg'
import d_linkedinIco from '../../../../../src/assets/icons/d_linkedin.svg'
import d_onlyfansIco from '../../../../../src/assets/icons/d_onlyfans.svg'
import d_telegramIco from '../../../../../src/assets/icons/d_telegram.svg'
import d_tiktokIco from '../../../../../src/assets/icons/d_tiktok.svg'
import d_twitchIco from '../../../../../src/assets/icons/d_twitch.svg'
import d_twitterIco from '../../../../../src/assets/icons/d_twitter.svg'
import d_whatsappIco from '../../../../../src/assets/icons/d_whatsapp.svg'
import d_youtubeIco from '../../../../../src/assets/icons/d_youtube.svg'
import othersocialIco from '../../../../../src/assets/icons/othersocial_icon.svg'
import addIco from '../../../../../src/assets/icons/add_icon.svg'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../src/hooks/router'
import { Spinner } from '../../../..'
import { RootState } from '../../../../../src/app/reducers'
import { useSelector } from 'react-redux'
import useArConnect from '../../../../../src/hooks/useArConnect'
import { $arconnect } from '../../../../../src/store/arconnect'
import fetch from '../../../../../src/hooks/fetch'
import Tydra from '../../../Tydra'

function Component() {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const { connect } = useArConnect()
    const { fetchDoc } = fetch()
    const doc = useStore($doc)?.doc
    const controller_ = useStore($doc)?.controller
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)
    const resolvedInfo = useStore($resolvedInfo)
    const loading = useStore($loading)
    const loadingDoc = useStore($loadingDoc)
    const loadingTydra = useStore($loadingTydra)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const discordIco = isLight ? d_discordIco : l_discordIco
    const facebookIco = isLight ? d_facebookIco : l_facebookIco
    const githubIco = isLight ? d_githubIco : l_githubIco
    const instagramIco = isLight ? d_instagramIco : l_instagramIco
    const linkedinIco = isLight ? d_linkedinIco : l_linkedinIco
    const onlyfansIco = isLight ? d_onlyfansIco : l_onlyfansIco
    const telegramIco = isLight ? d_telegramIco : l_telegramIco
    const tiktokIco = isLight ? d_tiktokIco : l_tiktokIco
    const twitchIco = isLight ? d_twitchIco : l_twitchIco
    const twitterIco = isLight ? d_twitterIco : l_twitterIco
    const whatsappIco = isLight ? d_whatsappIco : l_whatsappIco
    const youtubeIco = isLight ? d_youtubeIco : l_youtubeIco
    // const loginInfo = useSelector((state: RootState) => state.modal)
    const domainNavigate =
        resolvedInfo?.domain !== '' ? resolvedInfo?.domain + '@' : ''

    const [serviceAvailable, setServiceAvaliable] = useState(false)

    const checkIsCommonLink = (id: string) => {
        if (
            socialDropdown.some((arr) => arr.toLowerCase() === id.toLowerCase())
        ) {
            return true
        } else {
            return false
        }
    }

    const socialDropdown = [
        'Discord Invite',
        'Facebook',
        'GitHub',
        'Instagram',
        'LinkedIn',
        'OnlyFans',
        'Telegram',
        'TikTok',
        'Twitch',
        'Twitter',
        'WhatsApp',
        'YouTube',
    ]

    useEffect(() => {
        if (!controller_) {
            fetchDoc()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loadingTydra) {
        return <></>
    }

    return (
        <div className={styles.socialTreeWrapper}>
            {loading || loadingDoc ? (
                <div>
                    <Spinner />
                </div>
            ) : (
                <>
                    <div className={styles.wrapper}>
                        {doc !== null &&
                            doc?.map((res: any, i: number) => {
                                if (res[0] === 'DID services') {
                                    if (!serviceAvailable) {
                                        setServiceAvaliable(true)
                                    }
                                    return (
                                        <div
                                            key={i}
                                            className={styles.commonWrapper}
                                        >
                                            {res[1].map(
                                                (element: any, i: number) => {
                                                    let socialIco
                                                    switch (
                                                        element[1][0]
                                                            .split('#')[0]
                                                            .toLowerCase()
                                                    ) {
                                                        case 'bitcoin':
                                                            'https://blockchain.coinmarketcap.com/address/bitcoin/'
                                                            break
                                                        case 'discord invite':
                                                            socialIco =
                                                                discordIco
                                                            break
                                                        case 'facebook':
                                                            socialIco =
                                                                facebookIco
                                                            break
                                                        case 'github':
                                                            socialIco =
                                                                githubIco
                                                            break
                                                        case 'instagram':
                                                            socialIco =
                                                                instagramIco
                                                            break
                                                        case 'linkedin':
                                                            socialIco =
                                                                linkedinIco
                                                            break
                                                        case 'onlyfans':
                                                            socialIco =
                                                                onlyfansIco
                                                            break
                                                        case 'telegram':
                                                            socialIco =
                                                                telegramIco
                                                            break
                                                        case 'tiktok':
                                                            socialIco =
                                                                tiktokIco
                                                            break
                                                        case 'twitch':
                                                            socialIco =
                                                                twitchIco
                                                            break
                                                        case 'twitter':
                                                            socialIco =
                                                                twitterIco
                                                            break
                                                        case 'whatsapp':
                                                            socialIco =
                                                                whatsappIco
                                                            break
                                                        case 'youtube':
                                                            socialIco =
                                                                youtubeIco
                                                            break
                                                    }
                                                    if (
                                                        checkIsCommonLink(
                                                            element[1][0].split(
                                                                '#'
                                                            )[0]
                                                        )
                                                    ) {
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={
                                                                    styles.tooltipCommon
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        styles.commonIco
                                                                    }
                                                                    onClick={() =>
                                                                        window.open(
                                                                            `https://${element[1][1]
                                                                                .replaceAll(
                                                                                    'wwww.',
                                                                                    ''
                                                                                )
                                                                                .replaceAll(
                                                                                    'https://',
                                                                                    ''
                                                                                )}`
                                                                        )
                                                                    }
                                                                    key={
                                                                        element
                                                                    }
                                                                >
                                                                    <Image
                                                                        src={
                                                                            socialIco
                                                                        }
                                                                        alt="social-ico"
                                                                    />
                                                                </div>
                                                                {element[1][0].split(
                                                                    '#'
                                                                )[3] && (
                                                                    <div
                                                                        className={
                                                                            styles.tooltiptextCommon
                                                                        }
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                fontSize:
                                                                                    '12px',
                                                                            }}
                                                                        >
                                                                            {
                                                                                element[1][0].split(
                                                                                    '#'
                                                                                )[3]
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    }
                                                }
                                            )}
                                        </div>
                                    )
                                }
                            })}

                        <div className={styles.tooltip}>
                            <div className={styles.tooltiptext}>
                                <div
                                    style={{
                                        fontSize: '12px',
                                    }}
                                >
                                    {t('Send money to', {
                                        name: resolvedInfo?.name,
                                    })}
                                    .did
                                </div>
                            </div>
                            <div
                                onClick={() =>
                                    navigate(
                                        `/${domainNavigate}${resolvedInfo?.name}/didx/funds`
                                    )
                                }
                                className={styles.addFunds}
                            >
                                <div className={styles.addFundsIco}>
                                    <Image src={addIco} alt="ico-add" />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    {t('DONATE')}
                                </div>
                            </div>
                        </div>
                        {doc !== null &&
                            doc?.map((res: any) => {
                                if (res[0] === 'DID services') {
                                    if (!serviceAvailable) {
                                        setServiceAvaliable(true)
                                    }
                                    return (
                                        <div key={res}>
                                            {res[1].map((element: any) => {
                                                let socialIco = othersocialIco
                                                if (
                                                    !checkIsCommonLink(
                                                        element[1][0].split(
                                                            '#'
                                                        )[0]
                                                    )
                                                ) {
                                                    return (
                                                        <div
                                                            onClick={() =>
                                                                window.open(
                                                                    `https://${element[1][1]
                                                                        .replaceAll(
                                                                            'wwww.',
                                                                            ''
                                                                        )
                                                                        .replaceAll(
                                                                            'https://',
                                                                            ''
                                                                        )}`
                                                                )
                                                            }
                                                            key={element}
                                                            className={
                                                                styles.flipCard
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    styles.flipCardInner
                                                                }
                                                            >
                                                                <div
                                                                    style={{
                                                                        backgroundColor: `#${
                                                                            element[1][0].split(
                                                                                '#'
                                                                            )[1]
                                                                        }`,
                                                                        borderColor: `#${
                                                                            element[1][0].split(
                                                                                '#'
                                                                            )[2]
                                                                        }`,
                                                                    }}
                                                                    className={
                                                                        styles.socialCardBack
                                                                    }
                                                                >
                                                                    <div
                                                                        style={{
                                                                            color: `#${
                                                                                element[1][0].split(
                                                                                    '#'
                                                                                )[2]
                                                                            }`,
                                                                        }}
                                                                        className={
                                                                            styles.txtDesc
                                                                        }
                                                                    >
                                                                        {
                                                                            element[1][0].split(
                                                                                '#'
                                                                            )[3]
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        backgroundColor: `#${
                                                                            element[1][0].split(
                                                                                '#'
                                                                            )[2]
                                                                        }`,
                                                                        borderColor: `#${
                                                                            element[1][0].split(
                                                                                '#'
                                                                            )[1]
                                                                        }`,
                                                                    }}
                                                                    className={
                                                                        styles.socialCard
                                                                    }
                                                                >
                                                                    <div
                                                                        style={{
                                                                            color: `#${
                                                                                element[1][0].split(
                                                                                    '#'
                                                                                )[1]
                                                                            }`,
                                                                        }}
                                                                        className={
                                                                            styles.txtSocialCard
                                                                        }
                                                                    >
                                                                        {
                                                                            element[1][0].split(
                                                                                '#'
                                                                            )[0]
                                                                        }
                                                                    </div>
                                                                    <div
                                                                        className={
                                                                            styles.socialCardIco
                                                                        }
                                                                    >
                                                                        <Image
                                                                            width={
                                                                                20
                                                                            }
                                                                            height={
                                                                                20
                                                                            }
                                                                            src={
                                                                                socialIco
                                                                            }
                                                                            alt="social-ico"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            })}
                                        </div>
                                    )
                                }
                            })}
                        {!serviceAvailable && (
                            <div style={{ width: '300px' }}>
                                <code>{t('No data yet.')}</code>
                            </div>
                        )}
                        {controller_ === zilAddr?.base16 && (
                            <div
                                onClick={async () => {
                                    // await connect().then(() => {
                                    // const arConnect = $arconnect.getState()
                                    // if (arConnect) {
                                    navigate(
                                        `${domainNavigate}${resolvedInfo?.name}/didx/wallet/doc/update`
                                    )
                                    // }
                                    // })
                                }}
                                className="button"
                                style={{ marginTop: '50px' }}
                            >
                                {t('UPDATE SOCIAL TREE')}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default Component
