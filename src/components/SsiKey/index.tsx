import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styles from './styles.module.scss';
import { showSsiKeyModal } from 'src/app/actions';
import { SsiKeyModal } from 'src/components';
import thunder from '../../assets/logos/thunder.png';

const mapDispatchToProps = {
    dispatchShowModal: showSsiKeyModal
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
            <SsiKeyModal />
            <button
                type="button" 
                className={styles.button}
                onClick={handleOnClick}
            >
                <img src={thunder} className={styles.logo} />
                <p className={styles.buttonText}>SSI secret key</p>
            </button>
        </>
    );
}

export default connector(SignIn);
