import { createDomain } from 'effector'

const donationDomain = createDomain()
export const updateDonation = donationDomain.createEvent<number | null>()
export const $donation = donationDomain
    .createStore<number | null>(null)
    .on(updateDonation, (_, payload) => payload)

const extraZilDomain = createDomain()
export const updateExtraZil = extraZilDomain.createEvent<number | null>()
export const $extraZil = extraZilDomain
    .createStore<number | null>(null)
    .on(updateExtraZil, (_, payload) => payload)
