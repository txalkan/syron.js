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
import type { TokenState } from '../../src/types/token'
import Image from 'next/image'
import React from 'react'
import { getIconURL } from '../../src/lib/viewblock'

//@ssibrowser
import icoTYRON from '../../src/assets/icons/ssi_token_Tyron.svg'
import icoS$I from '../../src/assets/icons/SSI_dollar.svg'
//@zilpay
type Prop = {
    tokens: TokenState[]
}

export const ImagePair: React.FC<Prop> = ({ tokens }) => {
    return (
        <div className={styles.imgwrap}>
            {tokens.map((el) => (
                <Image
                    src={
                        el.symbol === 'TYRON'
                            ? icoTYRON
                            : el.symbol === 'S$I'
                              ? icoS$I
                              : getIconURL(el.bech32)
                    }
                    alt={el.symbol}
                    key={el.symbol}
                    height="35"
                    width="35"
                    className={styles.symbol}
                />
            ))}
        </div>
    )
}
