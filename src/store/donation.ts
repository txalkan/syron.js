import { createDomain } from 'effector';

export let Donation: string;

const donationDomain = createDomain();
export const updateDonation = donationDomain.createEvent<string | null>();
export const $donation = donationDomain
    .createStore<string | null>(null)
    .on(updateDonation, (_, payload) => payload);
