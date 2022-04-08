import { createDomain } from "effector";

export interface Doc {
  did: string;
  version: string;
  doc: any[];
  dkms: any;
  guardians: any;
}

const docDomain = createDomain();
export const updateDoc = docDomain.createEvent<Doc | null>();
export const $doc = docDomain
  .createStore<Doc | null>(null)
  .on(updateDoc, (_, payload) => payload);
