import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Aragon, { events } from '@aragon/api'
import tokenAbi from './lib/abi/minimeToken.json'

const app = new Aragon()

const retryEvery = async (
  callback,
  { initialRetryTimer = 1000, increaseFactor = 3, maxRetries = 3 } = {}
) => {
  const sleep = time => new Promise(resolve => setTimeout(resolve, time))

  let retryNum = 0
  const attempt = async (retryTimer = initialRetryTimer) => {
    try {
      return await callback()
    } catch (err) {
      if (retryNum === maxRetries) {
        throw err
      }
      ++retryNum

      // Exponentially backoff attempts
      const nextRetryTime = retryTimer * increaseFactor
      console.log(
        `Retrying in ${nextRetryTime}s... (attempt ${retryNum} of ${maxRetries})`
      )
      await sleep(nextRetryTime)
      return attempt(nextRetryTime)
    }
  }

  return attempt()
}

// Get the token address to initialize ourselves
retryEvery(() =>
  app
    .call('token')
    .toPromise()
    .then(initialize)
    .catch(err => {
      console.error(
        'Could not start background script execution due to the contract not loading the token:',
        err
      )
      throw err
    })
)

async function initialize(tokenAddress) {
  function reducer(state, event) {
    const nextState = {
      ...state,
    }
    if (event === events.SYNC_STATUS_SYNCING) {
      return { ...nextState, isSyncing: true }
    } else if (event === events.SYNC_STATUS_SYNCED) {
      return { ...nextState, isSyncing: false }
    }

    const { event: eventName } = event

    switch (eventName) {
      case 'AddPolicy':
        return newAddedPolicy(nextState, event)
      case 'RemovePolicy':
        return newRemovedPolicy(nextState, event)
      default:
        return nextState
    }
  }
  return app.store(reducer, { init: initializeState({ tokenAddress }) })
}

/***********************
 *                     *
 *   Event Handlers    *
 *                     *
 ***********************/

function initializeState({ tokenAddress }) {
  return async cachedState => {
    const tokenSymbol = await app
      .external(tokenAddress, tokenAbi)
      .symbol()
      .toPromise()

    return {
      ...cachedState,
      tokenSymbol,
    }
  }
}

function newAddedPolicy(state, event) {
  const { event: eventName } = event
  const { beneficiary, blockInflationRate, policyId } = event.returnValues

  const newPolicies = updatePolicies(state.policies, eventName, {
    beneficiary,
    blockInflationRate,
    policyId,
  })

  return {
    ...state,
    policies: newPolicies,
  }
}

function newRemovedPolicy(state, event) {
  const { policyId } = event.returnValues
  const { event: eventName } = event
  const newPolicies = updatePolicies(state.policies, eventName, { policyId })

  return {
    ...state,
    policies: newPolicies,
  }
}

function updatePolicies(policies, event, config) {
  switch (event) {
    case 'AddPolicy':
      return addNewPolicy(policies, config)
    case 'RemovePolicy':
      return removePolicy(policies, config)
  }
}

function addNewPolicy(policies, { beneficiary, blockInflationRate, policyId }) {
  if (!policies) {
    return [{ beneficiary, blockInflationRate, id: policyId }]
  }

  return policies.concat([{ beneficiary, blockInflationRate, id: policyId }])
}

function removePolicy(policies, { policyId }) {
  return policies.filter(policy => policy.id !== policyId)
}
