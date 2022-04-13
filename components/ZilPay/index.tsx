import React from "react";
import { toast } from "react-toastify";
import ZilpayIcon from "../../src/assets/logos/lg_zilpay.svg";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { ZilPayBase } from "./zilpay-base";
import { Block, Net } from "../../src/types/zil-pay";
import {
  $zil_address,
  updateZilAddress,
  ZilAddress,
} from "../../src/store/zil_address";
import {
  $transactions,
  updateTxList,
  clearTxList,
  writeNewList,
} from "../../src/store/transactions";
import { updateNet } from "../../src/store/wallet-network";
import Image from "next/image";

let observer: any = null;
let observerNet: any = null;
let observerBlock: any = null;

export const ZilPay: React.FC = () => {
  const zil_address = useStore($zil_address);

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
          if (zil_address?.base16 !== address.base16) {
            updateZilAddress(address);
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
    [zil_address]
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
      }

      const cache = window.localStorage.getItem(
        String(zp.wallet.defaultAccount?.base16)
      );
      if (cache) {
        updateTxList(JSON.parse(cache));
      }
    } catch (err) {
      toast.error(`Connection error: ${err}`, {
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
  }, []);

  React.useEffect(() => {
    const wallet = new ZilPayBase();

    wallet
      .zilpay()
      .then((zp: any) => {
        hanldeObserverState(zp);
      })
      .catch(() => {
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
  });

  return (
    <>
      {zil_address === null && (
        <>
          <button
            type="button"
            className={styles.button}
            onClick={() => handleConnect()}
          >
            <div className={styles.zilpayIcon}>
              <Image alt="zilpay-ico" src={ZilpayIcon} />
            </div>
            <p className={styles.buttonText}>Connect ZilPay</p>
          </button>
        </>
      )}
      {zil_address !== null && (
        <>
          <h3>YOUR ZILLIQA WALLET IS CONNECTED</h3>
          <div className={styles.zilpayAddrWrapper}>
            <Image width={20} height={20} alt="zilpay-ico" src={ZilpayIcon} />
            <p className={styles.zilpayAddr}>
              {zil_address?.bech32.slice(0, 6)}...
              {zil_address?.bech32.slice(-6)}
            </p>
          </div>
        </>
      )}
    </>
  );
};

export default ZilPay;
