import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { hideNewWalletModal } from '../../../app/actions';
import { RootState } from '../../../app/reducers';
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic_cross.svg';
import styles from './styles.module.scss';
import { DeployCoop, DeployDid } from 'src/components/index';

const mapStateToProps = (state: RootState) => ({
    modal: state.modal.newWalletModal
});

const mapDispatchToProps = {
    dispatchHideModal: hideNewWalletModal
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function NewWalletModal(props: ModalProps) {
    const { dispatchHideModal, modal } = props;

    if (!modal) {
        return null;
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <CloseIcon
                        className={styles.closeIcon}
                        onClick={() => {
                            dispatchHideModal();
                        }}
                    />
                    <h2 style={{ textAlign: 'center' }}>
                        Deploy a <strong style={{ color: 'lightblue' }}>Self-Sovereign Identity Wallet</strong>
                    </h2>
                    <DeployDid/>
                    <DeployCoop/>
                </div>
            </div>
        </>
    );
}

export default connector(NewWalletModal);
