import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { hideSignInModal } from '../../../app/actions';
import { RootState } from '../../../app/reducers';
import CloseIcon from '../../../assets/icons/ic_cross.svg';
import styles from './styles.module.scss';
import { SsiKey, ZilPay } from '../..';
import Image from 'next/image';

const mapStateToProps = (state: RootState) => ({
    modal: state.modal.signInModal
});

const mapDispatchToProps = {
    dispatchHideModal: hideSignInModal
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function ConnectModal(props: ModalProps) {
    const { dispatchHideModal, modal } = props;

    if (!modal) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <div className={styles.closeIcon}>
                    <Image
                        src={CloseIcon}
                        onClick={() => {
                            dispatchHideModal();
                        }}
                    />
                </div>
                <ZilPay />
                <SsiKey />
            </div>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectModal);

// after successful connection with ZilPay changed "sign in" to "Sign off"
// and add "Disconnect" to zilpay
//@todo-ux IDEM for the ssi private key: "SSI PRIVATE KEY" to "DISCONNECT SSI KEY" & manage sign off workflow for SSI key
