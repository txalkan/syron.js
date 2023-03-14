import * as tyron from 'tyron'
import React, { useEffect, useState } from 'react'
import { useStore } from 'effector-react'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { ZilPayBase } from '../../../../ZilPay/zilpay-base'
import { decryptKey, operationKeyPair } from '../../../../../src/lib/dkms'
import { toast } from 'react-toastify'
import {
    setTxId,
    setTxStatusLoading,
    updateLoginInfoAddress,
    updateLoginInfoArAddress,
    updateLoginInfoUsername,
    updateLoginInfoZilpay,
} from '../../../../../src/app/actions'
import {
    updateDashboardState,
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../src/store/modal'
import { RootState } from '../../../../../src/app/reducers'
import { updateBuyInfo } from '../../../../../src/store/buyInfo'
import { useTranslation } from 'next-i18next'
import Selector from '../../../../Selector'
import routerHook from '../../../../../src/hooks/router'
import { $arconnect } from '../../../../../src/store/arconnect'
import TickIco from '../../../../../src/assets/icons/tick.svg'
import toastTheme from '../../../../../src/hooks/toastTheme'
import ThreeDots from '../../../../Spinner/ThreeDots'
import Arrow from '../../../../Arrow'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const resolvedInfo = useStore($resolvedInfo)
    const arConnect = useStore($arconnect)
    const net = useSelector((state: RootState) => state.modal.net)

    const dispatch = useDispatch()

    const [hideDeactivate, setHideDeactivate] = useState(true)
    const [inputAddr, setInputAddr] = useState('')
    const [address, setAddress] = useState('')
    const [legend, setLegend] = useState('save')
    const [selectedAddress, setSelectedAddress] = useState('')
    const [loadingCard, setLoadingCard] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const domainNavigate =
        resolvedInfo?.domain !== '' ? resolvedInfo?.domain + '@' : ''

    const is_operational =
        resolvedInfo?.status !== tyron.Sidetree.DIDStatus.Deactivated &&
        resolvedInfo?.status !== tyron.Sidetree.DIDStatus.Locked

    const submitDidDeactivate = async () => {
        // @info can't add loading since tx modal will pop up and it will cause error "React state update"
        try {
            if (resolvedInfo !== null) {
                const zilpay = new ZilPayBase()

                const key_: tyron.VerificationMethods.PublicKeyModel = {
                    id: 'deactivate',
                    key: '0x024caf04aa4f660db04adf65daf5b993b3383fcdb2ef0479ca8866b1336334b5b4',
                    encrypted: 'none',
                }
                const deactivate_element: tyron.DocumentModel.DocumentElement[] =
                    [
                        {
                            constructor:
                                tyron.DocumentModel.DocumentConstructor
                                    .VerificationMethod,
                            action: tyron.DocumentModel.Action.Add,
                            key: key_,
                        },
                    ]
                const hash = await tyron.DidCrud.default.HashDocument(
                    deactivate_element
                )
                const addr =
                    selectedAddress === 'SSI' ? resolvedInfo?.addr! : address
                const result: any = await tyron.SearchBarUtil.default.Resolve(
                    net,
                    addr
                )
                //@todo update to empty string && update tyron.js so it returns None
                let signature: string =
                    '87069281eb2df494f82d505ba5cb928c6c47879fad8df1cb7592485f36522a85882120083cfca65a4f5f84d3c3d7bdd252eb6f702da839a75a4ccc6239c7364a'
                if (arConnect !== null) {
                    if (
                        Number(result.version.slice(8, 9)) < 5 ||
                        (Number(result.version.slice(8, 9)) >= 5 &&
                            Number(result.version.slice(10, 11)) <= 3)
                    ) {
                        try {
                            const encrypted_key = result.dkms!.get('recovery')
                            const private_key = await decryptKey(
                                arConnect,
                                encrypted_key
                            )
                            const public_key =
                                zcrypto.getPubKeyFromPrivateKey(private_key)
                            signature = zcrypto.sign(
                                Buffer.from(hash, 'hex'),
                                private_key,
                                public_key
                            )
                        } catch (error) {
                            throw Error('Identity verification unsuccessful.')
                        }
                    } else {
                        try {
                            const encrypted_key = result.dkms!.get('update')
                            const private_key = await decryptKey(
                                arConnect,
                                encrypted_key
                            )
                            const public_key =
                                zcrypto.getPubKeyFromPrivateKey(private_key)
                            signature = zcrypto.sign(
                                Buffer.from(hash, 'hex'),
                                private_key,
                                public_key
                            )
                        } catch (error) {
                            throw Error('Identity verification unsuccessful.')
                        }
                    }
                }
                //@todo add donation
                const tyron_ = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.none,
                    'Uint128'
                )

                const tx_params = await tyron.DidCrud.default.Deactivate({
                    addr:
                        selectedAddress === 'SSI'
                            ? resolvedInfo?.addr!
                            : address,
                    signature: signature,
                    tyron_: tyron_,
                })

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)

                toast.info(
                    `You're about to submit a DID Deactivate operation!`,
                    {
                        position: 'top-center',
                        autoClose: 6000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                    }
                )
                await zilpay
                    .call(
                        {
                            contractAddress:
                                selectedAddress === 'SSI'
                                    ? resolvedInfo?.addr!
                                    : address,
                            transition: 'DidDeactivate',
                            params: tx_params.txParams as unknown as Record<
                                string,
                                unknown
                            >[],
                            amount: String(0),
                        },
                        {
                            gasPrice: '2000',
                            gaslimit: '20000',
                        }
                    )
                    .then(async (res) => {
                        dispatch(setTxId(res.ID))
                        dispatch(setTxStatusLoading('submitted'))
                        try {
                            tx = await tx.confirm(res.ID)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                window.open(
                                    `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                )
                                logOff()
                                navigate(`/`)
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                            }
                        } catch (err) {
                            throw err
                        }
                    })
                    .catch((err) => {
                        throw err
                    })
            }
        } catch (error) {
            dispatch(setTxStatusLoading('rejected'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            toast.error(String(error), {
                position: 'top-right',
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 12,
            })
        }
    }

    const handleOnChangeSelectedAddress = (value) => {
        setAddress('')
        setInputAddr('')
        setSelectedAddress(value)
    }

    const handleInputAddr = (event: { target: { value: any } }) => {
        setAddress('')
        setLegend('save')
        setInputAddr(event.target.value)
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            validateInputAddr()
        }
    }

    const validateInputAddr = () => {
        const addr = tyron.Address.default.verification(inputAddr)
        if (addr !== '') {
            setAddress(addr)
            setLegend('saved')
        } else {
            toast.error(t('Wrong address.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 5,
            })
        }
    }

    const logOff = () => {
        dispatch(updateLoginInfoAddress(null!))
        dispatch(updateLoginInfoUsername(null!))
        dispatch(updateLoginInfoZilpay(null!))
        updateDashboardState(null)
        dispatch(updateLoginInfoArAddress(null!))
        updateBuyInfo(null)
    }

    const option = [
        {
            value: 'SSI',
            label: t('This SSI'),
        },
        {
            value: 'ADDR',
            label: t('Another address'),
        },
    ]

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
            }}
        >
            {/* {contract?.status === tyron.Sidetree.DIDStatus.Deployed && (
        <h2>
          <div
            onClick={() => {
              updateIsController(true);
              navigate(`/${domain}@${username}/didx/wallet/doc/create`);
            }}
            className={styles.flipCard}
          >
            <div className={styles.flipCardInner}>
              <div className={styles.flipCardFront}>
                <div className={styles.cardTitle3}>CREATE</div>
              </div>
              <div className={styles.flipCardBack}>
                <div className={styles.cardTitle2}>GENERATE DID</div>
              </div>
            </div>
          </div>
        </h2>
      )} */}
            {is_operational && (
                <h2>
                    <div
                        onClick={() => {
                            setLoadingCard(true)
                            if (
                                resolvedInfo?.status ===
                                tyron.Sidetree.DIDStatus.Recovered
                            ) {
                                navigate(
                                    `/${domainNavigate}${resolvedInfo?.name}/didx/wallet/doc/recover`
                                )
                            } else {
                                navigate(
                                    `/${domainNavigate}${resolvedInfo?.name}/didx/wallet/doc/update`
                                )
                            }
                            setTimeout(() => {
                                setLoadingCard(false)
                            }, 1000)
                        }}
                        className={styles.flipCard}
                    >
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <div className={styles.cardTitle3}>
                                    {loadingCard ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        t('UPDATE')
                                    )}
                                </div>
                            </div>
                            <div className={styles.flipCardBack}>
                                <div className={styles.cardTitle2}>
                                    {loadingCard ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        t('CHANGE DOCUMENT')
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </h2>
            )}
            {/* <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {is_operational && (
          <h2>
            <div
              onClick={() => {
                updateIsController(true);
                navigate(`/${resolvedInfo?.name}/didx/wallet/doc/recover`);
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <div className={styles.cardTitle3}>RECOVER</div>
                </div>
                <div className={styles.flipCardBack}>
                  <div className={styles.cardTitle2}>reset document</div>
                </div>
              </div>
            </div>
          </h2>
        )}
      </div> */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {is_operational && (
                    <h2>
                        <div
                            onClick={() => {
                                setLoadingCard2(true)
                                navigate(
                                    `/${domainNavigate}${resolvedInfo?.name}/didx/wallet/doc/social`
                                )
                                setTimeout(() => {
                                    setLoadingCard2(false)
                                }, 1000)
                            }}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <div className={styles.cardTitle3}>
                                        {loadingCard2 ? (
                                            <ThreeDots color="yellow" />
                                        ) : (
                                            t('SOCIAL RECOVERY')
                                        )}
                                    </div>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <div className={styles.cardTitle2}>
                                        {loadingCard2 ? (
                                            <ThreeDots color="yellow" />
                                        ) : (
                                            t('CONFIGURE GUARDIANS')
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </h2>
                )}
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: 10,
                }}
            >
                {/* {is_operational &&
          contract?.status !== tyron.Sidetree.DIDStatus.Deployed && ( */}
                {is_operational && (
                    <>
                        {hideDeactivate ? (
                            <>
                                <h5 style={{ color: 'red', marginTop: '10%' }}>
                                    {t('DANGER ZONE')}
                                </h5>
                                <h2>
                                    <div
                                        onClick={() => {
                                            setHideDeactivate(false)
                                        }}
                                        className={styles.flipCard}
                                    >
                                        <div className={styles.flipCardInner}>
                                            <div
                                                className={
                                                    styles.flipCardFront2
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.cardTitle3
                                                    }
                                                >
                                                    {t('DEACTIVATE')}
                                                </div>
                                            </div>
                                            <div
                                                className={styles.flipCardBack}
                                            >
                                                <div
                                                    className={
                                                        styles.cardTitle2
                                                    }
                                                >
                                                    {t(
                                                        'PERMANENT DEACTIVATION'
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </h2>
                            </>
                        ) : (
                            <div style={{ marginTop: '7%' }}>
                                <h2
                                    style={{
                                        color: 'red',
                                        letterSpacing: 'unset',
                                    }}
                                >
                                    {t('DID DEACTIVATE')}
                                </h2>
                                <div>
                                    <Selector
                                        option={option}
                                        onChange={handleOnChangeSelectedAddress}
                                        placeholder={t('Select address')}
                                    />
                                </div>
                                {selectedAddress === 'ADDR' && (
                                    <div className={styles.wrapperInputAddr}>
                                        <input
                                            type="text"
                                            className={styles.txt}
                                            style={{ marginRight: '3%' }}
                                            onChange={handleInputAddr}
                                            onKeyPress={handleOnKeyPress}
                                            placeholder={t('Type address')}
                                        />
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginLeft: '10%',
                                            }}
                                        >
                                            <div onClick={validateInputAddr}>
                                                {legend === 'save' ? (
                                                    <Arrow />
                                                ) : (
                                                    <div
                                                        style={{
                                                            marginTop: '5px',
                                                        }}
                                                    >
                                                        <Image
                                                            width={40}
                                                            src={TickIco}
                                                            alt="tick"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {selectedAddress === 'SSI' ||
                                (selectedAddress === 'ADDR' &&
                                    address !== '') ? (
                                    <div style={{ marginTop: '10%' }}>
                                        <div className={styles.txt}>
                                            {t(
                                                'Are you sure? There is no way back'
                                            )}
                                        </div>
                                        <div style={{ marginTop: '5%' }}>
                                            <button
                                                className={styles.deactivateYes}
                                                onClick={submitDidDeactivate}
                                            >
                                                <div>{t('YES')}</div>
                                            </button>
                                            <button
                                                className={styles.deactivateNo}
                                                onClick={() => {
                                                    setHideDeactivate(true)
                                                    setSelectedAddress('')
                                                    setInputAddr('')
                                                    setAddress('')
                                                }}
                                            >
                                                <div>{t('NO')}</div>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Component
