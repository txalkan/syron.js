import Image from 'next/image'
import styles from './styles.module.scss'
import facebookIco from '../../../../../../src/assets/icons/facebook_icon.svg'
import githubIco from '../../../../../../src/assets/icons/github_icon.svg'
import instagramIco from '../../../../../../src/assets/icons/instagram_icon.svg'
import linkedinIco from '../../../../../../src/assets/icons/linkedin_icon.svg'
import twitterIco from '../../../../../../src/assets/icons/twitter_icon.svg'
import otherIco from '../../../../../../src/assets/icons/othersocial_icon.svg'

function Component({ label, link, color1, color2, description }) {
    let icon
    let link_

    switch (label.toLowerCase()) {
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
        case 'twitter':
            icon = twitterIco
            link_ = 'twitter.com/' + link
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
                    >
                        {label}
                    </div>
                    <div className={styles.socialCardIco}>
                        <Image src={icon} alt="social-ico" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Component
