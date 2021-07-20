import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { hideSignInModal, hideSsiKeyModal } from '../../../app/actions';
import { RootState } from '../../../app/reducers';
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic_cross.svg';
import { actionsCreator } from '../../../context/modal/actions';
import { useDispatch, useSelector } from '../../../context/index';
import styles from './styles.module.scss';
import { ArConnect, KeyFile } from 'src/components/index';

const mapStateToProps = (state: RootState) => ({
    modal: state.modal.ssiKeyModal
});

const mapDispatchToProps = {
    dispatchHideSignInModal: hideSignInModal,
    dispatchHideSsiKeyModal: hideSsiKeyModal
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function SsiKeyModal(props: ModalProps) {
    const { dispatchHideSignInModal, dispatchHideSsiKeyModal, modal } = props;

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
                            dispatchHideSignInModal();
                            dispatchHideSsiKeyModal();
                        }}
                    />
                    <ArConnect />
                    <KeyFile />
                </div>
            </div>
        </>
    );
}

export default connector(SsiKeyModal);
