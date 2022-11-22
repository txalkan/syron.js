import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../../../../src/store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../src/hooks/router'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'
import ThreeDots from '../../../../../Spinner/ThreeDots'
import { $donation, updateDonation } from '../../../../../../src/store/donation'
import CloseIcoReg from '../../../../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../../../../src/assets/icons/ic_cross_black.svg'
import {
    Selector,
    Spinner,
    ZRC6BatchBurn,
    ZRC6BatchMint,
    ZRC6BatchTransferFrom,
    ZRC6Burn,
    ZRC6Mint,
    ZRC6Operator,
    ZRC6SetSpender,
    ZRC6TransferFrom,
} from '../../../../..'
import smartContract from '../../../../../../src/utils/smartContract'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { getSmartContract } = smartContract()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const domainNavigate = domain !== '' ? domain + '@' : ''
    const { navigate } = routerHook()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg
    const styles = isLight ? stylesLight : stylesDark
    const [txName, setTxName] = useState('')
    const [addrName, setAddrName] = useState('')
    const [loadingCollectibles, setLoadingCollectibles] = useState(false)

    const toggleActive = (id: string) => {
        updateDonation(null)
        //resetState()
        if (id === txName) {
            setTxName('')
        } else {
            setTxName(id)
        }
    }

    const handleChangeAddr = (value: string) => {
        if (value !== '') {
            setLoadingCollectibles(true)
            setTimeout(() => {
                setLoadingCollectibles(false)
            }, 1000)
        }
        setTxName('')
        updateDonation(null)
        setAddrName(value)
    }

    const optionAddr = [
        {
            value: 'lexicassi',
            label: 'Lexica.art SSI NFTs',
        },
        {
            value: 'ddk10',
            label: 'DDK10',
        },
    ]

    return (
        <div className={styles.wrapper}>
            {txName !== '' && (
                <div
                    className={styles.closeWrapper}
                    onClick={() => toggleActive('')}
                />
            )}
            <div className={styles.content}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '10%',
                    }}
                >
                    <div className={styles.title}>ZRC6</div>
                </div>
                <div className={styles.picker}>
                    <Selector
                        option={optionAddr}
                        onChange={handleChangeAddr}
                        placeholder="Collectibles name"
                    />
                </div>
                {loadingCollectibles ? (
                    <div style={{ marginTop: '2rem' }}>
                        <Spinner />
                    </div>
                ) : addrName !== '' ? (
                    <div className={styles.cardWrapper}>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('mint')}
                                className={
                                    txName === 'mint'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>MINT</div>
                            </div>
                            {txName === 'mint' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.contentWrapper}>
                                        <ZRC6Mint addrName={addrName} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('batchMint')}
                                className={
                                    txName === 'batchMint'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>BATCH MINT</div>
                            </div>
                            {txName === 'batchMint' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.contentWrapper}>
                                        <ZRC6BatchMint addrName={addrName} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('burn')}
                                className={
                                    txName === 'burn'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>BURN</div>
                            </div>
                            {txName === 'burn' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.contentWrapper}>
                                        <ZRC6Burn addrName={addrName} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('batchBurn')}
                                className={
                                    txName === 'batchBurn'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>BATCH BURN</div>
                            </div>
                            {txName === 'batchBurn' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.contentWrapper}>
                                        <ZRC6BatchBurn addrName={addrName} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('setSpender')}
                                className={
                                    txName === 'setSpender'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>SET SPENDER</div>
                            </div>
                            {txName === 'setSpender' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.contentWrapper}>
                                        <ZRC6SetSpender addrName={addrName} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('addOperator')}
                                className={
                                    txName === 'addOperator'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>ADD OPERATOR</div>
                            </div>
                            {txName === 'addOperator' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.contentWrapper}>
                                        <ZRC6Operator
                                            addrName={addrName}
                                            type="add"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('removeOperator')}
                                className={
                                    txName === 'removeOperator'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>REMOVE OPERATOR</div>
                            </div>
                            {txName === 'removeOperator' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.contentWrapper}>
                                        <ZRC6Operator
                                            addrName={addrName}
                                            type="remove"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('transferFrom')}
                                className={
                                    txName === 'transferFrom'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>TRANSFER FROM</div>
                            </div>
                            {txName === 'transferFrom' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.contentWrapper}>
                                        <ZRC6TransferFrom addrName={addrName} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() =>
                                    toggleActive('batchTransferFrom')
                                }
                                className={
                                    txName === 'batchTransferFrom'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>BATCH TRANSFER FROM</div>
                            </div>
                            {txName === 'batchTransferFrom' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.contentWrapper}>
                                        <ZRC6BatchTransferFrom
                                            addrName={addrName}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </div>
    )
}

export default Component
