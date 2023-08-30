import React, { useEffect, useState } from 'react'
import { useStore as effectorStore } from 'effector-react'
import Image from 'next/image'
import { $doc } from '../../src/store/did-doc'
import { $loading, $loadingDoc, $loadingTydra } from '../../src/store/loading'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'

import l_discordIco from '../../src/assets/icons/l_discord.svg'
import l_facebookIco from '../../src/assets/icons/l_facebook.svg'
import l_githubIco from '../../src/assets/icons/l_github.svg'
import l_instagramIco from '../../src/assets/icons/l_instagram.svg'
import l_linkedinIco from '../../src/assets/icons/l_linkedin.svg'
import l_onlyfansIco from '../../src/assets/icons/l_onlyfans.svg'
import l_telegramIco from '../../src/assets/icons/l_telegram.svg'
import l_tiktokIco from '../../src/assets/icons/l_tiktok.svg'
import l_twitchIco from '../../src/assets/icons/l_twitch.svg'
import l_twitterIco from '../../src/assets/icons/l_twitter.svg'
import l_whatsappIco from '../../src/assets/icons/l_whatsapp.svg'
import l_youtubeIco from '../../src/assets/icons/l_youtube.svg'
import d_discordIco from '../../src/assets/icons/d_discord.svg'
import d_facebookIco from '../../src/assets/icons/d_facebook.svg'
import d_githubIco from '../../src/assets/icons/d_github.svg'
import d_instagramIco from '../../src/assets/icons/d_instagram.svg'
import d_linkedinIco from '../../src/assets/icons/d_linkedin.svg'
import d_onlyfansIco from '../../src/assets/icons/d_onlyfans.svg'
import d_telegramIco from '../../src/assets/icons/d_telegram.svg'
import d_tiktokIco from '../../src/assets/icons/d_tiktok.svg'
import d_twitchIco from '../../src/assets/icons/d_twitch.svg'
import d_twitterIco from '../../src/assets/icons/d_twitter.svg'
import d_whatsappIco from '../../src/assets/icons/d_whatsapp.svg'
import d_youtubeIco from '../../src/assets/icons/d_youtube.svg'
import othersocialIco from '../../src/assets/icons/othersocial_icon.svg'
import CloseReg from '../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../src/assets/icons/ic_cross_black.svg'
import addIco from '../../src/assets/icons/add_icon.svg'
import ArrowReg from '../../src/assets/icons/right_down.svg'
import ArrowDark from '../../src/assets/icons/right_down_black.svg'
import { useTranslation } from 'next-i18next'
import routerHook from '../../src/hooks/router'
import { RootState } from '../../src/app/reducers'
import { useSelector } from 'react-redux'
import fetch from '../../src/hooks/fetch'
import { useStore } from 'react-stores'
import ThreeDots from '../Spinner/ThreeDots'

function Component() {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const { fetchDoc } = fetch()
    const doc = effectorStore($doc)?.doc
    // const controller_ = useStore($doc)?.controller.toLowerCase()
    // const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)
    const resolvedInfo = useStore($resolvedInfo)
    const loading = effectorStore($loading)
    const loadingDoc = effectorStore($loadingDoc)
    const loadingTydra = effectorStore($loadingTydra)
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

    const openLink = (link) => {
        const link_ = `https://${link
            .replaceAll('wwww.', '')
            .replaceAll('https://', '')}`
        if (link.includes('tyron.network')) {
            window.open(link_, '_self')
        } else {
            window.open(link_)
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

    //@review: consider using wallet instead of domain
    useEffect(() => {
        fetchDoc()
        doc?.map((res: any, i: number) => {
            if (res[0] === 'DID services') {
                if (!serviceAvailable) {
                    setServiceAvaliable(true)
                }
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedInfo?.user_domain])

    if (loadingTydra) {
        return <></>
    }

    return (
        <div className={styles.wrapper}>
            {loading || loadingDoc ? (
                <ThreeDots color="yellow" />
            ) : (
                <>
                    {doc !== null &&
                        doc?.map((res: any, i: number) => {
                            if (res[0] === 'DID services') {
                                // if (!serviceAvailable) {
                                //     setServiceAvaliable(true)
                                // }
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
                                                        socialIco = discordIco
                                                        break
                                                    case 'facebook':
                                                        socialIco = facebookIco
                                                        break
                                                    case 'github':
                                                        socialIco = githubIco
                                                        break
                                                    case 'instagram':
                                                        socialIco = instagramIco
                                                        break
                                                    case 'linkedin':
                                                        socialIco = linkedinIco
                                                        break
                                                    case 'onlyfans':
                                                        socialIco = onlyfansIco
                                                        break
                                                    case 'telegram':
                                                        socialIco = telegramIco
                                                        break
                                                    case 'tiktok':
                                                        socialIco = tiktokIco
                                                        break
                                                    case 'twitch':
                                                        socialIco = twitchIco
                                                        break
                                                    case 'twitter':
                                                        socialIco = twitterIco
                                                        break
                                                    case 'whatsapp':
                                                        socialIco = whatsappIco
                                                        break
                                                    case 'youtube':
                                                        socialIco = youtubeIco
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
                                                                    openLink(
                                                                        element[1][1]
                                                                    )
                                                                }
                                                                key={element}
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
                    {doc !== null && (
                        <>
                            {doc?.map((res: any) => {
                                if (res[0] === 'DID services') {
                                    // if (!serviceAvailable) {
                                    //     setServiceAvaliable(true)
                                    // }
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
                                                                openLink(
                                                                    element[1][1]
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
                        </>
                    )}
                    {/*  @review: asap: Error: The provided `href` (/[username]/tyron/didx/wallet/doc/update) value is missing query values (username) to be interpolated properly. Read more: https://nextjs.org/docs/messages/href-interpolation-failed*/}
                    {/* {controller_ === zilAddr?.base16 && (
                            <div className={styles.button}>
                                <div
                                    onClick={async () => {
                                        navigate(
                                            `${resolvedInfo?.user_domain}/didx/wallet/doc/update`
                                        )
                                    }}
                                    className="button"
                                >
                                    settings
                                    {t('UPDATE SOCIAL TREE')}
                                </div>
                            </div>
                        )} */}
                </>
            )}
        </div>
    )
}

export default Component
