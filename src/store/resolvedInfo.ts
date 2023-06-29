import { createDomain } from 'effector'

// @review update to import { Store } from 'react-stores';

//@review move to types
export interface User {
    user_tld: string
    user_domain: string
    user_subdomain: string
    addr?: string
    status?: any
    version?: string
}

const resolvedInfoDomain = createDomain()
export const updateResolvedInfo = resolvedInfoDomain.createEvent<User | null>()
export const $resolvedInfo = resolvedInfoDomain
    .createStore<User | null>(null)
    .on(updateResolvedInfo, (_, payload) => payload)
