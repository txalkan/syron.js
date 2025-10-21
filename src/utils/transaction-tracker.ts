export enum WithdrawStablecoin {
    BRC20 = 'BRC20',
    RUNES = 'RUNES',
    SUSD = 'SUSD',
}

const WITHDRAW_TRANSACTION_KEYS = {
    BRC20: 'withdraw_syron',
    RUNES: 'withdraw_runedollar',
    SUSD: 'withdraw_susd',
} as const satisfies Record<WithdrawStablecoin, string>

export type WithdrawTransactionKey =
    (typeof WITHDRAW_TRANSACTION_KEYS)[WithdrawStablecoin]

export const getWithdrawTransactionKey = (
    stablecoin: WithdrawStablecoin
): WithdrawTransactionKey => {
    return WITHDRAW_TRANSACTION_KEYS[stablecoin]
}

export enum DepositMechanism {
    PSBT = 'psbt',
    REDEEM = 'redeem',
    FEE = 'fee',
    RUNES = 'runes',
}

const DEPOSIT_TRANSACTION_KEYS = {
    [DepositMechanism.PSBT]: 'psbt_bitcoin_deposit',
    [DepositMechanism.REDEEM]: 'redeem_bitcoin_collateral',
    [DepositMechanism.FEE]: 'fee_bitcoin_deposit',
    [DepositMechanism.RUNES]: 'runes_deposit',
} as const satisfies Record<DepositMechanism, string>

export const TRANSACTION_KEY_REGISTRY = {
    withdrawal: WITHDRAW_TRANSACTION_KEYS,
    deposit: DEPOSIT_TRANSACTION_KEYS,
} as const

export const TRANSACTION_TYPE_METADATA: Record<
    string,
    {
        category: string
        label: string
        description: string
    }
> = {
    withdraw_syron: {
        category: 'syron',
        label: 'SYRON BRC-20 Withdrawal',
        description:
            'SYRON BRC-20 transfer to your self-custodial Bitcoin wallet.',
    },
    withdraw_runedollar: {
        category: 'syron',
        label: 'RUNE•DOLLAR Withdrawal',
        description:
            'RUNE•DOLLAR transfer to your self-custodial Bitcoin wallet.',
    },
    psbt_bitcoin_deposit: {
        category: 'bitcoin',
        label: 'Bitcoin Deposit',
        description:
            'BTC deposit from your self-custodial Bitcoin wallet to your Safety Deposit ₿ox.',
    },
    withdraw_susd: {
        category: 'syron',
        label: 'SUSD Payment',
        description: 'Syron SUSD transfer to another Bitcoin wallet.',
    },
    redeem_bitcoin_collateral: {
        category: 'bitcoin',
        label: 'Bitcoin Collateral Redemption',
        description:
            'BTC transfer from your Safety Deposit ₿ox to your self-custodial Bitcoin wallet.',
    },
    fee_bitcoin_deposit: {
        category: 'bitcoin',
        label: 'Fee Deposit',
        description:
            'BTC payment to cover miner fees to process your transaction on Bitcoin.',
    },
    runes_deposit: {
        category: 'syron',
        label: 'Runes Deposit',
        description: 'RUNE•DOLLAR deposit into your Safety Deposit ₿ox.',
    },
}
