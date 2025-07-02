import {
    CreateOrderReq,
    CreateTransferReq,
    InscribeOrderData,
    ListOrderReq,
    ListOrderRes,
} from './api-types'
import { getUniSat, postUniSat } from './httpUtils'

export const unisatApi = {
    createOrder(req: CreateOrderReq): Promise<InscribeOrderData> {
        return postUniSat('/v2/inscribe/order/create', req)
    },
    listOrder(req: ListOrderReq): Promise<ListOrderRes> {
        return getUniSat('/v2/inscribe/order/list', req)
    },
    orderInfo(orderId: string): Promise<InscribeOrderData> {
        return getUniSat(`/v2/inscribe/order/${orderId}`)
    },
    createTransfer(req: CreateTransferReq): Promise<InscribeOrderData> {
        return postUniSat('/v2/inscribe/order/create/brc20-transfer', req)
    },
    getInscriptionInfo(inscriptionId: string) {
        return getUniSat(`v1/indexer/inscription/info/${inscriptionId}`)
    },
    getBrc20Info(address: string) {
        return getUniSat(
            `v1/indexer/address/${address}/brc20/summary?start=0&limit=20&tick_filter=16`
        )
    },
    getRunesBalance(txid: string, index: string) {
        return getUniSat(`v1/indexer/runes/utxo/${txid}/${index}/balance`)
    },
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
