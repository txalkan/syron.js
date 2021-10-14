import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { hideSignInModal } from '../../../app/actions';
import { RootState } from '../../../app/reducers';
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic_cross.svg';
import styles from './styles.module.scss';
import { SsiKey, ZilPay } from 'src/components/index';

const mapStateToProps = (state: RootState) => ({
    modal: state.modal.signInModal
});

const mapDispatchToProps = {
    dispatchHideModal: hideSignInModal
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function SignInModal(props: ModalProps) {
    const { dispatchHideModal, modal } = props;

    if (!modal) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <CloseIcon
                    className={styles.closeIcon}
                    onClick={() => {
                        dispatchHideModal();
                    }}
                />
                <ZilPay />
                <SsiKey />
            </div>
        </div>
    );
}

export default connector(SignInModal);

// after successful connection with ZilPay changed "sign in" to "Sign off"
// and add "Disconnect" to zilpay
//@todo-ux IDEM for the ssi private key: "SSI PRIVATE KEY" to "DISCONNECT SSI KEY" & manage sign off workflow for SSI key

//@todo-ui make the buttons responsive in mobile screen
                    
