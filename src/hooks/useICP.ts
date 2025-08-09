import { useCallback } from 'react'
import { basic_bitcoin_syron } from '../declarations/basic_bitcoin_tyron'
import { $siwb, updateSyronSSI } from '../store/syron'
import Big from 'big.js'
import { updateXR } from '../store/xr'
import { useSiwbIdentity } from 'ic-use-siwb-identity'
import { mempoolFeeRate } from '../utils/unisat/httpUtils'
import { useStore } from 'react-stores'
import { decodeIcrcAccount } from '@dfinity/ledger-icrc'
import { toNullable } from '@dfinity/utils'

Big.PE = 999

function useICPHook() {
    const identity = useStore($siwb).value

    // @network
    const version = process.env.NEXT_PUBLIC_SYRON_VERSION
    let provider_id = 0
    if (version === 'testnet') {
        provider_id = 1
    }

    const getBox = async (ssi: string) => {
        try {
            console.log('Fetch Box details...')
            await fetch(`/api/get-sdb?id=${ssi}`)
                .then(async (response) => {
                    const sdb = await response.json()
                    console.log(
                        'tyron gateway response for deposit box details: ',
                        JSON.stringify(sdb, null, 2)
                    )

                    // @dev Get the BTC balance of the SDB using ICP (deprecated in favour of Mempool API)
                    // const box_balance = await syron.get_balance(sdb.data.address)

                    // if the sdb is not undefined, update the store
                    if (sdb.data) {
                        updateSyronSSI({
                            sdb: sdb.data.address,
                            collateral_ratio: Big(Number(sdb.data.ratio)),
                            sdb_btc: Big(Number(sdb.data.balance ?? 0)),
                            syron_btc: Big(Number(sdb.data.btc)), // @review (mainnet)
                            syron_usd_loan: Big(Number(sdb.data.susd)),
                            syron_usd_bal: Big(Number(sdb.data.bal)),
                            exchange_rate: Big(Number(sdb.data.exchange_rate)),
                        })
                    }
                })
                .catch((error) => {
                    throw error
                })

            //}
        } catch (err) {
            console.error(err)
        }
    }

    const updateSyronBalance = async (ssi: string) => {
        try {
            console.log('Calling Syron update...')

            const syron = basic_bitcoin_syron()
            const txId = await syron.update_ssi_balance({
                ssi,
                op: { getsyron: null },
            })

            // Convert BigInt values to strings
            const txIdStringified = JSON.stringify(txId, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )

            console.log('txId response: ', txIdStringified)

            if (txId.Err) {
                throw new Error(txIdStringified)
            }

            return txId
        } catch (err) {
            console.error('Update Syron Balance: ', err)
            throw err
        }
    }

    // const getXR = async () => {
    //     try {
    //         const xr = await syron.get_xr()
    //         updateXR({ rate: Number(xr) / 1e9 })

    //         console.log('Rate from XRC', xr)
    //     } catch (err) {
    //         console.error(err)
    //     }
    // }

    const getSUSD = async (ssi: string, txid: string) => {
        try {
            console.log(
                `Initiating SYRON Issuance with inscribe-transfer UTXO (${txid})...`
            )
            // @dev The transaction fee rate in sat/vB
            let fee_rate = await mempoolFeeRate()

            const syron = basic_bitcoin_syron()

            const txId = await syron.withdraw_susd(
                { ssi, op: { getsyron: null } },
                txid,
                72000000,
                provider_id,
                fee_rate * 1000
            )

            // Convert BigInt values to strings
            const txIdStringified = JSON.stringify(txId, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )

            console.log('txId response: ', txIdStringified)
            //console.log('txId response: ', JSON.stringify(txId, null, 2))

            if (txId.Err) {
                throw new Error(txIdStringified)
            }

            return txId
        } catch (err) {
            console.error('Get SYRON Call', err)
            throw err
        }
    }

    const syronWithdrawal = async (ssi: string, txid: string, amt: number) => {
        try {
            console.log(
                `Initiating SYRON Withdrawal of amount (${amt}) susd-sats...`
            )
            // @dev The transaction fee rate in sat/vB
            let fee_rate = await mempoolFeeRate()

            const syron = basic_bitcoin_syron()

            const txId = await syron.syron_withdrawal(
                { ssi, op: { getsyron: null } },
                txid,
                72000000,
                provider_id,
                amt,
                fee_rate * 1000
            )

            // Convert BigInt values to strings
            const txIdStringified = JSON.stringify(txId, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )

            console.log('txId response: ', txIdStringified)
            //console.log('txId response: ', JSON.stringify(txId, null, 2))

            if (txId.Err) {
                throw new Error(txIdStringified)
            }

            return txId
        } catch (error) {
            console.error('Syron Withdrawal Call', error)
            throw error
        }
    }

    const syronWithdrawalRunes = async (ssi: string, amt: number) => {
        try {
            console.log(
                `Initiating Runes withdrawal of amount (${amt}) susd-sats...`
            )
            // @dev The transaction fee rate in sat/vB
            let fee_rate = await mempoolFeeRate()

            // @dev throw error if fee_rate is greater than 4
            if (fee_rate > 4) {
                throw new Error(
                    'The gas fee is too high - please try again later'
                )
            }

            const syron = basic_bitcoin_syron()

            const txId = await syron.syron_withdrawal_runes(
                { ssi, op: { getsyron: null } },
                amt
            )

            // Convert BigInt values to strings
            const txIdStringified = JSON.stringify(txId, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )

            console.log('txId response: ', txIdStringified)
            //console.log('txId response: ', JSON.stringify(txId, null, 2))

            if (txId.Err) {
                throw new Error(txIdStringified)
            }

            return txId
        } catch (error) {
            console.error('@syronWithdrawalRunes Error', error)
            throw error
        }
    }

    const sendSyron = useCallback(
        async (ssi: string, recipient: string, amt: number, isICP: boolean) => {
            try {
                if (identity === undefined || identity === null) {
                    throw new Error('SIWB Identity is undefined')
                }
                console.log(
                    `Initiating Syron transfer of amount (${amt}) to recipient (${recipient}) w/ internet identity: ${identity}`
                )
                const syron = basic_bitcoin_syron(identity)

                let txId
                if (isICP) {
                    const { owner, subaccount } = decodeIcrcAccount(recipient)

                    const to = {
                        owner,
                        subaccount: toNullable(subaccount),
                    }
                    txId = await syron.send_syron_icp(
                        { ssi, op: { payment: null } },
                        to,
                        amt
                    )
                } else {
                    txId = await syron.send_syron(
                        { ssi, op: { payment: null } },
                        recipient,
                        amt
                    )
                }

                // Convert BigInt values to strings
                const txIdStringified = JSON.stringify(txId, (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                )

                console.log('txId response: ', txIdStringified)
                //console.log('txId response: ', JSON.stringify(txId, null, 2))

                if (txId.Err) {
                    throw new Error(txIdStringified)
                }

                return txId
            } catch (error) {
                console.error('Syron Payment Call', error)
                throw error
            }
        },
        [identity]
    )

    const buyBtc = useCallback(
        async (ssi: string, amt: number, btcAmt: number) => {
            try {
                // @add in tests
                // return 'Call failed: Canister: qgzyj-ciaaa-aaaam-qb5sq-cai Method: buy_btc (update) "Request ID": "1e5194b7b8e65411dd9bb8edd8c214824bb117c029da43c1257fce2b9694b175" "Error code": "IC0503" "Reject code": "5" "Reject message": "Error from Canister qgzyj-ciaaa-aaaam-qb5sq-cai: Canister called `ic0.trap` with message: Panicked at anonymous caller not allowed, src/basic_bitcoin/src/lib.rs:781:9.\nConsider gracefully handling failures from this canister or altering the canister to handle exceptions. See documentation: https://internetcomputer.org/docs/current/references/execution-errors#trapped-explicitly"'
                // return '{"Ok":["transaction_id: 06dd0b6d4a383d149bc823ca9c66defb84a7f33b0b8c75bdf7e59346a6a9a32a", "given_fee: 3000", "bitcoin_amount: 1640", "susd_balance: 0"]}'

                // @dev The transaction fee rate in sat/vB
                let fee_rate = await mempoolFeeRate()
                if (fee_rate > 3)
                    throw new Error(
                        'The gas fee is too high - please try again later'
                    )

                if (identity === null || identity === undefined) {
                    throw new Error('SIWB identity is undefined')
                }
                console.log(
                    `Initiating BTC purchase with ${amt} susd-sats; minimum BTC amount: ${btcAmt} sats; fee rate: ${fee_rate} sat/vB & identity: ${JSON.stringify(
                        identity,
                        null,
                        2
                    )}`
                )
                const syron = basic_bitcoin_syron(identity)
                const tx_res = await syron.buy_btc(
                    { ssi, op: { payment: null } },
                    amt,
                    btcAmt,
                    fee_rate * 1000
                )

                // Convert BigInt values to strings
                const tx_stringified = JSON.stringify(tx_res, (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                )

                console.log('txId response: ', tx_stringified)

                if (tx_res.Err) {
                    throw new Error(tx_stringified)
                }

                return tx_stringified
            } catch (error) {
                console.error('BTC Purchase Call', error)
                throw error
            }
        },
        [identity]
    )

    const redemptionGas = async (ssi: string) => {
        try {
            console.log('Loading Redemption Gas')
            const syron = basic_bitcoin_syron()
            const gas = await syron.redemption_gas({
                ssi,
                op: { redeembitcoin: null },
            })
            if (gas.Err) {
                throw new Error(gas.Err.GenericError.error_message)
            } else {
                console.log('Redeption Gas:', gas.Ok)
                return gas.Ok
            }
        } catch (err) {
            console.error('Redemption Gas', err)
            throw err
        }
    }

    const redeemBTC = async (ssi: string) => {
        try {
            console.log('Loading BTC Redemption')
            // @dev The transaction fee rate in sat/vB
            let fee_rate = await mempoolFeeRate()
            if (fee_rate > 4)
                throw new Error(
                    'The gas fee is too high - please try again later'
                )

            if (identity === null || identity === undefined) {
                throw new Error('SIWB identity is undefined')
            }

            const syron = basic_bitcoin_syron(identity)
            const txId = await syron.redeem_btc(
                {
                    ssi,
                    op: { redeembitcoin: null },
                },
                fee_rate * 1000
            )
            if (txId.Err) {
                throw new Error(txId.Err.GenericError.error_message)
            }
            console.log(txId)
            return txId
        } catch (err) {
            console.error('Redeem BTC', err)
            throw err
        }
    }

    const deposit_brc20_and_redeem_btc = async (ssi: string, txid: string) => {
        try {
            console.log('Loading BTC Redemption')
            // @dev The transaction fee rate in sat/vB
            let fee_rate = await mempoolFeeRate()

            const syron = basic_bitcoin_syron()
            const txId = await syron.deposit_brc20_and_redeem_btc(
                {
                    ssi,
                    op: { redeembitcoin: null },
                },
                txid,
                provider_id,
                fee_rate * 1000
            )
            if (txId.Err) {
                throw new Error(txId.Err.GenericError.error_message)
            }
            console.log(txId)
            return txId
        } catch (err) {
            console.error('Redeem BTC', err)
            throw err
        }
    }

    const getServiceProviders = async () => {
        try {
            console.log('Loading Service Providers')
            const syron = basic_bitcoin_syron()
            const res = await syron.getServiceProviderMap()
            console.log('Service Providers', res)
            return res
        } catch (err) {
            console.error(err)
        }
    }

    return {
        getBox,
        updateSyronBalance,
        getSUSD,
        syronWithdrawal,
        syronWithdrawalRunes,
        sendSyron,
        buyBtc,
        redemptionGas,
        deposit_brc20_and_redeem_btc,
        redeemBTC,
        getServiceProviders,
    }
}

export default useICPHook

export function parseTxOkArray(txStringified: string): string[] {
    try {
        const obj = JSON.parse(txStringified)
        if (!obj.Ok || !Array.isArray(obj.Ok)) return []
        return obj.Ok.map((entry: string) => {
            const parts = entry.split(':')
            // If the format is "key: value", return the value trimmed
            return parts.length > 1 ? parts.slice(1).join(':').trim() : entry
        })
    } catch {
        return []
    }
}
