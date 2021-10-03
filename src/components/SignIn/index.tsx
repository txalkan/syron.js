import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styles from './styles.module.scss';
import { showSignInModal } from 'src/app/actions';
import { SignInModal } from 'src/components';
import { $connected } from 'src/store/connected';
import { useStore } from 'effector-react';

const mapDispatchToProps = {
    dispatchShowModal: showSignInModal
};

const connector = connect(undefined, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;

function SignIn(props: Props) {
    const isConnected = useStore($connected);
    
    const { dispatchShowModal } = props;

    const handleOnClick = () => {
        dispatchShowModal();
    };

    return (
        <>
            <SignInModal />
            {
                !isConnected &&
                <button className={styles.buttonSignIn} onClick={handleOnClick}>
                    Sign in
                </button>
            }
            {
                isConnected &&
                <button className={styles.buttonSignOff} onClick={handleOnClick}>
                    Sign off
                </button>
            }
        </>
    );
}

export default connector(SignIn);
