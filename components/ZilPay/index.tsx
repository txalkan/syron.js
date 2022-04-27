import React from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import ZilpayIcon from "../../src/assets/logos/lg_zilpay.svg";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { useSelector } from "react-redux";
import { ZilPayBase } from "./zilpay-base";
import { Block, Net } from "../../src/types/zil-pay";
import { updateZilAddress, ZilAddress } from "../../src/store/zil_address";
import {
  $transactions,
  updateTxList,
  clearTxList,
  writeNewList,
} from "../../src/store/transactions";
import { $net, updateNet } from "../../src/store/wallet-network";
import { updateModalDashboard } from "../../src/store/modal";
import { updateLoginInfoZilpay } from "../../src/app/actions";
import { RootState } from "../../src/app/reducers";
import Image from "next/image";

let observer: any = null;
let observerNet: any = null;
let observerBlock: any = null;

export const ZilPay: React.FC = () => {
  const dispatch = useDispatch();
  const net = useStore($net);
  const zilAddr = useSelector((state: RootState) => state.modal.zilAddr);

  const hanldeObserverState = React.useCallback(
    (zp) => {
      if (zp.wallet.net) {
        updateNet(zp.wallet.net);
      }

      if (observerNet) {
        observerNet.unsubscribe();
      }
      if (observer) {
        observer.unsubscribe();
      }
      if (observerBlock) {
        observerBlock.unsubscribe();
      }

      observerNet = zp.wallet.observableNetwork().subscribe((net: Net) => {
        updateNet(net);
      });

      observer = zp.wallet
        .observableAccount()
        .subscribe(async (address: ZilAddress) => {
          if (zilAddr?.base16 !== address.base16) {
            updateZilAddress(address);
            dispatch(updateLoginInfoZilpay(address));
          }

          clearTxList();

          const cache = window.localStorage.getItem(
            String(zp.wallet.defaultAccount?.base16)
          );

          if (cache) {
            updateTxList(JSON.parse(cache));
          }
        });

      observerBlock = zp.wallet
        .observableBlock()
        .subscribe(async (block: Block) => {
          let list = $transactions.getState();
          for (let index = 0; index < block.TxHashes.length; index++) {
            const element = block.TxHashes[index];

            for (let i = 0; i < list.length; i++) {
              const tx = list[i];

              if (tx.confirmed) {
                continue;
              }

              if (element.includes(tx.hash)) {
                try {
                  const res = await zp.blockchain.getTransaction(tx.hash);
                  if (res && res.receipt && res.receipt.errors) {
                    tx.error = true;
                  }
                  list[i].confirmed = true;
                } catch {
                  continue;
                }
              }
            }
          }
          const listOrPromises = list.map(async (tx) => {
            if (tx.confirmed) {
              return tx;
            }

            try {
              const res = await zp.blockchain.getTransaction(tx.hash);

              if (res && res.receipt && res.receipt.errors) {
                tx.error = true;
              }

              tx.confirmed = true;
              return tx;
            } catch {
              return tx;
            }
          });

          list = await Promise.all(listOrPromises);
          writeNewList(list);
        });

      const cache = window.localStorage.getItem(
        String(zp.wallet.defaultAccount?.base16)
      );

      if (cache) {
        updateTxList(JSON.parse(cache));
      }
    },
    [zilAddr, dispatch]
  );

  const handleConnect = React.useCallback(async () => {
    try {
      const wallet = new ZilPayBase();
      const zp = await wallet.zilpay();
      const connected = await zp.wallet.connect();

      const network = zp.wallet.net;
      updateNet(network);

      if (connected && zp.wallet.defaultAccount) {
        const address = zp.wallet.defaultAccount;
        updateZilAddress(address);
        dispatch(updateLoginInfoZilpay(address));
        // updateModalDashboard(true);
      }

      const cache = window.localStorage.getItem(
        String(zp.wallet.defaultAccount?.base16)
      );
      if (cache) {
        updateTxList(JSON.parse(cache));
      }
    } catch (err) {
      toast.error(String(err), {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  }, [dispatch]);

  React.useEffect(() => {
    if (zilAddr === null) {
      handleConnect(); //@todo-i only prompt to connect when the user clicks on CONNECT
    } else {
      const wallet = new ZilPayBase();
      wallet
        .zilpay()
        .then((zp: any) => {
          hanldeObserverState(zp);
        })
        .catch(() => {
          updateModalDashboard(false);
          handleConnect();
          toast.info(`Unlock the ZilPay browser extension.`, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            toastId: 1,
          });
        });
    }

    return () => {
      if (observer) {
        observer.unsubscribe();
      }
      if (observerNet) {
        observerNet.unsubscribe();
      }
      if (observerBlock) {
        observerBlock.unsubscribe();
      }
    };
  }, [handleConnect, hanldeObserverState, zilAddr, dispatch]);

  const disconnectZilpay = () => {
    updateZilAddress(null!);
    dispatch(updateLoginInfoZilpay(null!));
    toast.info("Zilliqa wallet disconnected.", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      toastId: 2,
    });
    updateModalDashboard(false);
  };

  return <></>;
};

export default ZilPay;
