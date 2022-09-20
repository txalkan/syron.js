import Image from 'next/image'
import { toast } from 'react-toastify'
import { SketchPicker } from 'react-color'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import arrowDown from '../../../../../../src/assets/icons/arrow_down_white.svg'
import arrowUp from '../../../../../../src/assets/icons/arrow_up_white.svg'
import l_discordIco from '../../../../../../src/assets/icons/l_discord.svg'
import l_facebookIco from '../../../../../../src/assets/icons/l_facebook.svg'
import l_githubIco from '../../../../../../src/assets/icons/l_github.svg'
import l_instagramIco from '../../../../../../src/assets/icons/l_instagram.svg'
import l_linkedinIco from '../../../../../../src/assets/icons/l_linkedin.svg'
import l_onlyfansIco from '../../../../../../src/assets/icons/l_onlyfans.svg'
import l_telegramIco from '../../../../../../src/assets/icons/l_telegram.svg'
import l_tiktokIco from '../../../../../../src/assets/icons/l_tiktok.svg'
import l_twitchIco from '../../../../../../src/assets/icons/l_twitch.svg'
import l_twitterIco from '../../../../../../src/assets/icons/l_twitter.svg'
import l_whatsappIco from '../../../../../../src/assets/icons/l_whatsapp.svg'
import l_youtubeIco from '../../../../../../src/assets/icons/l_youtube.svg'
import d_discordIco from '../../../../../../src/assets/icons/d_discord.svg'
import d_facebookIco from '../../../../../../src/assets/icons/d_facebook.svg'
import d_githubIco from '../../../../../../src/assets/icons/d_github.svg'
import d_instagramIco from '../../../../../../src/assets/icons/d_instagram.svg'
import d_linkedinIco from '../../../../../../src/assets/icons/d_linkedin.svg'
import d_onlyfansIco from '../../../../../../src/assets/icons/d_onlyfans.svg'
import d_telegramIco from '../../../../../../src/assets/icons/d_telegram.svg'
import d_tiktokIco from '../../../../../../src/assets/icons/d_tiktok.svg'
import d_twitchIco from '../../../../../../src/assets/icons/d_twitch.svg'
import d_twitterIco from '../../../../../../src/assets/icons/d_twitter.svg'
import d_whatsappIco from '../../../../../../src/assets/icons/d_whatsapp.svg'
import d_youtubeIco from '../../../../../../src/assets/icons/d_youtube.svg'
import l_addIco from '../../../../../../src/assets/icons/add_icon.svg'
import d_addIco from '../../../../../../src/assets/icons/add_icon_black.svg'
import minusIco from '../../../../../../src/assets/icons/minus_yellow_icon.svg'
import l_trash from '../../../../../../src/assets/icons/trash.svg'
import d_trash from '../../../../../../src/assets/icons/trash_dark.svg'
import InfoYellow from '../../../../../../src/assets/icons/warning.svg'
import InfoDefaultReg from '../../../../../../src/assets/icons/info_default.svg'
import InfoDefaultBlack from '../../../../../../src/assets/icons/info_default_black.svg'
import defaultCheckmarkDark from '../../../../../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkLight from '../../../../../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmarkDark from '../../../../../../src/assets/icons/selected_checkmark.svg'
import selectedCheckmarkLight from '../../../../../../src/assets/icons/selected_checkmark_dark.svg'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'
import toastTheme from '../../../../../../src/hooks/toastTheme'
import SocialCard from '../SocialCard'
import { useState } from 'react'

function Component({
    selectCommon,
    selectedCommon,
    renderCommon,
    commonActive,
    setCommonActive,
    showCommonDropdown,
    setShowCommonDropdown,
    editCommon,
}) {
    const { t } = useTranslation()
    const [renderSocialCard, setRenderSocialCard] = useState(true)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const InfoDefault = isLight ? InfoDefaultBlack : InfoDefaultReg
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
    const addIco = isLight ? d_addIco : l_addIco
    const trash = isLight ? d_trash : l_trash
    const selectedCheckmark = isLight
        ? selectedCheckmarkLight
        : selectedCheckmarkDark
    const defaultCheckmark = isLight
        ? defaultCheckmarkLight
        : defaultCheckmarkDark
    const socialDropdown = [
        {
            name: 'Discord Invite',
            val: 'Discord##000#000#',
        },
        {
            name: 'Facebook',
            val: 'Facebook##000#000#',
        },
        {
            name: 'GitHub',
            val: 'GitHub##000#000#',
        },
        {
            name: 'Instagram',
            val: 'Instagram##000#000#',
        },
        {
            name: 'LinkedIn',
            val: 'LinkedIn##000#000#',
        },
        {
            name: 'OnlyFans',
            val: 'OnlyFans##000#000#',
        },
        {
            name: 'Telegram',
            val: 'Telegram##000#000#',
        },
        {
            name: 'TikTok',
            val: 'TikTok##000#000#',
        },
        {
            name: 'Twitch',
            val: 'Twitch##000#000#',
        },
        {
            name: 'Twitter',
            val: 'Twitter##000#000#',
        },
        {
            name: 'WhatsApp',
            val: 'WhatsApp##000#000#',
        },
        {
            name: 'YouTube',
            val: 'YouTube##000#000#',
        },
    ]

    return (
        <>
            <div className={styles.commonLinksWrapper}>
                <div className={styles.txt}>{t('COMMON LINKS')}</div>
                <div className={styles.dropdownCheckListWrapper}>
                    <div
                        onClick={() =>
                            setShowCommonDropdown(!showCommonDropdown)
                        }
                        className={styles.dropdownCheckList}
                    >
                        {t('Add new links')}
                        <Image
                            src={showCommonDropdown ? arrowUp : arrowDown}
                            alt="arrow"
                        />
                    </div>
                    {showCommonDropdown && (
                        <>
                            <div
                                onClick={() => setShowCommonDropdown(false)}
                                className={styles.closeWrapper}
                            />
                            <div className={styles.wrapperOption}>
                                {socialDropdown.map((val, i) => {
                                    // if (!renderCommon) {
                                    //     return null
                                    // }
                                    return (
                                        <div
                                            key={i}
                                            className={styles.option}
                                            onClick={() => selectCommon(val)}
                                        >
                                            <div className={styles.optionIco}>
                                                <Image
                                                    width={15}
                                                    height={15}
                                                    src={addIco}
                                                    alt="arrow"
                                                />
                                            </div>
                                            {renderCommon && (
                                                <div>{val.name}</div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
            {selectedCommon.map((val, i) => {
                const state = val.val
                let socialIcon
                let baseUrl
                let placeholder
                switch (val.name) {
                    case 'Discord Invite':
                        socialIcon = discordIco
                        baseUrl = 'discord.com/invite/'
                        placeholder = 'Type invite URL'
                        break
                    case 'Facebook':
                        socialIcon = facebookIco
                        baseUrl = 'facebook.com/'
                        placeholder = 'Type username'
                        break
                    case 'GitHub':
                        socialIcon = githubIco
                        baseUrl = 'github.com/'
                        placeholder = 'Type username'
                        break
                    case 'Instagram':
                        socialIcon = instagramIco
                        baseUrl = 'instagram.com/'
                        placeholder = 'Type username'
                        break
                    case 'LinkedIn':
                        socialIcon = linkedinIco
                        baseUrl = `linkedin.com/${
                            state.split('#')[1]?.includes('company/')
                                ? 'company/'
                                : 'in/'
                        }`
                        placeholder = 'Type username'
                        break
                    case 'OnlyFans':
                        socialIcon = onlyfansIco
                        baseUrl = 'onlyfans.com/'
                        placeholder = 'Type username'
                        break
                    case 'Telegram':
                        socialIcon = telegramIco
                        baseUrl = 't.me/'
                        placeholder = 'Type username'
                        break
                    case 'TikTok':
                        socialIcon = tiktokIco
                        baseUrl = 'tiktok.com/@'
                        placeholder = 'Type username'
                        break
                    case 'Twitch':
                        socialIcon = twitchIco
                        baseUrl = 'twitch.tv/'
                        placeholder = 'Type username'
                        break
                    case 'Twitter':
                        socialIcon = twitterIco
                        baseUrl = 'twitter.com/'
                        placeholder = 'Type username'
                        break
                    case 'WhatsApp':
                        socialIcon = whatsappIco
                        baseUrl = 'wa.me/'
                        placeholder = 'Type phone number'
                        break
                    case 'YouTube':
                        socialIcon = youtubeIco
                        baseUrl = 'youtube.com/'
                        placeholder = 'Type URL'
                        break
                }
                return (
                    <>
                        <div key={i} className={styles.commonService}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Image
                                    width={20}
                                    height={20}
                                    alt="social-ico"
                                    src={socialIcon}
                                />
                                <div className={styles.commonServiceTxt}>
                                    {val.name}
                                </div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div
                                    onClick={() =>
                                        setCommonActive(
                                            commonActive === val.id
                                                ? ''
                                                : val.id
                                        )
                                    }
                                    style={{
                                        cursor: 'pointer',
                                        marginRight: '10px',
                                        marginTop: '1px',
                                    }}
                                >
                                    <Image
                                        src={
                                            commonActive === val.id
                                                ? minusIco
                                                : addIco
                                        }
                                        alt="add-ico"
                                    />
                                </div>
                                <div
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => selectCommon(val)}
                                >
                                    <Image src={trash} alt="trash-ico" />
                                </div>
                            </div>
                        </div>
                        {commonActive === val.id && (
                            <div className={styles.wrapperRenderCard}>
                                <div
                                    style={{
                                        marginBottom: '18px',
                                        marginTop: '0px',
                                    }}
                                    className={styles.replaceLink}
                                >
                                    <div>
                                        <div
                                            style={{
                                                marginBottom: '5%',
                                            }}
                                        >
                                            <h4
                                                style={{
                                                    textTransform: 'lowercase',
                                                }}
                                                className={
                                                    styles.newLinkFormTitle
                                                }
                                            >
                                                {baseUrl}
                                                {val.name === 'WhatsApp' && (
                                                    <span
                                                        className={
                                                            styles.tooltip
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.ico
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    styles.icoDefault
                                                                }
                                                            >
                                                                <Image
                                                                    alt="info-ico"
                                                                    src={
                                                                        InfoDefault
                                                                    }
                                                                    width={20}
                                                                    height={20}
                                                                />
                                                            </div>
                                                            <div
                                                                className={
                                                                    styles.icoColor
                                                                }
                                                            >
                                                                <Image
                                                                    alt="info-ico"
                                                                    src={
                                                                        InfoYellow
                                                                    }
                                                                    width={20}
                                                                    height={20}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span
                                                            className={
                                                                styles.tooltiptext
                                                            }
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        '14px',
                                                                }}
                                                            >
                                                                With the country
                                                                code.
                                                            </div>
                                                        </span>
                                                    </span>
                                                )}
                                            </h4>
                                            {val.name === 'LinkedIn' && (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        marginTop: '10px',
                                                        cursor: 'pointer',
                                                        width: 'fit-content',
                                                    }}
                                                    onClick={() => {
                                                        setCommonActive('')
                                                        const string =
                                                            state.split(
                                                                '#'
                                                            )[0] +
                                                            '#' +
                                                            `${
                                                                state
                                                                    .split(
                                                                        '#'
                                                                    )[1]
                                                                    ?.includes(
                                                                        'company/'
                                                                    )
                                                                    ? 'in/'
                                                                    : 'company/'
                                                            }` +
                                                            state
                                                                .split('#')[1]
                                                                .replaceAll(
                                                                    'in/',
                                                                    ''
                                                                )
                                                                .replaceAll(
                                                                    'company/',
                                                                    ''
                                                                ) +
                                                            '#' +
                                                            state.split(
                                                                '#'
                                                            )[2] +
                                                            '#' +
                                                            state.split(
                                                                '#'
                                                            )[3] +
                                                            '#' +
                                                            state.split('#')[4]
                                                        editCommon(
                                                            val.id,
                                                            string
                                                        )
                                                        setTimeout(() => {
                                                            setCommonActive(
                                                                val.id
                                                            )
                                                        }, 1)
                                                    }}
                                                >
                                                    <div
                                                        className={
                                                            styles.icoTick
                                                        }
                                                    >
                                                        <Image
                                                            src={
                                                                state
                                                                    .split(
                                                                        '#'
                                                                    )[1]
                                                                    ?.includes(
                                                                        'company/'
                                                                    )
                                                                    ? selectedCheckmark
                                                                    : defaultCheckmark
                                                            }
                                                            alt="ico-tick"
                                                        />
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.newLinkFormTitle
                                                        }
                                                    >
                                                        Company account
                                                    </div>
                                                </div>
                                            )}
                                            <input
                                                className={styles.newLinkForm}
                                                placeholder={t(placeholder)}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => {
                                                    const value =
                                                        event.target.value
                                                    if (
                                                        val.name ===
                                                            'WhatsApp' &&
                                                        isNaN(Number(value))
                                                    ) {
                                                        toast.error(
                                                            t(
                                                                'The input is not a number.'
                                                            ),
                                                            {
                                                                position:
                                                                    'top-right',
                                                                autoClose: 2000,
                                                                hideProgressBar:
                                                                    false,
                                                                closeOnClick:
                                                                    true,
                                                                pauseOnHover:
                                                                    true,
                                                                draggable: true,
                                                                progress:
                                                                    undefined,
                                                                theme: toastTheme(
                                                                    isLight
                                                                ),
                                                                toastId: 1,
                                                            }
                                                        )
                                                    } else {
                                                        let value_ = value
                                                        if (
                                                            val.name ===
                                                            'LinkedIn'
                                                        ) {
                                                            value_ =
                                                                `${
                                                                    state
                                                                        .split(
                                                                            '#'
                                                                        )[1]
                                                                        ?.includes(
                                                                            'company/'
                                                                        )
                                                                        ? 'company/'
                                                                        : 'in/'
                                                                }` + value
                                                        }
                                                        const string =
                                                            state.split(
                                                                '#'
                                                            )[0] +
                                                            '#' +
                                                            value_ +
                                                            '#' +
                                                            state.split(
                                                                '#'
                                                            )[2] +
                                                            '#' +
                                                            state.split(
                                                                '#'
                                                            )[3] +
                                                            '#' +
                                                            state.split('#')[4]
                                                        editCommon(
                                                            val.id,
                                                            string
                                                        )
                                                        setRenderSocialCard(
                                                            false
                                                        )
                                                        setTimeout(() => {
                                                            setRenderSocialCard(
                                                                true
                                                            )
                                                        }, 1)
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h4
                                                className={
                                                    styles.newLinkFormTitle
                                                }
                                            >
                                                {t('SHORT DESCRIPTION')}
                                            </h4>
                                            <div
                                                className={
                                                    styles.replaceLinkTextArea
                                                }
                                            >
                                                <textarea
                                                    className={styles.textarea}
                                                    onChange={(event) => {
                                                        const value =
                                                            event.target.value
                                                        if (value.length > 60) {
                                                            toast.error(
                                                                'Max amount of characters is 60.',
                                                                {
                                                                    position:
                                                                        'top-right',
                                                                    autoClose: 6000,
                                                                    hideProgressBar:
                                                                        false,
                                                                    closeOnClick:
                                                                        true,
                                                                    pauseOnHover:
                                                                        true,
                                                                    draggable:
                                                                        true,
                                                                    progress:
                                                                        undefined,
                                                                    theme: toastTheme(
                                                                        isLight
                                                                    ),
                                                                    toastId: 13,
                                                                }
                                                            )
                                                        } else {
                                                            const string =
                                                                state.split(
                                                                    '#'
                                                                )[0] +
                                                                '#' +
                                                                state.split(
                                                                    '#'
                                                                )[1] +
                                                                '#' +
                                                                state.split(
                                                                    '#'
                                                                )[2] +
                                                                '#' +
                                                                state.split(
                                                                    '#'
                                                                )[3] +
                                                                '#' +
                                                                value
                                                            editCommon(
                                                                val.id,
                                                                string
                                                            )
                                                        }
                                                    }}
                                                />
                                                <h4
                                                    className={
                                                        styles.textAreaCount
                                                    }
                                                >
                                                    {state.split('#')[4].length}
                                                    /60
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {renderSocialCard && (
                                    <SocialCard
                                        label={state.split('#')[0]}
                                        link={state.split('#')[1]}
                                        color1={state.split('#')[2]}
                                        color2={state.split('#')[3]}
                                        description={state.split('#')[4]}
                                        isCommon={true}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )
            })}
        </>
    )
}

export default Component
