import { createDomain } from 'effector'

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
