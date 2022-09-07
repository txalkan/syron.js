import Image from 'next/image'
import styles from './styles.module.scss'
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
import otherIco from '../../../../../../src/assets/icons/othersocial_icon.svg'
import { RootState } from '../../../../../../src/app/reducers'
import { useSelector } from 'react-redux'

function Component({ label, link, color1, color2, description }) {
    const isLight = useSelector((state: RootState) => state.modal.isLight)
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

    let icon
    let link_

    switch (label.toLowerCase()) {
        case 'discord':
            icon = discordIco
            link_ = 'discord.com/invite/' + link
            break
        case 'facebook':
            icon = facebookIco
            link_ = 'facebook.com/' + link
            break
        case 'github':
            icon = githubIco
            link_ = 'github.com/' + link
            break
        case 'instagram':
            icon = instagramIco
            link_ = 'instagram.com/' + link
            break
        case 'linkedin':
            icon = linkedinIco
            link_ = 'linkedin.com/in/' + link
            break
        case 'onlyfans':
            icon = onlyfansIco
            link_ = 'onlyfans.com/' + link
            break
        case 'telegram':
            icon = telegramIco
            link_ = 't.me/' + link
            break
        case 'tiktok':
            icon = tiktokIco
            link_ = 'tiktok.com/@' + link
            break
        case 'twitch':
            icon = twitchIco
            link_ = 'twitch.tv/' + link
            break
        case 'twitter':
            icon = twitterIco
            link_ = 'twitter.com/' + link
            break
        case 'whatsapp':
            icon = whatsappIco
            link_ = 'wa.me/' + link
            break
        case 'youtube':
            icon = youtubeIco
            link_ = 'youtube.com/' + link
            break
        default:
            icon = otherIco
            link_ = link
            break
    }

    return (
        <div
            onClick={() => {
                if (link.length > 0) {
                    window.open(
                        `https://${link_
                            .replaceAll('wwww.', '')
                            .replaceAll('https://', '')}`
                    )
                }
            }}
            key={label}
            className={styles.flipCard}
        >
            <div className={styles.flipCardInner}>
                <div
                    style={{
                        backgroundColor: `#${color1}`,
                        borderColor: `#${color2}`,
                    }}
                    className={styles.socialCardBack}
                >
                    <div
                        style={{
                            color: `#${color2}`,
                        }}
                        className={styles.txtDesc}
                    >
                        {description}
                    </div>
                </div>
                <div
                    style={{
                        backgroundColor: `#${color2}`,
                        borderColor: `#${color1}`,
                    }}
                    className={styles.socialCard}
                >
                    <div
                        style={{
                            fontSize: '18px',
                            color: `#${color1}`,
                        }}
                        className={styles.txtSocialCard}
                    >
                        {label}
                    </div>
                    <div className={styles.socialCardIco}>
                        <Image
                            width={20}
                            height={20}
                            src={icon}
                            alt="social-ico"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Component
