import { useEffect, useCallback } from 'react';
import useAC from 'use-arconnect';

import { useDispatch, useSelector } from '../context';
import { actionsCreator } from '../context/user/actions';
import { PERMISSIONS_TYPES, PERMISSIONS } from '../constants/arconnect';

function useArConnect() {
  const arConnect = useAC();
  const dispatch = useDispatch();
  const { arAddress } = useSelector((state) => state.user);

  const walletSwitchListener = useCallback(
    (e: any) => dispatch(actionsCreator.setArAddress(e.detail.address)),
    [dispatch]
  );

  // Gets address if permissions are already granted.
  useEffect(() => {
    if (arConnect) {
      (async () => {
        try {
          const permissions = await arConnect.getPermissions();
          if (permissions.includes(PERMISSIONS_TYPES.ACCESS_ADDRESS)) {
            const address = await arConnect.getActiveAddress();
            dispatch(actionsCreator.setArAddress(address));
            window.addEventListener('walletSwitch', walletSwitchListener);
          }

          // Event cleaner
          return () =>
            window.removeEventListener('walletSwitch', walletSwitchListener);
        } catch {
          console.log("Couldn't get the wallet address");
        }
      })();
    }
  }, [arConnect, dispatch, walletSwitchListener]);

  const connect = useCallback(
    async (callback?: () => void) => {
      try {
        await arConnect.connect(PERMISSIONS);
        const address = await arConnect.getActiveAddress();

        dispatch(actionsCreator.setArAddress(address));
        window.addEventListener('walletSwitch', walletSwitchListener);
        callback?.();
      } catch {
        // @TODO: Improve this, perhaps a modal for letting the user know you weren't able to connect.
        console.warn("Couldn't connect with ArConnect");
      }
    },
    [arConnect, dispatch, walletSwitchListener]
  );

  const disconnect = useCallback(
    async (callback?: () => void) => {
      try {
        await arConnect.disconnect();

        dispatch(actionsCreator.clearArAddress());
        window.removeEventListener('walletSwitch', walletSwitchListener);
        callback?.();
      } catch {
        // @TODO: Improve this, perhaps a modal or a toast for letting the user know you weren't able to disconnect.
        console.warn("Couldn't disconnect ArConnect");
      }
    },
    [arConnect, dispatch, walletSwitchListener]
  );

  return {
    connect,
    disconnect,
    isAuthenticated: !!arAddress,
    isArConnectInstalled: !!arConnect
  };
}

export default useArConnect;
