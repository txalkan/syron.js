import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styles from './styles.module.scss';
import { showNewWalletModal } from 'src/app/actions';

const mapDispatchToProps = {
    dispatchShowModal: showNewWalletModal
};

const connector = connect(undefined, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;

function FAQ(props: Props) {
    const { dispatchShowModal } = props;

    const handleOnClick = () => {
        dispatchShowModal();
    };

    return (
        <>
            <button className={styles.button} onClick={handleOnClick}>
                FAQ
            </button>
        </>
    );
}

export default connector(FAQ);
