import { useStore } from 'effector-react'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { Dex, Swap } from '..'

function Component() {
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain = resolvedInfo?.user_domain
    //@review update subdomain

    return (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <h1 style={{ marginBottom: '30px' }}>
                <div className={styles.username}>defi@{resolvedDomain}.ssi</div>
            </h1>
            <Dex />
            <Swap />
        </div>
    )
}

export default Component
