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
        alert('Coming soon.')
        //dispatchShowModal();
    };

    return (
        <>
            <button className={styles.button} onClick={handleOnClick}>
                FAQ
            </button>
        </>
    );
}

//@todo-ui reposition button so that when the public identity is ON, it all fits in one page (no scroll down)
export default connector(FAQ);
