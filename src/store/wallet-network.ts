import { createDomain } from 'effector';
import { Net } from '../types/zil-pay';

const netDomain = createDomain();
export const updateNet = netDomain.createEvent<Net>();
export const $net = netDomain
  .createStore<Net>('mainnet')
  .on(updateNet, (_, payload) => {

    switch (payload) {
      case 'mainnet':
        return payload;
      case 'testnet':
        return payload;
      case 'private':
        return payload;
      default:
        return 'mainnet';
    }
  });
