import React, { useState } from 'react'
import { useStore } from 'effector-react'
import {
    $modalGetStarted,
    updateModalGetStarted,
} from '../../../src/store/modal'
import PowerIconReg from '../../../src/assets/icons/power_icon.svg'
import PowerIconBlack from '../../../src/assets/icons/power_icon_black.svg'
import ArrowDownReg from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'
import ArrowDownBlack from '../../../src/assets/icons/dashboard_arrow_down_icon_black.svg'
import ArrowUp from '../../../src/assets/icons/arrow_up_icon.svg'
import Warning from '../../../src/assets/icons/warning.svg'
import InfoDefault from '../../../src/assets/icons/info_default.svg'
import c1Reg from '../../../src/assets/icons/checkpoint_1.svg'
import c2Reg from '../../../src/assets/icons/checkpoint_2.svg'
import c3Reg from '../../../src/assets/icons/checkpoint_3.svg'
import c4Reg from '../../../src/assets/icons/checkpoint_4.svg'
import c5Reg from '../../../src/assets/icons/checkpoint_5.svg'
import c6Reg from '../../../src/assets/icons/checkpoint_6.svg'
import c7Reg from '../../../src/assets/icons/checkpoint_7.svg'
import c1Black from '../../../src/assets/icons/checkpoint_1_dark.svg'
import c2Black from '../../../src/assets/icons/checkpoint_2_dark.svg'
import c3Black from '../../../src/assets/icons/checkpoint_3_dark.svg'
import c4Black from '../../../src/assets/icons/checkpoint_4_dark.svg'
import c5Black from '../../../src/assets/icons/checkpoint_5_dark.svg'
import c6Black from '../../../src/assets/icons/checkpoint_6_dark.svg'
import c7Black from '../../../src/assets/icons/checkpoint_7_dark.svg'
import cs from '../../../src/assets/icons/checkpoint_selected.svg'
import Close from '../../../src/assets/icons/ic_cross.svg'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'

function Component() {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const c1 = isLight ? c1Black : c1Reg
    const c2 = isLight ? c2Black : c2Reg
    const c3 = isLight ? c3Black : c3Reg
    const c4 = isLight ? c4Black : c4Reg
    const c5 = isLight ? c5Black : c5Reg
    const c6 = isLight ? c6Black : c6Reg
    const c7 = isLight ? c7Black : c7Reg
    const PowerIcon = isLight ? PowerIconBlack : PowerIconReg
    const ArrowDown = isLight ? ArrowDownBlack : ArrowDownReg
    const [active, setActive] = useState(0)
    const [modalInfo, setModalInfo] = useState(false)
    const [checkedStep, setCheckedStep] = useState(Array())
    const modalGetStarted = useStore($modalGetStarted)

    const menuActive = (id) => {
        setCheckedStep([...checkedStep, active])
        if (active === id) {
            setActive(0)
        } else {
            setActive(id)
        }
    }

    const isChecked = (id) => {
        if (checkedStep.some((val) => val === id)) {
            return true
        } else {
            return false
        }
    }

    if (!modalGetStarted) {
        return null
    }

    return (
        <>
            <div
                onClick={() => updateModalGetStarted(false)}
                className={styles.outerWrapper}
            />
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div
                            onClick={() => updateModalGetStarted(false)}
                            className="closeIcon"
                        >
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={15}
                                height={15}
                            />
                        </div>
                        <div>
                            <Image
                                alt="power-ico"
                                src={PowerIcon}
                                width={30}
                                height={30}
                            />
                        </div>
                        <h5 className={styles.headerTxt}>
                            {t('YOUR QUICKSTART GUIDE')}
                        </h5>
                    </div>
                    <div className={styles.contentWrapper}>
                        <div className={styles.rowWrapper}>
                            <div
                                onClick={() => menuActive(1)}
                                className={styles.rowHeader}
                            >
                                <div className={styles.rowHeaderContent}>
                                    <div>
                                        {isChecked(1) ? (
                                            <Image
                                                alt="point-1"
                                                src={cs}
                                                width={25}
                                                height={25}
                                            />
                                        ) : (
                                            <Image
                                                alt="point-1"
                                                src={c1}
                                                width={25}
                                                height={25}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.rowHeaderTitle}>
                                        {t('Zilliqa blockchain')}
                                    </div>
                                </div>
                                <div className={styles.wrapperDropdownIco}>
                                    {active === 1 ? (
                                        <Image
                                            alt="arrow-up"
                                            src={ArrowUp}
                                            width={20}
                                            height={20}
                                        />
                                    ) : (
                                        <Image
                                            alt="arrow-down"
                                            src={ArrowDown}
                                            width={20}
                                            height={20}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.rowContent}>
                                {active === 1 ? (
                                    <>
                                        <p className={styles.rowContentTxt}>
                                            {t('Connect your Zilliqa wallet')}
                                        </p>
                                        <div className={styles.rowContentTxt}>
                                            <br />
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Go to')}{' '}
                                                    <a
                                                        className={
                                                            styles.linkColor
                                                        }
                                                        href="https://zilpay.io/"
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        zilpay.io
                                                    </a>{' '}
                                                    {t(
                                                        'and click on GET CHROME EXTENSION. Once you have installed the extension, get into it and click Create to generate a new account.'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'You will see a list of words that make up your secret phrase. You must write these words down in a safe place. Remember that the words must be ordered and spelt correctly. You can choose between 12 and 24 words.'
                                                    )}{' '}
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
                                                                    alt="warning-ico"
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
                                                                    alt="warning-ico"
                                                                    src={
                                                                        Warning
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
                                                            <h5
                                                                className={
                                                                    styles.modalInfoTitle
                                                                }
                                                            >
                                                                {t('INFO')}
                                                            </h5>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        '12px',
                                                                }}
                                                            >
                                                                {t(
                                                                    'Although the words shown at the beginning are 8, your secret phrase is made up of 12 or 24 words. To see the complete list, click between the words in the list and press the down-arrow button repeatedly on your keyboard until you see the total number of words'
                                                                )}
                                                            </div>
                                                        </span>
                                                    </span>
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Verify your secret phrase by clicking on the words in the correct order. Then, click on Continue.'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        "Now it's time to create your ZilPay username and password. Lastly, Accept Privacy Policy and Continue to finish."
                                                    )}
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <p className={styles.rowContentTxt}>
                                        {t('Connect your Zilliqa wallet')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className={styles.rowWrapper}>
                            <div
                                onClick={() => menuActive(2)}
                                className={styles.rowHeader}
                            >
                                <div className={styles.rowHeaderContent}>
                                    <div>
                                        {isChecked(2) ? (
                                            <Image
                                                alt="point-1"
                                                src={cs}
                                                width={25}
                                                height={25}
                                            />
                                        ) : (
                                            <Image
                                                alt="point-1"
                                                src={c2}
                                                width={25}
                                                height={25}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.rowHeaderTitle}>
                                        {t('Arweave blockchain')}
                                    </div>
                                </div>
                                <div className={styles.wrapperDropdownIco}>
                                    {active === 2 ? (
                                        <Image
                                            alt="arrow-up"
                                            src={ArrowUp}
                                            width={20}
                                            height={20}
                                        />
                                    ) : (
                                        <Image
                                            alt="arrow-down"
                                            src={ArrowDown}
                                            width={20}
                                            height={20}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.rowContent}>
                                {active === 2 ? (
                                    <>
                                        <p className={styles.rowContentTxt}>
                                            {t('Connect your Arweave wallet')}
                                        </p>
                                        <div className={styles.rowContentTxt}>
                                            <br />
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Go to')}{' '}
                                                    <a
                                                        className={
                                                            styles.linkColor
                                                        }
                                                        href="https://www.arconnect.io/ "
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        arconnect.io
                                                    </a>{' '}
                                                    {t(
                                                        'and click on Download ArConnect. Once you have installed the chrome extension, a new tab will appear where you will be asked to create a password for your new Arweave wallet, called ArConnect.'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Generate your password, and click on Create.'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Next, select New Wallet'
                                                    )}{' '}
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
                                                                    alt="warning-ico"
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
                                                                    alt="warning-ico"
                                                                    src={
                                                                        Warning
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
                                                            <h5
                                                                className={
                                                                    styles.modalInfoTitle
                                                                }
                                                            >
                                                                {t('INFO')}
                                                            </h5>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        '12px',
                                                                }}
                                                            >
                                                                {t(
                                                                    'Your SSI uses this wallet for encryption and decryption of data, and soon to make transactions on the permaweb as well!'
                                                                )}
                                                            </div>
                                                        </span>
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <p className={styles.rowContentTxt}>
                                        {t('Connect your Arweave wallet')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className={styles.rowWrapper}>
                            <div
                                onClick={() => menuActive(3)}
                                className={styles.rowHeader}
                            >
                                <div className={styles.rowHeaderContent}>
                                    <div>
                                        {isChecked(3) ? (
                                            <Image
                                                alt="point-3"
                                                src={cs}
                                                width={25}
                                                height={25}
                                            />
                                        ) : (
                                            <Image
                                                alt="point-3"
                                                src={c3}
                                                width={25}
                                                height={25}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.rowHeaderTitle}>
                                        {t('TYRON Network')}
                                    </div>
                                </div>
                                <div className={styles.wrapperDropdownIco}>
                                    {active === 3 ? (
                                        <Image
                                            alt="arrow-up"
                                            src={ArrowUp}
                                            width={20}
                                            height={20}
                                        />
                                    ) : (
                                        <Image
                                            alt="arrow-down"
                                            src={ArrowDown}
                                            width={20}
                                            height={20}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.rowContent}>
                                {active === 3 ? (
                                    <>
                                        <p className={styles.rowContentTxt}>
                                            {t(
                                                'Create your self-sovereign identity'
                                            )}
                                        </p>
                                        <div className={styles.rowContentTxt}>
                                            <br />
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        "Click on CONNECT in the top right corner, and approve the connection between your Zilliqa wallet and the TYRON Network's open-source web application."
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Click on LOG IN and then New User. This step will connect your Arweave wallet as well.'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Confirm with ZilPay. The cost to create your SSI is around 1 ZIL'
                                                    )}{' '}
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
                                                                    alt="warning-ico"
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
                                                                    alt="warning-ico"
                                                                    src={
                                                                        Warning
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
                                                            <h5
                                                                className={
                                                                    styles.modalInfoTitle
                                                                }
                                                            >
                                                                {t('INFO')}
                                                            </h5>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        '12px',
                                                                }}
                                                            >
                                                                {t(
                                                                    'Your Zilliqa wallet needs to have at least 90 ZIL since the gas limit to deploy a new contract (contract creation) is 45,000 units of gas at 0.002 ZIL per unit (which is the minimum possible blockchain gas price). However, the actual cost is around 1 ZIL.'
                                                                )}
                                                            </div>
                                                        </span>
                                                    </span>
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Click on your new self-sovereign identity address and explore its data on Devex.'
                                                    )}
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <p className={styles.rowContentTxt}>
                                        {t(
                                            'Create your self-sovereign identity'
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className={styles.rowWrapper}>
                            <div
                                onClick={() => menuActive(4)}
                                className={styles.rowHeader}
                            >
                                <div className={styles.rowHeaderContent}>
                                    <div>
                                        {isChecked(4) ? (
                                            <Image
                                                alt="point-4"
                                                src={cs}
                                                width={25}
                                                height={25}
                                            />
                                        ) : (
                                            <Image
                                                alt="point-4"
                                                src={c4}
                                                width={25}
                                                height={25}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.rowHeaderTitle}>
                                        {t('NFT Username')}
                                    </div>
                                </div>
                                <div className={styles.wrapperDropdownIco}>
                                    {active === 4 ? (
                                        <Image
                                            alt="arrow-up"
                                            src={ArrowUp}
                                            width={20}
                                            height={20}
                                        />
                                    ) : (
                                        <Image
                                            alt="arrow-down"
                                            src={ArrowDown}
                                            width={20}
                                            height={20}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.rowContent}>
                                {active === 4 ? (
                                    <>
                                        <p className={styles.rowContentTxt}>
                                            {t(
                                                'Search for a username and buy it with your decentralized identity'
                                            )}
                                        </p>
                                        <div className={styles.rowContentTxt}>
                                            <br />
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'You can buy an available username with your SSI (either a new SSI smart contract or an existing SSI).'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Click on Select recipient and choose This SSI to buy the NFT Username for your SSI. Alternatively, you can buy this username and assign it to any other address by selecting Another address. If you choose to use the username for another address, type this address and Continue'
                                                    )}{' '}
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
                                                                    alt="warning-ico"
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
                                                                    alt="warning-ico"
                                                                    src={
                                                                        Warning
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
                                                            <h5
                                                                className={
                                                                    styles.modalInfoTitle
                                                                }
                                                            >
                                                                INFO
                                                            </h5>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        '12px',
                                                                }}
                                                            >
                                                                {t(
                                                                    'The recipient of the NFT Username can be your SSI or another address of your choice. Either way, your SSI is the owner of the NFT, which means that your Decentralized Identifier (DID) is the controller of the username.'
                                                                )}
                                                            </div>
                                                        </span>
                                                    </span>
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Choose a payment option in Select payment. Options are TYRON, $SI and other stablecoins such as XSGD and zUSDT.'
                                                    )}
                                                </li>
                                            </ul>
                                            <p>
                                                {t(
                                                    'If you are using a new SSI, new smart contracts do not have funds yet to purchase a username. Or, if your existing SSI does not have enough coins, you can add funds to proceed.'
                                                )}
                                            </p>
                                            <h6>{t('ADD FUNDS')}</h6>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Click on Select originator, and choose ZilPay to add funds from your ZilPay wallet. You can also add funds from any other decentralized identity that you control.'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Enter the amount you want to transfer to your SSI and PROCEED with the transfer.'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'When your SSI has enough funds, click on BUY NFT USERNAME and confirm with ZilPay.'
                                                    )}
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <p className={styles.rowContentTxt}>
                                        {t(
                                            'Search for a username and buy it with your decentralized identity'
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className={styles.rowWrapper}>
                            <div
                                onClick={() => menuActive(5)}
                                className={styles.rowHeader}
                            >
                                <div className={styles.rowHeaderContent}>
                                    <div>
                                        {isChecked(5) ? (
                                            <Image
                                                alt="point-5"
                                                src={cs}
                                                width={25}
                                                height={25}
                                            />
                                        ) : (
                                            <Image
                                                alt="point-5"
                                                src={c5}
                                                width={25}
                                                height={25}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.rowHeaderTitle}>
                                        {t('DID Update')}
                                    </div>
                                </div>
                                <div className={styles.wrapperDropdownIco}>
                                    {active === 5 ? (
                                        <Image
                                            alt="arrow-up"
                                            src={ArrowUp}
                                            width={20}
                                            height={20}
                                        />
                                    ) : (
                                        <Image
                                            alt="arrow-down"
                                            src={ArrowDown}
                                            width={20}
                                            height={20}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.rowContent}>
                                {active === 5 ? (
                                    <>
                                        <p className={styles.rowContentTxt}>
                                            {t(
                                                'Update your Decentralized Identity Document'
                                            )}
                                        </p>
                                        <div className={styles.rowContentTxt}>
                                            <br />
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Log in with your SSI.')}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Search for its NFT Username or click on it in the LOGGED IN dashboard to access your SSI.'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Click on WALLET, next on DID OPERATIONS and then on UPDATE.'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Replace a DID Key (Verification Method) if you wish so.'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Add SERVICES to publicly share web addresses that are relevant to you, such as your personal or work sites, blockchain addresses like Bitcoin, and more'
                                                    )}{' '}
                                                    <span
                                                        className={
                                                            styles.tooltip
                                                        }
                                                    >
                                                        <div
                                                            onClick={() =>
                                                                setModalInfo(
                                                                    !modalInfo
                                                                )
                                                            }
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
                                                                    alt="warning-ico"
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
                                                                    alt="warning-ico"
                                                                    src={
                                                                        Warning
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
                                                            <h5
                                                                className={
                                                                    styles.modalInfoTitle
                                                                }
                                                            >
                                                                {t('INFO')}
                                                            </h5>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        '12px',
                                                                }}
                                                            >
                                                                {t(
                                                                    'You can have as many DID Services as you wish. If you want to add more services, write down how many you want in the Type amount input box.'
                                                                )}
                                                            </div>
                                                        </span>
                                                    </span>
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Continue, and you can donate ZIL to the Donate DApp.'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'To finish, click on UPDATE DID and confirm with ZilPay.'
                                                    )}
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <p className={styles.rowContentTxt}>
                                        {t(
                                            'Update your Decentralized Identity Document'
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className={styles.rowWrapper}>
                            <div
                                onClick={() => menuActive(6)}
                                className={styles.rowHeader}
                            >
                                <div className={styles.rowHeaderContent}>
                                    <div>
                                        {isChecked(6) ? (
                                            <Image
                                                alt="point-6"
                                                src={cs}
                                                width={25}
                                                height={25}
                                            />
                                        ) : (
                                            <Image
                                                alt="point-6"
                                                src={c6}
                                                width={25}
                                                height={25}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.rowHeaderTitle}>
                                        {t('Social Recovery')}
                                    </div>
                                </div>
                                <div className={styles.wrapperDropdownIco}>
                                    {active === 6 ? (
                                        <Image
                                            alt="arrow-up"
                                            src={ArrowUp}
                                            width={20}
                                            height={20}
                                        />
                                    ) : (
                                        <Image
                                            alt="arrow-down"
                                            src={ArrowDown}
                                            width={20}
                                            height={20}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.rowContent}>
                                {active === 6 ? (
                                    <>
                                        <p className={styles.rowContentTxt}>
                                            {t('Configure DID Social Recovery')}
                                        </p>
                                        <div className={styles.rowContentTxt}>
                                            <br />
                                            <p>
                                                {t(
                                                    'With Social Recovery, you can update the DID Controller address of your decentralized identity with the help of your guardians. This security feature is super helpful if you lose control of your Zilliqa wallet.'
                                                )}
                                            </p>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Log in with your SSI, and access its dashboard by searching for its username.'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Click on WALLET, next on DID OPERATIONS and then select SOCIAL RECOVERY.'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Choose how many guardians you would like for your SSI'
                                                    )}{' '}
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
                                                                    alt="warning-ico"
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
                                                                    alt="warning-ico"
                                                                    src={
                                                                        Warning
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
                                                            <h5
                                                                className={
                                                                    styles.modalInfoTitle
                                                                }
                                                            >
                                                                {t('INFO')}
                                                            </h5>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        '12px',
                                                                }}
                                                            >
                                                                {t(
                                                                    'You can have an unlimited amount of guardians. To social recover your account, you need the signatures that correspond to half the amount of guardians + 1 extra signature. As a minimum, you need at least three signatures to execute social recovery.'
                                                                )}
                                                            </div>
                                                        </span>
                                                    </span>
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Type the NFT Usernames of your guardians, click on CONTINUE and then on CONFIGURE DID SOCIAL RECOVERY. Confirm with ZilPay.'
                                                    )}
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <p className={styles.rowContentTxt}>
                                        {t('Configure DID Social Recovery')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className={styles.rowWrapper}>
                            <div
                                onClick={() => menuActive(7)}
                                className={styles.rowHeader}
                            >
                                <div className={styles.rowHeaderContent}>
                                    <div>
                                        {isChecked(7) ? (
                                            <Image
                                                alt="point-7"
                                                src={cs}
                                                width={25}
                                                height={25}
                                            />
                                        ) : (
                                            <Image
                                                alt="point-7"
                                                src={c7}
                                                width={25}
                                                height={25}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.rowHeaderTitle}>
                                        {t('ADD_FUNDS')}
                                    </div>
                                </div>
                                <div className={styles.wrapperDropdownIco}>
                                    {active === 7 ? (
                                        <Image
                                            alt="arrow-up"
                                            src={ArrowUp}
                                            width={20}
                                            height={20}
                                        />
                                    ) : (
                                        <Image
                                            alt="arrow-down"
                                            src={ArrowDown}
                                            width={20}
                                            height={20}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.rowContent}>
                                {active === 7 ? (
                                    <>
                                        <p className={styles.rowContentTxt}>
                                            {t('Top up a DIDxWallet')}
                                        </p>
                                        <div className={styles.rowContentTxt}>
                                            <br />
                                            <p>
                                                {t(
                                                    'You can add funds to any SSI by searching for its Username and selecting the ADD FUNDS card.'
                                                )}
                                            </p>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Click on Select originator and choose ZilPay to send funds from your Zilliqa wallet or Decentralized identity to add funds from another SSI that you control'
                                                    )}{' '}
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
                                                                    alt="warning-ico"
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
                                                                    alt="warning-ico"
                                                                    src={
                                                                        Warning
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
                                                            <h5
                                                                className={
                                                                    styles.modalInfoTitle
                                                                }
                                                            >
                                                                {t('INFO')}
                                                            </h5>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        '12px',
                                                                }}
                                                            >
                                                                {t(
                                                                    'If you have chosen to send funds from your decentralized identity, log in either with its NFT Username or address.'
                                                                )}
                                                            </div>
                                                        </span>
                                                    </span>
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'On Select coin, choose the currency and enter the amount you wish to transfer in Type amount. When the originator of the transfer is your SSI, you can donate to the Donate DApp and earn xPoints!'
                                                    )}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Continue to TRANSFER and confirm this transaction with ZilPay.'
                                                    )}
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <p className={styles.rowContentTxt}>
                                        {t('Top up a DIDxWallet')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Component
