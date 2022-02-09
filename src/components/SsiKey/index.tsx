import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styles from './styles.module.scss';
import { showSsiKeyModal } from '../../app/actions';
import { RootState } from '../../app/reducers';
import { SsiKeyModal } from '../../components';
import thunder from '../../assets/logos/thunder.png';
import Image from 'next/image'

const mapStateToProps = (state: RootState) => ({
    modal: state.modal.ssiKeyModal
});
const mapDispatchToProps = {
    dispatchShowModal: showSsiKeyModal
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;

function SignIn(props: Props) {
    const { dispatchShowModal, modal } = props;

    const handleOnClick = () => {
        dispatchShowModal();
    };

    return (
        <>
            <SsiKeyModal />
            {!modal ? (
                <button
                    type="button"
                    className={styles.button}
                    onClick={ handleOnClick }
                >   
                    <div className={ styles.logo }>
                        <Image src={ thunder } />
                    </div>
                    <p className={ styles.buttonText }>SSI private key</p>
                </button>
            ):(<></>)}
        </>
    );
}

export default connector(SignIn);
