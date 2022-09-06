import Image from 'next/image'
import { toast } from 'react-toastify'
import { SketchPicker } from 'react-color'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import arrowDown from '../../../../../../src/assets/icons/arrow_down_white.svg'
import arrowUp from '../../../../../../src/assets/icons/arrow_up_white.svg'
import defaultCheckmarkLight from '../../../../../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkBlack from '../../../../../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmark from '../../../../../../src/assets/icons/selected_checkmark.svg'
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
import invertIco from '../../../../../../src/assets/icons/invert.svg'
import InfoYellow from '../../../../../../src/assets/icons/warning.svg'
import InfoDefaultReg from '../../../../../../src/assets/icons/info_default.svg'
import InfoDefaultBlack from '../../../../../../src/assets/icons/info_default_black.svg'
import { SocialCard } from '../../../../..'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'
import toastTheme from '../../../../../../src/hooks/toastTheme'

function Component({
    checkIsExistCommon,
    selectCommon,
    selectedCommon,
    commonDiscord,
    setCommonDiscord,
    commonFacebook,
    setCommonFacebook,
    commonGitHub,
    setCommonGitHub,
    commonInstagram,
    setCommonInstagram,
    commonLinkedIn,
    setCommonLinkedIn,
    commonOnlyFans,
    setCommonOnlyFans,
    commonTelegram,
    setCommonTelegram,
    commonTikTok,
    setCommonTikTok,
    commonTwitch,
    setCommonTwitch,
    commonTwitter,
    setCommonTwitter,
    commonWhatsapp,
    setCommonWhatsapp,
    commonYouTube,
    setCommonYouTube,
    showColor,
    setShowColor,
    toggleColorPicker,
    commonActive,
    setCommonActive,
    showCommonDropdown,
    setShowCommonDropdown,
}) {
    const { t } = useTranslation()
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
    const defaultCheckmark = isLight
        ? defaultCheckmarkBlack
        : defaultCheckmarkLight
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
        'Whatsapp',
        'YouTube',
    ]

    const invertColor = (state, setState) => {
        const string =
            state.split('#')[0] +
            '#' +
            state.split('#')[1] +
            '#' +
            state.split('#')[3] +
            '#' +
            state.split('#')[2] +
            '#' +
            state.split('#')[4]
        setState(string)
    }

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
                                {socialDropdown.map((val, i) => (
                                    <div
                                        key={i}
                                        className={styles.option}
                                        onClick={() => selectCommon(val)}
                                    >
                                        {checkIsExistCommon(val) ? (
                                            <div className={styles.optionIco}>
                                                <Image
                                                    src={selectedCheckmark}
                                                    alt="arrow"
                                                />
                                            </div>
                                        ) : (
                                            <div className={styles.optionIco}>
                                                <Image
                                                    src={defaultCheckmark}
                                                    alt="arrow"
                                                />
                                            </div>
                                        )}
                                        <div>{val}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
            {selectedCommon.map((val, i) => {
                let socialIcon
                let state
                let setState
                let baseUrl
                let placeholder
                switch (val) {
                    case 'Discord Invite':
                        socialIcon = discordIco
                        state = commonDiscord
                        setState = setCommonDiscord
                        baseUrl = 'discord.com/invite/'
                        placeholder = 'Type invite URL'
                        break
                    case 'Facebook':
                        socialIcon = facebookIco
                        state = commonFacebook
                        setState = setCommonFacebook
                        baseUrl = 'facebook.com/'
                        placeholder = 'Type username'
                        break
                    case 'GitHub':
                        socialIcon = githubIco
                        state = commonGitHub
                        setState = setCommonGitHub
                        baseUrl = 'github.com/'
                        placeholder = 'Type username'
                        break
                    case 'Instagram':
                        socialIcon = instagramIco
                        state = commonInstagram
                        setState = setCommonInstagram
                        baseUrl = 'instagram.com/'
                        placeholder = 'Type username'
                        break
                    case 'LinkedIn':
                        socialIcon = linkedinIco
                        state = commonLinkedIn
                        setState = setCommonLinkedIn
                        baseUrl = 'linkedin.com/in/'
                        placeholder = 'Type username'
                        break
                    case 'OnlyFans':
                        socialIcon = onlyfansIco
                        state = commonOnlyFans
                        setState = setCommonOnlyFans
                        baseUrl = 'onlyfans.com/'
                        placeholder = 'Type username'
                        break
                    case 'Telegram':
                        socialIcon = telegramIco
                        state = commonTelegram
                        setState = setCommonTelegram
                        baseUrl = 't.me/'
                        placeholder = 'Type username'
                        break
                    case 'TikTok':
                        socialIcon = tiktokIco
                        state = commonTikTok
                        setState = setCommonTikTok
                        baseUrl = 'tiktok.com/@'
                        placeholder = 'Type username'
                        break
                    case 'Twitch':
                        socialIcon = twitchIco
                        state = commonTwitch
                        setState = setCommonTwitch
                        baseUrl = 'twitch.tv/'
                        placeholder = 'Type username'
                        break
                    case 'Twitter':
                        socialIcon = twitterIco
                        state = commonTwitter
                        setState = setCommonTwitter
                        baseUrl = 'twitter.com/'
                        placeholder = 'Type username'
                        break
                    case 'Whatsapp':
                        socialIcon = whatsappIco
                        state = commonWhatsapp
                        setState = setCommonWhatsapp
                        baseUrl = 'wa.me/'
                        placeholder = 'Type phone number'
                        break
                    case 'YouTube':
                        socialIcon = youtubeIco
                        state = commonYouTube
                        setState = setCommonYouTube
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
                                    {val}
                                </div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div
                                    onClick={() =>
                                        setCommonActive(
                                            commonActive === val ? '' : val
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
                                            commonActive === val
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
                        {commonActive === val && (
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
                                                {val === 'Whatsapp' && (
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
                                            <input
                                                className={styles.newLinkForm}
                                                placeholder={t(placeholder)}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => {
                                                    const value =
                                                        event.target.value
                                                    const string =
                                                        state.split('#')[0] +
                                                        '#' +
                                                        value +
                                                        '#' +
                                                        state.split('#')[2] +
                                                        '#' +
                                                        state.split('#')[3] +
                                                        '#' +
                                                        state.split('#')[4]
                                                    setState(string)
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
                                                    value={state.split('#')[4]}
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
                                                            setState(string)
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
                                    <div
                                        style={{
                                            marginTop: '7%',
                                        }}
                                    >
                                        <div style={{ display: 'flex' }}>
                                            <div
                                                style={{
                                                    backgroundColor: `#${
                                                        state.split('#')[2]
                                                    }`,
                                                }}
                                                className={styles.colorBox}
                                                onClick={() =>
                                                    toggleColorPicker(
                                                        `common${state}1`
                                                    )
                                                }
                                            />
                                            <div
                                                onClick={() =>
                                                    invertColor(state, setState)
                                                }
                                                className={styles.invertIco}
                                            >
                                                <Image
                                                    height={20}
                                                    width={20}
                                                    src={invertIco}
                                                    alt="invert-ico"
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    backgroundColor: `#${
                                                        state.split('#')[3]
                                                    }`,
                                                }}
                                                className={styles.colorBox}
                                                onClick={() =>
                                                    toggleColorPicker(
                                                        `common${state}2`
                                                    )
                                                }
                                            />
                                        </div>
                                        {showColor === `common${state}1` && (
                                            <div
                                                style={{
                                                    marginBottom: '3%',
                                                }}
                                            >
                                                <div
                                                    onClick={() =>
                                                        setShowColor('')
                                                    }
                                                    className={
                                                        styles.closeWrapper
                                                    }
                                                />
                                                <div
                                                    className={
                                                        styles.pickerColor
                                                    }
                                                >
                                                    <SketchPicker
                                                        color={`#${
                                                            state.split('#')[2]
                                                        }`}
                                                        onChangeComplete={(
                                                            color
                                                        ) => {
                                                            const string =
                                                                state.split(
                                                                    '#'
                                                                )[0] +
                                                                '#' +
                                                                state.split(
                                                                    '#'
                                                                )[1] +
                                                                '#' +
                                                                color.hex.replace(
                                                                    '#',
                                                                    ''
                                                                ) +
                                                                '#' +
                                                                state.split(
                                                                    '#'
                                                                )[3] +
                                                                '#' +
                                                                state.split(
                                                                    '#'
                                                                )[4]
                                                            setState(string)
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {showColor === `common${state}2` && (
                                            <div
                                                style={{
                                                    marginBottom: '3%',
                                                }}
                                            >
                                                <div
                                                    onClick={() =>
                                                        setShowColor('')
                                                    }
                                                    className={
                                                        styles.closeWrapper
                                                    }
                                                />
                                                <div
                                                    className={
                                                        styles.pickerColor
                                                    }
                                                >
                                                    <SketchPicker
                                                        color={`#${
                                                            state.split('#')[3]
                                                        }`}
                                                        onChangeComplete={(
                                                            color
                                                        ) => {
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
                                                                color.hex.replace(
                                                                    '#',
                                                                    ''
                                                                ) +
                                                                '#' +
                                                                state.split(
                                                                    '#'
                                                                )[4]
                                                            setState(string)
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <SocialCard
                                    label={state.split('#')[0]}
                                    link={state.split('#')[1]}
                                    color1={state.split('#')[2]}
                                    color2={state.split('#')[3]}
                                    description={state.split('#')[4]}
                                />
                            </div>
                        )}
                    </>
                )
            })}
        </>
    )
}

export default Component
