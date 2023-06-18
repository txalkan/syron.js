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

import React from 'react';


type Prop = {
  width?: number | string;
  height?: number | string;
  onClick?: () => void;
};

const SwapIcon: React.FC<Prop> = ({
  width = 32,
  height = 33,
  onClick
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 33"
      fill="none"
      onClick={onClick}
    >
      <rect
        width="32"
        height="32"
        transform="translate(0 0.5)"
        fill="var(--button-color)"
      />
      <path
        d="M23.1595 13.2071L22.0151 12.0628L22.0151 21.1685L20.0151 21.1685L20.0151 11.8904L18.6984 13.2071L17.2842 11.7929L20.9289 8.14813L24.5737 11.7929L23.1595 13.2071Z"
        fill="var(--text-color)"
      />
      <path
        d="M9.95549 21.071L8.63875 19.7543L7.22454 21.1685L10.8693 24.8133L14.514 21.1685L13.0998 19.7543L11.9555 20.8986L11.9555 11.7929L9.9555 11.7929L9.95549 21.071Z"
        fill="var(--text-color)"
      />
    </svg>
  );
};

export default SwapIcon;
