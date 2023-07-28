/*
ZilPay.io
Copyright (c) 2023 by Rinat <https://github.com/hicaru>
All rights reserved.
You acknowledge and agree that ZilPay owns all legal right, title and interest in and to the work, software, application, source code, documentation and any other documents in this file (collectively, the Program), including any intellectual property rights which subsist in the Program (whether those rights happen to be registered or not, and wherever in the world those rights may exist), whether in source code or any other form.
Subject to the limited license below, you may not (and you may not permit anyone else to) distribute, publish, copy, modify, merge, combine with another program, create derivative works of, reverse engineer, decompile or otherwise attempt to extract the source code of, the Program or any part thereof, except that you may contribute to this software.
You are granted a non-exclusive, non-transferable, non-sublicensable license to distribute, publish, copy, modify, merge, combine with another program or create derivative works of the Program (such resulting program, collectively, the Resulting Program) solely for Non-Commercial Use as long as you:
1. give prominent notice (Notice) with each copy of the Resulting Program that the Program is used in the Resulting Program and that the Program is the copyright of ZilPay; and
2. subject the Resulting Program and any distribution, publication, copy, modification, merger therewith, combination with another program or derivative works thereof to the same Notice requirement and Non-Commercial Use restriction set forth herein.
Non-Commercial Use means each use as described in clauses (1)-(3) below, as reasonably determined by ZilPay in its sole discretion:
1. personal use for research, personal study, private entertainment, hobby projects or amateur pursuits, in each case without any anticipated commercial application;
2. use by any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization or government institution; or
3. the number of monthly active users of the Resulting Program across all versions thereof and platforms globally do not exceed 10,000 at any time.
You will not use any trade mark, service mark, trade name, logo of ZilPay or any other company or organization in a way that is likely or intended to cause confusion about the owner or authorized user of such marks, names or logos.
If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at mapu@ssiprotocol.com.*/

import styles from './index.module.scss'

import { useStore } from 'react-stores'
import React from 'react'
// import { useTranslation } from 'next-i18next'
import Image from 'next/image'

import { Modal, ModalHeader } from '../../modal'

import { getIconURL } from '../../../src/lib/viewblock'
// import { formatNumber } from '../../../src//filters/n-format'
import Big from 'big.js'
// import { ZilPayBase } from '../../../src//mixins/zilpay-base'
// import { DragonDex } from '../../../src//mixins/dex'
import { $tokens } from '../../../src//store/tokens'
import { TokenState } from '../../../src/types/token'
// import ThreeDots from '../../Spinner/ThreeDots'
//@ssibrowser
import iconTYRON from '../../../src/assets/icons/ssi_token_Tyron.svg'
import iconS$I from '../../../src/assets/icons/SSI_dollar.svg'
type Prop = {
    show: boolean
    warn?: boolean
    include?: boolean
    exceptions?: string[]
    onClose: () => void
    onSelect: (token: TokenState) => void
}

Big.PE = 999

// @review balance
// const getAmount = (decimals: number, balance?: string) => {
//   if (!balance) {
//     return ''
//   }

//   const qa = Big(String(balance))
//   const decimal = Big(10 ** decimals)
//   const value = qa.div(decimal)

//   return formatNumber(Number(value))
// }

// const zilpay = new ZilPayBase()
//const dex = new DragonDex()
export var TokensModal: React.FC<Prop> = function ({
    show,
    onClose,
    onSelect,
    exceptions = [],
    // warn = false,
    include = false,
}) {
    // const common = useTranslation(`common`)
    // const loginInfo = useSelector((state: RootState) => state.modal)
    // const wallet = loginInfo.zilAddr //@reviewasap use of wallet - should be DEFIxWALLET
    const tokensStore = useStore($tokens)
    // console.log('tyrondex:', JSON.stringify(tokensStore))

    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const lazyRoot = React.useRef(null)

    // const [isImport, setImport] = React.useState(false)
    // const [loading, setLoading] = React.useState(false)
    // const [base16, setBase16] = React.useState('')
    const [search, setSearch] = React.useState('')

    const tokens = React.useMemo(() => {
        return tokensStore.tokens.filter((t) =>
            t.meta.symbol.toLowerCase().includes(search.toLowerCase())
        )
    }, [tokensStore, search])

    // const handleInput = React.useCallback(
    //   async (event: React.FormEvent<HTMLInputElement>) => {
    //     try {
    //       const zp = await zilpay.zilpay()
    //       const base16 = zp.crypto.fromBech32Address(
    //         (event.target as HTMLInputElement).value
    //       )

    //       setBase16(base16)
    //     } catch {
    //       ///
    //     }
    //   },
    //   []
    // )

    // const handleAddToken = React.useCallback(async () => {
    //   if (!wallet?.base16) return

    //   setLoading(true)
    //   try {
    //     await dex.addCustomToken(base16, wallet.base16)
    //     setImport(false)
    //   } catch (err) {
    //     console.warn(err)
    //     ///
    //   }
    //   setLoading(false)
    // }, [wallet, base16])

    const handleOnSelect = React.useCallback(
        (token: TokenState) => {
            if (exceptions.includes(token.base16)) {
                return
            }

            onSelect(token)
        },
        [exceptions]
    )

    const handleSubmit = React.useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const [first] = tokens

            if (first) {
                handleOnSelect(first.meta)
            }
        },
        [tokens]
    )

    React.useEffect(() => {
        if (show && inputRef.current) {
            inputRef.current.focus()
        }
    }, [inputRef, show])

    return (
        <Modal
            show={show}
            // title={(
            //   <ModalHeader onClose={onClose}>
            //     {common.t(`tokens.title`)}
            //   </ModalHeader>
            // )}
            // width="400px"
            onClose={onClose}
        >
            <div className={styles.modalContainer}>
                <ModalHeader onClose={onClose}>
                    <span className={styles.title}>Tokens</span>
                </ModalHeader>
                {/* @review {warn ? (
          <div className={styles.warnwrapper}>
            <p className={styles.warn}>{common.t('tokens.warn')}</p>
          </div>
        ) : null} */}
                {/* {isImport ? (
          <div className={styles.import}>
            <div>
              <p>
                This token doesn&apos;t appear on the active token
                list(s). Make sure this is the token that you
                want to trade.
              </p>
            </div>
            <input
              type="text"
              placeholder="input contract address"
              onInput={handleInput}
            />
            <div
              style={{
                width: '100%',
                justifyContent: 'space-between',
                display: 'flex',
                marginTop: '10px',
              }}
            >
              <div
                style={{ width: '45%' }}
                className={`button ${!Boolean(base16) ? 'disabled' : 'primary'
                  }`}
                // disabled={!Boolean(base16)}
                onClick={handleAddToken}
              >
                {loading ? <ThreeDots color="yellow" /> : 'Add'}
              </div>
              <div
                style={{ width: '45%' }}
                className="button"
                onClick={() => setImport(false)}
              >
                <div>Cancel</div>
              </div>
            </div>
          </div>
        ) : ( */}
                <form className={styles.listwarp} onSubmit={handleSubmit}>
                    <input
                        className={styles.search}
                        placeholder={'Symbol'}
                        ref={inputRef}
                        onInput={(event) =>
                            setSearch(event.currentTarget.value)
                        }
                    />
                    <ul className={styles.container} ref={lazyRoot}>
                        {tokens
                            .slice()
                            .reverse()
                            .map((token) => (
                                <li
                                    key={token.meta.base16}
                                    className={styles.tokencard}
                                    onClick={() => handleOnSelect(token.meta)}
                                >
                                    <Image
                                        src={
                                            token.meta.symbol === 'TYRON'
                                                ? iconTYRON
                                                : token.meta.symbol === 'S$I'
                                                ? iconS$I
                                                : getIconURL(token.meta.bech32)
                                        }
                                        alt={token.meta.symbol}
                                        lazyRoot={lazyRoot}
                                        height="35"
                                        width="35"
                                    />
                                    <div className={styles.tokenwrapper}>
                                        <p className={styles.left}>
                                            {token.meta.symbol}
                                        </p>
                                        <p className={styles.right}>
                                            {token.meta.name}
                                        </p>
                                    </div>
                                    {/* <p> @review
                  {String(
                    getAmount(
                      token.meta.decimals,
                      token.balance[
                      String(
                        wallet?.base16
                      ).toLowerCase()
                      ]
                    )
                  )}
                </p> */}
                                </li>
                            ))}
                    </ul>
                </form>
                {/* )} */}
                {/* <div className={styles.include}>
          {include && !isImport ? (
            <p
              className="button secondary"
              onClick={() => setImport(true)}
            >
              Import
            </p>
          ) : null}
        </div> */}
            </div>
        </Modal>
    )
}
