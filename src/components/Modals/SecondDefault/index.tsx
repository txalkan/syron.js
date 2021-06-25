// TODO WIP

import React, { useEffect } from 'react';
import cn from 'classnames';
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic_cross.svg';
import { actionsCreator } from '../../../context/modal/actions';
import { useDispatch, useSelector } from '../../../context/index';

import styles from './styles.module.scss';

export interface IModal {
  name: string;
  className?: string;
  children: React.ReactNode;
}

function SecModal({ name, className = '', children }: IModal) {
  const dispatch = useDispatch();
  const { isOpen = false } = useSelector((state) => state.secModal[name] || {});

  useEffect(() => {
    dispatch(actionsCreator.createModal(name));

    return () => dispatch(actionsCreator.destroyModal(name));
  }, []);

  const handleClose = () => dispatch(actionsCreator.closeModal(name));

  return (
    <div className={cn(styles.modal, { [styles.active]: isOpen })}>
      <div
        className={cn(styles.innerView, className, {
          [styles.active]: isOpen
        })}
      >
        <CloseIcon className={styles.closeIcon} onClick={handleClose} />
        {children}
      </div>
    </div>
  );
}

export default SecModal;
