import { useEffect, useCallback } from "react";
import useArConnect from "use-arconnect";

import { useDispatch, useSelector } from "../context";
import { actionsCreator } from "../context/user/actions";
import { PERMISSIONS_TYPES, PERMISSIONS } from "../constants/arconnect";

function useAuthentication() {
  const arConnect = useArConnect();
  const dispatch = useDispatch();
  const { address } = useSelector((state) => state.user);

  const walletSwitchListener = useCallback(
    (e: any) => dispatch(actionsCreator.setAddress(e.detail.address)),
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
            dispatch(actionsCreator.setAddress(address));
            window.addEventListener("walletSwitch", walletSwitchListener);
          }

          // Event cleaner
          return () =>
            window.removeEventListener("walletSwitch", walletSwitchListener);
        } catch {
          console.log("Couldn't get the wallet address");
        }
      })();
    }
  }, [arConnect, dispatch, walletSwitchListener]);

  const connect = useCallback(async (callback?: () => void) => {
    try {
      await arConnect.connect(PERMISSIONS);
      const address = await arConnect.getActiveAddress();

      dispatch(actionsCreator.setAddress(address));
      window.addEventListener("walletSwitch", walletSwitchListener);
      callback?.();
    } catch {
      // @TODO: Improve this, perhaps a modal for letting the user know you weren't able to connect.
      console.warn("Couldn't connect");
    }
  }, [arConnect, dispatch, walletSwitchListener]);

  const disconnect = useCallback(async (callback?: () => void) => {
    try {
      await arConnect.disconnect();

      dispatch(actionsCreator.clearAddress());
      window.removeEventListener("walletSwitch", walletSwitchListener);
      callback?.();
    } catch {
      // @TODO: Improve this, perhaps a modal or a toast for letting the user know you weren't able to disconnect.
      console.warn("Couldn't disconnect");
    }
  }, [arConnect, dispatch, walletSwitchListener]);

  return {
    connect,
    disconnect,
    isAuthenticated: !!address,
    isArConnectInstalled: !!arConnect,
  };
}

export default useAuthentication;
