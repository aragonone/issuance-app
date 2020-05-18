import BN from 'bn.js'
import { BLOCKS_PER_YEAR, PCT_BASE } from './lib/constants.js'
import { formatUnits } from './lib/web3-utils'

function normalizeInflationRate(policies) {
  const preparedPolicies = policies.map(policy => ({
    ...policy,
    blockInflationRate: formatUnits(
      new BN(policy.blockInflationRate).mul(BLOCKS_PER_YEAR)
    ),
  }))

  return preparedPolicies.map(policy => ({
    ...policy,
    blockInflationRate: (Number(policy.blockInflationRate) * 100).toFixed(2),
  }))
}

function sortPolicies(policies) {
  return policies.sort((policyA, policyB) =>
    Number(policyA.id) < Number(policyB.id) ? 1 : -1
  )
}

export default function AppStateReducer(state) {
  if (state === null) {
    return { policies: [], isSyncing: true, tokenSymbol: null }
  }

  const normalizedPolicies = normalizeInflationRate(state.policies || [])
  const sortedPolicies = sortPolicies(normalizedPolicies)
  return { ...state, policies: sortedPolicies }
}
