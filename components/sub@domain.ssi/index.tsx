import React from 'react'
import styles from './styles.module.scss'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../src/store/resolvedInfo'

function Component() {
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain =
        resolvedInfo?.user_domain! && resolvedInfo.user_domain
            ? resolvedInfo.user_domain
            : ''
    const resolvedSubdomain =
        resolvedInfo?.user_subdomain! && resolvedInfo.user_subdomain
            ? resolvedInfo.user_subdomain
            : ''
    const resolvedTLD =
        resolvedInfo?.user_tld! && resolvedInfo.user_tld
            ? resolvedInfo.user_tld
            : ''
    const subdomain_length = resolvedSubdomain.length
    const domain_length = resolvedDomain.length
    const full_length = subdomain_length + domain_length
    let break_ = false
    if (
        resolvedSubdomain !== '' &&
        (subdomain_length > 7 || full_length > 10)
    ) {
        break_ = true
    }
    return (
        <div className={styles.container}>
            <div className={styles.username}>
                {resolvedSubdomain !== '' && `${resolvedSubdomain}@`}
                {break_ && (
                    <div className={styles.usernameMobile}>
                        <br />
                    </div>
                )}
                {resolvedDomain}
                {domain_length > 7 && (
                    <div className={styles.usernameMobile}>
                        <br />
                    </div>
                )}
                .{resolvedTLD === '' ? 'ssi' : resolvedTLD}
            </div>
        </div>
    )
}

export default Component
