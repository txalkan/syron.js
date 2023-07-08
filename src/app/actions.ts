import { JWKInterface } from 'arweave/node/lib/wallet'

export enum ModalActionTypes {
    SetTxStatusLoading,
    SetTxId,
    updateLoginUsername,
    updateLoginAddress,
    updateLoginZilpay,
    updateLoginArAddress,
    updateLoginKeyFile,
    updateCurrencyDropdown,
    updateCollectiblesDropdown,
    updateLang,
    // updateNet,
    updateArConnect,
    updateIsLight,
    updateIsIncognito,
    updateLoggedInVersion,
}

export interface ModalAction {
    type: ModalActionTypes
    payload?: any
}

export function setTxStatusLoading(data: any): ModalAction {
    return {
        type: ModalActionTypes.SetTxStatusLoading,
        payload: data,
    }
}

export function setTxId(data: any): ModalAction {
    return {
        type: ModalActionTypes.SetTxId,
        payload: data,
    }
}

export function updateLoginInfoUsername(data: String): ModalAction {
    return {
        type: ModalActionTypes.updateLoginUsername,
        payload: data,
    }
}

export function updateLoginInfoAddress(data: String): ModalAction {
    return {
        type: ModalActionTypes.updateLoginAddress,
        payload: data,
    }
}

export function updateLoginInfoZilpay(data: {
    base16: string
    bech32: string
}): ModalAction {
    return {
        type: ModalActionTypes.updateLoginZilpay,
        payload: data,
    }
}

export function updateLoginInfoArAddress(data: String): ModalAction {
    return {
        type: ModalActionTypes.updateLoginArAddress,
        payload: data,
    }
}

export function updateLoginInfoKeyFile(data: JWKInterface): ModalAction {
    return {
        type: ModalActionTypes.updateLoginKeyFile,
        payload: data,
    }
}

export function updateSelectedCurrencyDropdown(data: any): ModalAction {
    return {
        type: ModalActionTypes.updateCurrencyDropdown,
        payload: data,
    }
}

export function updateSelectedCollectiblesDropdown(data: any): ModalAction {
    return {
        type: ModalActionTypes.updateCollectiblesDropdown,
        payload: data,
    }
}

export function UpdateLang(data: string): ModalAction {
    return {
        type: ModalActionTypes.updateLang,
        payload: data,
    }
}

// export function UpdateNet(data: string): ModalAction {
//     return {
//         type: ModalActionTypes.updateNet,
//         payload: data,
//     }
// }

export function UpdateArConnect(data: any): ModalAction {
    return {
        type: ModalActionTypes.updateArConnect,
        payload: data,
    }
}

export function UpdateIsLight(data: any): ModalAction {
    return {
        type: ModalActionTypes.updateIsLight,
        payload: data,
    }
}

//@review: xalkan, this might not be needed anymore
// export function UpdateIsIncognito(data: any): ModalAction {
//     return {
//         type: ModalActionTypes.updateIsIncognito,
//         payload: data,
//     }
// }

export function UpdateLoggedInVersion(data: any): ModalAction {
    return {
        type: ModalActionTypes.updateLoggedInVersion,
        payload: data,
    }
}
