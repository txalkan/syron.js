import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

/*import { MODALS } from '../../../context/modal/types';
import { actionsCreator } from '../../../context/modal/actions';
import { useDispatch } from '../../../context/index';*/
import styles from './styles.module.scss';
import { showSignInModal } from 'src/app/actions';
import { SignInModal } from 'src/components';

const mapDispatchToProps = {
    dispatchShowModal: showSignInModal
};

const connector = connect(undefined, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;

function SignIn(props: Props) {
    const { dispatchShowModal } = props;

    const handleOnClick = () => {
        dispatchShowModal();
    };

    return (
        <>
            <SignInModal />
            <button className={styles.button} onClick={handleOnClick}>
                Sign in
            </button>
        </>
    );
}

export default connector(SignIn);
