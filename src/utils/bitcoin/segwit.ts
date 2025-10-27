import * as btc from 'bitcoinjs-lib'

export const isMainnetSegwit = (addr: string) => {
    try {
        const spk = btc.address.toOutputScript(addr, btc.networks.bitcoin)
        // P2TR: OP_1 32-byte; P2WPKH: OP_0 20-byte
        const v0_p2wpkh = spk[0] === 0x00 && spk[1] === 0x14
        const v1_p2tr = spk[0] === 0x51 && spk[1] === 0x20
        return v0_p2wpkh || v1_p2tr
    } catch {
        return false
    }
}
