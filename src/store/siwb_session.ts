import { create } from 'zustand'
import { DelegationIdentity } from '@dfinity/identity'

interface SiwbSessionState {
    siwb_identity: DelegationIdentity | null
    setSiwbIdentity: (identity: DelegationIdentity | null) => void
    clearSiwbSession: () => void
}

export const useSiwbSessionStore = create<SiwbSessionState>()((set) => ({
    siwb_identity: null,
    setSiwbIdentity: (identity) => {
        set({
            siwb_identity: identity,
        })
    },
    clearSiwbSession: () => {
        set({
            siwb_identity: null,
        })
    },
}))
