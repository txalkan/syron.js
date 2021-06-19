import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';

export interface IPermawallet {
  arweave: Arweave;
  arconnect: string;
  address: string;
  username: string;
  domain: string;
  keyfile: JWKInterface | 'use_wallet';
  ivms101: string | undefined;
}
