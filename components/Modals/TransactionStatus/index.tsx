import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useStore } from 'effector-react'
import { toast } from 'react-toastify'
import { setTxStatusLoading } from '../../../src/app/actions'
import { RootState } from '../../../src/app/reducers'
import { $net } from '../../../src/store/wallet-network'
import { $modalTx, updateModalTx } from '../../../src/store/modal'
import CloseIcon from '../../../src/assets/icons/ic_cross.svg'
import styles from './styles.module.scss'
import Image from 'next/image'

const mapStateToProps = (state: RootState) => ({
    loading: state.modal.txStatusLoading,
    txId: state.modal.txId,
})

const mapDispatchToProps = {
    dispatchSetTxStatus: setTxStatusLoading,
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type ModalProps = ConnectedProps<typeof connector>

function TransactionStatus(props: ModalProps) {
    const { dispatchSetTxStatus, loading, txId } = props
    const net = useStore($net)
    const modalTx = useStore($modalTx)

    const hideModal = () => {
        if (loading === 'true') {
            toast.error('Confirm or reject the transaction with ZilPay.', {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 1,
            })
        } else {
            updateModalTx(false)
            dispatchSetTxStatus('idle')
        }
    }

    const spinner = (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
    )

    const tx = (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <h5 style={{ fontSize: 14, textAlign: 'center' }}>
                {loading === 'true'
                    ? 'Sign the transaction to send it to the blockchain'
                    : loading === 'submitted'
                    ? 'Transaction processed on the Zilliqa blockchain - please wait'
                    : loading === 'confirmed'
                    ? 'Transaction successfully confirmed!'
                    : loading === 'failed'
                    ? 'Transaction failed'
                    : 'Sign the transaction to send it to the blockchain'}
            </h5>
            {loading !== 'true' && (
                <h5 style={{ fontSize: 14 }}>
                    ID:{' '}
                    <a
                        href={`https://devex.zilliqa.com/tx/${txId}?network=https%3A%2F%2F${
                            net === 'mainnet' ? '' : 'dev-'
                        }api.zilliqa.com`}
                        rel="noreferrer"
                        target="_blank"
                    >
                        0x{txId.slice(0, 22)}...
                    </a>
                </h5>
            )}
            {loading !== 'idle' &&
                loading !== 'confirmed' &&
                loading !== 'failed' &&
                spinner}
        </div>
    )

    if (!modalTx) {
        return null
    }

    return (
        <>
            <div onClick={hideModal} className={styles.outerWrapper} />
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.closeIcon}>
                        <Image
                            alt="close-ico"
                            src={CloseIcon}
                            onClick={hideModal}
                        />
                    </div>
                    <div style={{ marginTop: '2%', marginBottom: '5%' }}>
                        {tx}
                    </div>
                </div>
            </div>
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionStatus)
