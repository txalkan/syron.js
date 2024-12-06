import { useEffect, useState } from 'react'
import { Button, Modal, Spin, Typography } from 'antd'
import { useSiwbIdentity } from 'ic-use-siwb-identity'
import { toast } from 'react-toastify'
import { updateSiwb } from '../src/store/syron'

export default function ConnectDialog({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}) {
    const {
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
    const [addressRes, setAddressRes] = useState<string>("")

    /**
     * Preload a Siwb message on every address change.
     */
    const signInAction = async () => {
        if (!isPrepareLoginIdle) return
        const address = await getAddress()

        if (address) {
            setAddressRes(address)
            prepareLogin()
            if (connectedBtcAddress && !identity && manually) {
                ;(async () => {
                    setLoading(true)
                    try {
                        const res = await login()

                        if (res) {
                            updateSiwb(true)
                            setManually(false)
                            setIsOpen(false)
                            setAddressRes("")
                        }
                    } catch (error) {
                        toast.error('Login failed')
                        setAddressRes("")
                        updateSiwb(false)
                    } finally {
                        setLoading(false)
                    }
                })()
            }
        }
    }
    
    useEffect(() => {
        signInAction()
    }, [
        prepareLogin,
        isPrepareLoginIdle,
        getAddress,
        setIsOpen,
        login,
        connectedBtcAddress,
        identity,
        manually,
    ])

    /**
     * Show an error toast if the prepareLogin() call fails.
     */
    useEffect(() => {}, [prepareLoginError])

    /**
     * Show an error toast if the login call fails.
     */
    useEffect(() => {}, [loginError])

    const connect = async () => {
        setLoading(true)
        setManually(true)
        await setWalletProvider('unisat')
        setTimeout(async () => {
            if (addressRes.length === 0) {
                await setWalletProvider('unisat')
                setManually(true)
            }
        }, 100);
    }

    return (
        <Modal
            className="z-50 w-80"
            open={isOpen}
            footer={null}
            onCancel={() => {
                setIsOpen(false)
            }}
        >
            {/* <Typography.Title> Select Wallet</Typography.Title>
            <div className="mt-8">
                <Button
                    key="wizz"
                    onClick={async () => {
                        setManually(true)
                        await setWalletProvider('wizz')
                    }}
                    disabled={loading}
                    block
                >
                    Wizz Wallet
                </Button>
            </div> */}
            <div>
                <Button
                    key="unisat"
                    onClick={connect}
                    disabled={loading}
                    block
                >
                    <div style={{ color: '#333333' }}>sign in</div>
                </Button>
                {/* <Button
                    key="xverse"
                    onClick={async () => {
                        setManually(true)
                        await setWalletProvider('BitcoinProvider')
                    }}
                    disabled={loading}
                    block
                >
                    Xverse Wallet
                </Button> */}
            </div>
            {loading && <Spin />}
        </Modal>
    )
}
