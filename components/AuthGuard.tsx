import React, { useEffect, useState } from 'react'

import { useSiwbIdentity } from 'ic-use-siwb-identity'
import ConnectDialog from './ConnectDialog'
import { Button } from 'antd'
import { useStore } from 'react-stores'
import { $siwb } from '../src/store/syron'

type AuthGuardProps = {
    children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { isInitializing, identity } = useSiwbIdentity()
    const [connectDialogOpen, setConnectDialogOpen] = useState(false)
    const [connected, setConnected] = useState(false)
    const siwb = useStore($siwb)

    useEffect(() => {
        console.log({ isInitializing, identity })
    }, [isInitializing, identity])

    // If the user is not connected, clear the session.

    // If user switches to an unsupported network, clear the session.

    // If the user switches to a different address, clear the session.

    if (isInitializing) {
        return null
    }

    const handleClick = async () => {
        setConnectDialogOpen(true)
    }

    useEffect(() => {
        setConnected(siwb.isConnected)
    }, [siwb])

    // If wallet is not connected or there is no identity, show login page.
    if (!connected) {
        return (
            <>
                <Button className={'button secondary'} onClick={handleClick}>
                    Sign in
                </Button>
                <ConnectDialog
                    isOpen={connectDialogOpen}
                    setIsOpen={() => setConnectDialogOpen(false)}
                />
            </>
        )
    }

    return <>{children}</>
}
