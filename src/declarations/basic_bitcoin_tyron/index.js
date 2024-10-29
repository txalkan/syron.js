import { Actor, HttpAgent } from '@dfinity/agent'

// Imports and re-exports candid interface
import { idlFactory } from './basic_bitcoin_tyron.did.js'
export { idlFactory } from './basic_bitcoin_tyron.did.js'

/* CANISTER_ID is replaced by webpack based on node environment
 * Note: canister environment variable will be standardized as
 * process.env.CANISTER_ID_<CANISTER_NAME_UPPERCASE>
 * beginning in dfx 0.15.0
 */
export const canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SYRON

export const createActor = (canisterId, options = {}) => {
    // console.log('Options:', options)

    const agent = options.agent || new HttpAgent({ ...options.agentOptions })

    // console.log('Agent:', agent)

    //let newReplicaTime = Date.now() + 60000
    //newReplicaTime = new Date(newReplicaTime).toUTCString()
    //console.log('New replicaTime:', newReplicaTime)
    //agent.replicaTime = newReplicaTime

    if (options.agent && options.agentOptions) {
        console.warn(
            'Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.'
        )
    }

    // Fetch root key for certificate validation during development
    if (process.env.NEXT_PUBLIC_DFX_NETWORK !== 'ic') {
        agent.fetchRootKey().catch((err) => {
            console.warn(
                'Unable to fetch root key. Check to ensure that your local replica is running'
            )
            console.error(err)
        })
    }

    // Creates an actor with using the candid interface and the HttpAgent
    const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId,
        ...options.actorOptions,
    })

    // console.log('Actor:', actor)
    return actor
}

export const basic_bitcoin_syron = canisterId
    ? createActor(canisterId, {
          agentOptions: {
              host: 'https://icp-api.io', //'https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/',
          },
      })
    : undefined
