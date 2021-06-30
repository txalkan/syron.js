import { useCallback } from 'react';
import { useDispatch, useSelector } from '../context';
import { actionsCreator } from '../context/user/actions';

function useZilPay() {
    const dispatch = useDispatch();
    const { zilPay, zilAddress, zilNetwork } = useSelector(
        (state) => state.user
    );

    const connect = useCallback(
        async (callback?: () => void) => {
            try {
                const zilPay = (window as any).zilpay;
                // Check if ZilPay is installed
                if (typeof zilPay === 'undefined') {
                    console.warn(
                        'You have to install the ZilPay browser extension.'
                    );
                    return;
                }

                const result = await zilPay.wallet.connect();

                if (result !== zilPay.wallet.isConnect) {
                    console.warn("Couldn't connect with ZilPay");
                    return;
                }

                const zilAddress = zilPay.wallet.defaultAccount;
                const network = zilPay.wallet.net;
                dispatch(actionsCreator.setZilPay(zilPay));
                dispatch(actionsCreator.setZilAddress(zilAddress));
                dispatch(actionsCreator.setZilNetwork(network));
                callback?.();
            } catch {
                // @TODO: Improve this, perhaps a modal for letting the user know you weren't able to connect.
                console.warn("Couldn't connect with ZilPay");
            }
        },
        [zilPay, dispatch]
    );

    return {
        connect,
        isAuthenticated: !!zilAddress && !!zilNetwork,
        isZilPayInstalled: !!zilPay
    };
}

export default useZilPay;
