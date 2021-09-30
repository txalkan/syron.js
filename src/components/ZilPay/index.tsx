import React from 'react';
import { ReactComponent as ZilpayIcon } from '../../assets/logos/lg_zilpay.svg';
import styles from './styles.module.scss';
import { useStore } from 'effector-react';
import { ZilPayBase } from './zilpay-base';
import { Block, Net } from '../../types/zil-pay';
import { $wallet, updateAddress, Wallet } from '../../store/wallet';
import { $transactions, updateTxList, clearTxList, writeNewList } from '../../store/transactions';
import { updateNet, $net } from '../../store/wallet-network';

let observer: any = null;
let observerNet: any = null;
let observerBlock: any = null;

export const ZilPay: React.FC = () => {
    useStore($wallet);
    useStore($net);
    // @todo what is useStore for, is it necessary here?
    const transactions = useStore($transactions);
  
    const hanldeObserverState = React.useCallback((zp) => {
        updateNet(zp.wallet.net);
    
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
  
        observer = zp.wallet.observableAccount().subscribe((acc: Wallet) => {
            const address = $wallet.getState();
    
            if (address?.base16 !== acc.base16) {
              updateAddress(acc);
            }
    
            clearTxList();
    
            const cache = window.localStorage.getItem(String(zp.wallet.defaultAccount?.base16));
    
            if (cache) {
            updateTxList(JSON.parse(cache));
            }
        });
  
        observerBlock = zp.wallet.observableBlock().subscribe(async(block: Block) => {
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
            const listOrPromises = list.map(async(tx) => {
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
    
        if (zp.wallet.defaultAccount) {
            updateAddress(zp.wallet.defaultAccount);
        }
    
        const cache = window.localStorage.getItem(String(zp.wallet.defaultAccount?.base16));
    
        if (cache) {
            updateTxList(JSON.parse(cache));
        }
    }, [transactions]);
  
    const handleConnect = React.useCallback(async() => {
      //setLoading(true);
      try {
        const wallet = new ZilPayBase();
        const zp = await wallet.zilpay();
        const connected = await zp.wallet.connect();
  
        if (connected && zp.wallet.defaultAccount) {
          updateAddress(zp.wallet.defaultAccount);
          alert(`ZilPay connected. Address: ${zp.wallet.defaultAccount.base16}`)
        }
  
        updateNet(zp.wallet.net);
  
        const cache = window.localStorage.getItem(String(zp.wallet.defaultAccount?.base16));
  
        if (cache) {
          updateTxList(JSON.parse(cache));
        }
      } catch (err) {
          alert(`${err}`)
      }
      //setLoading(false);
    }, []);
  
    React.useEffect(() => {
      const wallet = new ZilPayBase();
  
      wallet
        .zilpay()
        .then((zp: any) => {
          hanldeObserverState(zp);
          //setLoading(false);
        })
        .catch((err: any) => {
          alert(`Error: ${err}`);
          //setLoading(false);
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
      }
    }, []);

    return (
        <button
            type="button"
            className={styles.button}
            onClick={() => handleConnect()}
        >
            <ZilpayIcon className={styles.zilpayIcon} />
            <p className={styles.buttonText}>ZilPay</p>
        </button>
    );
}

export default ZilPay;
