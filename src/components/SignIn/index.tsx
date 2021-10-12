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
    const is_connected = useStore($connected);
    
    const { dispatchShowModal } = props;

    const handleOnClick = () => {
        dispatchShowModal();
    };

    return (
        <>
            <SignInModal />
            {
                !is_connected &&
                <button className={styles.buttonSignIn} onClick={handleOnClick}>
                    Sign in
                </button>
            }
            {
                is_connected &&
                <button className={styles.buttonSignOff} onClick={handleOnClick}>
                    Sign off
                </button>
            }
        </>
    );
}

export default connector(SignIn);
