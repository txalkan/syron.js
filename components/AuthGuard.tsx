import React, { useEffect, useState } from 'react'
import { useSiwbIdentity } from 'ic-use-siwb-identity'
import { Button } from 'antd'
import Spinner from './Spinner'

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

    const [loading, setLoading] = useState<boolean>(false)
    const [manually, setManually] = useState<boolean>(false)
    const [addressRes, setAddressRes] = useState<string>('')

    useEffect(() => {
        clear()
    }, [])

    useEffect(() => {
        console.log({ isInitializing, identity })
    }, [isInitializing, identity])

    useEffect(() => {
        if (!isPrepareLoginIdle) return
        const address = getAddress()
        console.log({ address })

        if (address) {
            setAddressRes(address)
            prepareLogin()
            if (connectedBtcAddress && !identity && manually) {
                ;(async () => {
                    setLoading(true)
                    try {
                        await login()
                            .then((res) => {
                                setManually(false)
                            })
                            .catch((error) => {
                                console.error('Login failed', error)
                            })
                    } catch {
                        console.error('Sig in failed')
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
            console.error('Failed to prepare login')
        }
    }, [prepareLoginError])

    useEffect(() => {
        if (loginError) {
            console.error('Failed to login')
        }
    }, [loginError])

    const handleClick = async () => {
        try {
            setLoading(true)
            await setWalletProvider('unisat')
            setManually(true)

            setTimeout(async () => {
                if (addressRes.length === 0) {
                    await setWalletProvider('unisat')
                    setManually(true)
                }
            }, 100)
        } catch (error) {
            console.error('Failed to sign in')
        } finally {
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
