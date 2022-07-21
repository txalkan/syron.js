import Image from 'next/image'
import { toast } from 'react-toastify'
import { SketchPicker } from 'react-color'
import styles from './styles.module.scss'
import arrowDown from '../../../../../../src/assets/icons/arrow_down_white.svg'
import arrowUp from '../../../../../../src/assets/icons/arrow_up_white.svg'
import defaultCheckmark from '../../../../../../src/assets/icons/default_checkmark.svg'
import selectedCheckmark from '../../../../../../src/assets/icons/selected_checkmark.svg'
import facebookIco from '../../../../../../src/assets/icons/facebook_icon.svg'
import githubIco from '../../../../../../src/assets/icons/github_icon.svg'
import instagramIco from '../../../../../../src/assets/icons/instagram_icon.svg'
import linkedinIco from '../../../../../../src/assets/icons/linkedin_icon.svg'
import twitterIco from '../../../../../../src/assets/icons/twitter_icon.svg'
import addIco from '../../../../../../src/assets/icons/add_icon.svg'
import minusIco from '../../../../../../src/assets/icons/minus_yellow_icon.svg'
import trash from '../../../../../../src/assets/icons/trash.svg'
import invertIco from '../../../../../../src/assets/icons/invert.svg'
import { SocialCard } from '../../../../..'
import { useTranslation } from 'next-i18next'

function Component({
    checkIsExistCommon,
    selectCommon,
    selectedCommon,
    commonFacebook,
    setCommonFacebook,
    commonGitHub,
    setCommonGitHub,
    commonInstagram,
    setCommonInstagram,
    commonLinkedIn,
    setCommonLinkedIn,
    commonTwitter,
    setCommonTwitter,
    showColor,
    setShowColor,
    toggleColorPicker,
    commonActive,
    setCommonActive,
    showCommonDropdown,
    setShowCommonDropdown,
}) {
    const { t } = useTranslation()
    const socialDropdown = [
        'Facebook',
        'GitHub',
        'Instagram',
        'LinkedIn',
        'Twitter',
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
                <div>{t('COMMON LINKS')}</div>
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
                                    <div key={i} className={styles.option}>
                                        {checkIsExistCommon(val) ? (
                                            <div
                                                onClick={() =>
                                                    selectCommon(val)
                                                }
                                                className={styles.optionIco}
                                            >
                                                <Image
                                                    src={selectedCheckmark}
                                                    alt="arrow"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() =>
                                                    selectCommon(val)
                                                }
                                                className={styles.optionIco}
                                            >
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
                switch (val) {
                    case 'Facebook':
                        socialIcon = facebookIco
                        state = commonFacebook
                        setState = setCommonFacebook
                        break
                    case 'GitHub':
                        socialIcon = githubIco
                        state = commonGitHub
                        setState = setCommonGitHub
                        break
                    case 'Instagram':
                        socialIcon = instagramIco
                        state = commonInstagram
                        setState = setCommonInstagram
                        break
                    case 'LinkedIn':
                        socialIcon = linkedinIco
                        state = commonLinkedIn
                        setState = setCommonLinkedIn
                        break
                    case 'Twitter':
                        socialIcon = twitterIco
                        state = commonTwitter
                        setState = setCommonTwitter
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
                                <Image alt="social-ico" src={socialIcon} />
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
                                                {val.toLowerCase()}
                                                .com/
                                            </h4>
                                            <input
                                                className={styles.newLinkForm}
                                                placeholder="Type username"
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
                                                                    theme: 'dark',
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
                                            marginTop: '5%',
                                        }}
                                    >
                                        <div style={{ display: 'flex' }}>
                                            <h4
                                                style={{
                                                    marginBottom: '3%',
                                                }}
                                                className={
                                                    styles.newLinkFormTitle
                                                }
                                            >
                                                {t('COLOR PALETTE')}
                                            </h4>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    marginLeft: '10px',
                                                }}
                                            >
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
                                                        invertColor(
                                                            state,
                                                            setState
                                                        )
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
