import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSiwbIdentity } from 'ic-use-siwb-identity'
import Spinner from './Spinner'
import { useWalletInfoStore } from '../src/store/wallet_info'
import { WalletProviderKey } from 'ic-use-siwb-identity/dist/wallet'

type AuthGuardProps = {
    children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const {
        clear,
        isInitializing,
        prepareLogin,
        isPrepareLoginIdle,
        prepareLoginError,
        loginError,
        setWalletProvider,
        login,
        getAddress,
        connectedBtcAddress,
        identity,
    } = useSiwbIdentity()

    const { wallet } = useWalletInfoStore()

    const walletProvider = useMemo(
        () =>
            wallet.type === 'okx'
                ? 'okxwallet.bitcoin'
                : (wallet.type as WalletProviderKey),
        [wallet.type]
    )

    const [loading, setLoading] = useState<boolean>(false)
    const [manually, setManually] = useState<boolean>(false)

    const attemptLogin = useCallback(async () => {
        setLoading(true)
        try {
            await login()
        } catch (error: any) {
            console.error('SIWB login failed.', error)
            clear()
        } finally {
            setManually(false)
            setLoading(false)
        }
    }, [clear, login])

    const ensurePreparedLogin = useCallback(() => {
        if (!isPrepareLoginIdle) return

        let address: string | undefined
        try {
            address = getAddress()
        } catch (error) {
            console.error('Failed to get address:', error)
            return
        }

        if (!address) return

        try {
            prepareLogin()
        } catch (error) {
            console.error('Failed to prepare login:', error)
            setLoading(false)
            return
        }

        if (connectedBtcAddress && !identity && manually) {
            void attemptLogin()
        }
    }, [
        attemptLogin,
        connectedBtcAddress,
        getAddress,
        identity,
        isPrepareLoginIdle,
        manually,
        prepareLogin,
    ])

    useEffect(() => {
        ensurePreparedLogin()
    }, [ensurePreparedLogin])

    useEffect(() => {
        if (prepareLoginError) {
            console.error('Failed to prepare login:', prepareLoginError)
            setLoading(false)
        }
    }, [prepareLoginError])

    useEffect(() => {
        if (loginError) {
            console.error('Failed to login:', loginError)
            setLoading(false)
        }
    }, [loginError])

    const handleClick = useCallback(async () => {
        try {
            setLoading(true)
            console.log('Setting wallet provider:', walletProvider)
            await setWalletProvider(walletProvider)
            setManually(true)
        } catch (error) {
            console.error('Failed to set wallet provider:', error)
            setLoading(false)
        }
    }, [setWalletProvider, walletProvider])

    if (isInitializing) {
        return null
    }

    if (!isInitializing && !identity) {
        return (
            <>
                <button
                    type="button"
                    className="button secondary"
                    onClick={handleClick}
                    disabled={loading}
                    style={{ width: '100%' }}
                >
                    {!loading ? <>Sign in</> : <Spinner />}
                </button>
            </>
        )
    }

    return <>{children}</>
}
