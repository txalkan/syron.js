import React, { useEffect, useState } from 'react'
import { useSiwbIdentity } from 'ic-use-siwb-identity'
import { Button } from 'antd'
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

    const walletProvider =
        wallet.type == 'okx'
            ? 'okxwallet.bitcoin'
            : (wallet.type as WalletProviderKey)

    const [loading, setLoading] = useState<boolean>(false)
    const [manually, setManually] = useState<boolean>(false)
    const [addressRes, setAddressRes] = useState<string>('')

    // useEffect(() => {
    //     console.log({ isInitializing, identity })
    // }, [isInitializing, identity])

    useEffect(() => {
        if (!isPrepareLoginIdle) return

        let address: string | undefined = undefined
        try {
            address = getAddress()
        } catch (error) {
            console.error('Failed to get address:', error)
            return
        }

        if (address) {
            setAddressRes(address)
            try {
                prepareLogin()
            } catch (error) {
                console.error('Failed to prepare login:', error)
                setLoading(false)
                return
            }

            if (connectedBtcAddress && !identity && manually) {
                ;(async () => {
                    setLoading(true)
                    try {
                        await login()
                        setManually(false)
                    } catch (error: any) {
                        console.error('Sign in failed - ', error)
                        // Handle specific error types
                        if (
                            error?.message?.includes('User rejected') ||
                            error?.message?.includes('rejected') ||
                            error?.message?.includes('cancelled') ||
                            error?.code === 4001
                        ) {
                            console.log('User rejected the sign request')
                        } else {
                            console.error(
                                'Unexpected error during sign in:',
                                error
                            )
                        }
                        // Reset state for retry in all error cases
                        setManually(false)
                        setAddressRes('')
                        // Clear SIWB state to reset the hook
                        clear()
                    } finally {
                        setAddressRes('')
                        setLoading(false)
                    }
                })()
            }
        }
    }, [
        prepareLogin,
        isPrepareLoginIdle,
        getAddress,
        login,
        connectedBtcAddress,
        identity,
        manually,
    ])

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

    const handleClick = async () => {
        try {
            setLoading(true)

            console.log('Setting wallet provider:', walletProvider)
            await setWalletProvider(walletProvider)
            setManually(true)
        } catch (error) {
            console.error('Failed to set wallet provider:', error)
            setLoading(false)
        }
    }

    if (isInitializing) {
        return null
    }

    if (!isInitializing && !identity) {
        return (
            <>
                <Button
                    key="unisat"
                    className={'button secondary'}
                    onClick={handleClick}
                    disabled={loading}
                    block
                >
                    {!loading ? <>Sign in</> : <Spinner />}
                </Button>
            </>
        )
    }

    return <>{children}</>
}
