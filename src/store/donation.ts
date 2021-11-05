import { createDomain } from 'effector';

export let Donation: number;

const donationDomain = createDomain();
export const updateDonation = donationDomain.createEvent<number | null>();
export const $donation = donationDomain
    .createStore<number | null>(null)
    .on(updateDonation, (_, payload) => payload);
