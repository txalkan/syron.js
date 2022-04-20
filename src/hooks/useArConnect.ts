import { useCallback } from "react";
import useAC from "use-arconnect";
import { toast } from "react-toastify";
import { useStore } from "effector-react";
import { useDispatch, useSelector } from "../context";
import { useDispatch as _dispatchRedux } from "react-redux";
import { actionsCreator } from "../context/user/actions";
import { PERMISSIONS_TYPES, PERMISSIONS } from "../constants/arconnect";
import { updateArConnect } from "../store/arconnect";
import { $ar_address, updateArAddress } from "../../src/store/ar_address";
import { updateLoginInfoArAddress } from "../app/actions";

function useArConnect() {
  const arConnect = useAC();
  const dispatch = useDispatch();
  const dispatchRedux = _dispatchRedux();
  const { arAddress } = useSelector((state) => state.user);
  const ar_address = useStore($ar_address);

  const walletSwitchListener = useCallback(
    (e: any) => dispatch(actionsCreator.setArAddress(e.detail.address)),
    [dispatch]
  );

  // Gets address if permissions are already granted.
  const connect = async () => {
    if (arConnect) {
      try {
        dispatch(actionsCreator.setArconnect(arConnect));
        updateArConnect(arConnect);

        const permissions = await arConnect.getPermissions();
        if (permissions.includes(PERMISSIONS_TYPES.ACCESS_ADDRESS)) {
          const address = await arConnect.getActiveAddress();
          toast.info(
            `Arweave wallet connected to ${address.slice(
              0,
              6
            )}...${address.slice(-6)}`,
            {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
              toastId: 2,
            }
          );

          dispatch(actionsCreator.setArAddress(address));
          dispatchRedux(updateLoginInfoArAddress(address));
          updateArAddress(address);
          window.addEventListener("walletSwitch", walletSwitchListener);
        } else {
          connectPermission();
        }

        // Event cleaner
        return () =>
          window.removeEventListener("walletSwitch", walletSwitchListener);
      } catch {
        toast.error("Couldn't get the wallet address.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          toastId: 2,
        });
      }
    } else {
      toast("Connect to send transactions.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        toastId: 2,
      });
    }
  };

  const connectPermission = useCallback(
    async (callback?: () => void) => {
      try {
        await arConnect.connect(PERMISSIONS);
        const address = await arConnect.getActiveAddress();

        dispatch(actionsCreator.setArAddress(address));
        dispatchRedux(updateLoginInfoArAddress(address));
        window.addEventListener("walletSwitch", walletSwitchListener);
        callback?.();
        toast.info(
          `Arweave wallet connected to ${address.slice(0, 6)}...${address.slice(
            -6
          )}`,
          {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            toastId: 2,
          }
        );
      } catch {
        toast.error("Couldn't connect with ArConnect.", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    },
    [arConnect, dispatch, walletSwitchListener]
  );

  const disconnect = useCallback(
    async (callback?: () => void) => {
      try {
        await arConnect.disconnect();

        dispatch(actionsCreator.clearArAddress());
        window.removeEventListener("walletSwitch", walletSwitchListener);
        callback?.();
      } catch {
        toast.error("Couldn't connect with ArConnect.", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    },
    [arConnect, dispatch, walletSwitchListener]
  );

  return {
    connect,
    disconnect,
    isAuthenticated: !!arAddress,
    isArConnectInstalled: !!arConnect,
    arAddress: ar_address,
  };
}

export default useArConnect;
