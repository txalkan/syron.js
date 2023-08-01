// import { createDomain } from 'effector'
import { Store } from 'react-stores'

//@review move to types
export interface User {
    user_tld: string
    user_domain: string
    user_subdomain: string
    addr?: string
    status?: any
    version?: string
}

// const resolvedInfoDomain = createDomain()
// export const updateResolvedInfo = resolvedInfoDomain.createEvent<User | null>()
// export const $resolvedInfo = resolvedInfoDomain
//     .createStore<User | null>(null)
//     .on(updateResolvedInfo, (_, payload) => payload)

const tyron_init: User = {
    user_tld: '',
    user_domain: '',
    user_subdomain: '',
}
export const $resolvedInfo = new Store(tyron_init)
export function updateResolvedInfo(user: User) {
    $resolvedInfo.setState(user)
}
