import Image from 'next/image'
import styles from './styles.module.scss'
import d_github from '../../src/assets/icons/soc_github_dark.svg'
import l_github from '../../src/assets/icons/soc_github_light.svg'
import d_twitter from '../../src/assets/icons/soc_twitter_dark.svg'
import l_twitter from '../../src/assets/icons/soc_twitter_light.svg'
import d_instagram from '../../src/assets/icons/soc_instagram_dark.svg'
import l_instagram from '../../src/assets/icons/soc_instagram_light.svg'
import d_discord from '../../src/assets/icons/soc_discord_dark.svg'
import l_discord from '../../src/assets/icons/soc_discord_light.svg'
import d_telegram from '../../src/assets/icons/soc_telegram_dark.svg'
import l_telegram from '../../src/assets/icons/soc_telegram_light.svg'
import d_tiktok from '../../src/assets/icons/soc_tiktok_dark.svg'
import l_tiktok from '../../src/assets/icons/soc_tiktok_light.svg'
import d_linkedin from '../../src/assets/icons/soc_linkedin_dark.svg'
import l_linkedin from '../../src/assets/icons/soc_linkedin_light.svg'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'

function Component({ type }) {
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const githubIco = isLight ? d_github : l_github
    const twitterIco = isLight ? d_twitter : l_twitter
    const instagramIco = isLight ? d_instagram : l_instagram
    // const discordIco = isLight ? d_discord : l_discord
    const telegramIco = isLight ? d_telegram : l_telegram
    // const tiktokIco = isLight ? d_tiktok : l_tiktok
    const linkedinIco = isLight ? d_linkedin : l_linkedin

    const url = window.location.pathname.toLowerCase()
    const path = url
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
        .replace('/ru', '')

    if (type === 'desktop') {
        return (
            <div className={styles.container}>
                <div className={styles.icoWrapper}>
                    <div
                        onClick={() => window.open('https://t.me/tyrondao_org')}
                        className={styles.ico}
                    >
                        <Image
                            src={telegramIco}
                            alt="soc-ico"
                            width={33}
                            height={33}
                        />
                    </div>
                    <div
                        onClick={() =>
                            window.open('https://github.com/tyrondao')
                        }
                        className={styles.ico}
                    >
                        <Image
                            src={githubIco}
                            alt="soc-ico"
                            width={33}
                            height={33}
                        />
                    </div>
                    <div
                        onClick={() =>
                            window.open('https://twitter.com/tyrondao_org')
                        }
                        className={styles.ico}
                    >
                        <Image
                            src={twitterIco}
                            alt="soc-ico"
                            width={33}
                            height={33}
                        />
                    </div>
                    <div
                        onClick={() =>
                            window.open(
                                'https://www.instagram.com/tyrondao_org'
                            )
                        }
                        className={styles.ico}
                    >
                        <Image
                            src={instagramIco}
                            alt="soc-ico"
                            width={33}
                            height={33}
                        />
                    </div>
                    {/* <div
                        onClick={() =>
                            window.open('https://discord.com/invite/7HSvNDJEWm')
                        }
                        className={styles.ico}
                    >
                        <Image src={discordIco} alt="soc-ico" />
                    </div> */}
                    {/* <div
                        onClick={() =>
                            window.open('https://www.tiktok.com/@ssiprotocol')
                        }
                        className={styles.ico}
                    >
                        <Image src={tiktokIco} alt="soc-ico" />
                    </div> */}
                    <div
                        onClick={() =>
                            window.open(
                                'https://www.linkedin.com/company/tyrondao'
                            )
                        }
                        className={styles.ico}
                    >
                        <Image
                            src={linkedinIco}
                            alt="soc-ico"
                            width={33}
                            height={33}
                        />
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div className={styles.container2}>
                <div className={styles.icoWrapper}>
                    <div
                        onClick={() =>
                            window.open('https://github.com/tyrondao')
                        }
                        className={styles.ico2}
                    >
                        <Image
                            src={githubIco}
                            alt="soc-ico"
                            width={22}
                            height={22}
                        />
                    </div>
                    <div
                        onClick={() =>
                            window.open('https://twitter.com/tyrondao_org')
                        }
                        className={styles.ico}
                    >
                        <Image
                            src={twitterIco}
                            alt="soc-ico"
                            width={22}
                            height={22}
                        />
                    </div>
                    {/* <div
                        onClick={() =>
                            window.open('https://discord.com/invite/7HSvNDJEWm')
                        }
                        className={styles.ico}
                    >
                        <Image src={discordIco} alt="soc-ico" />
                    </div> */}
                    {/* <div
                        onClick={() =>
                            window.open('https://www.tiktok.com/@ssiprotocol')
                        }
                        className={styles.ico2}
                    >
                        <Image src={tiktokIco} alt="soc-ico" />
                    </div> */}
                    <div
                        onClick={() =>
                            window.open(
                                'https://www.linkedin.com/company/tyrondao'
                            )
                        }
                        className={styles.ico2}
                    >
                        <Image
                            src={linkedinIco}
                            alt="soc-ico"
                            width={22}
                            height={22}
                        />
                    </div>
                    <div
                        onClick={() =>
                            window.open(
                                'https://www.instagram.com/tyrondao_org'
                            )
                        }
                        className={styles.ico2}
                    >
                        <Image
                            src={instagramIco}
                            alt="soc-ico"
                            width={22}
                            height={22}
                        />
                    </div>
                    <div
                        onClick={() => window.open('https://t.me/tyrondao_org')}
                        className={styles.ico}
                    >
                        <Image
                            src={telegramIco}
                            alt="soc-ico"
                            width={22}
                            height={22}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default Component
