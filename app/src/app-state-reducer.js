import BN from 'bn.js'
import { BLOCKS_PER_YEAR, PCT_BASE } from './lib/constants.js'

function normalizeInflationRate(policies) {
  const policiesWithBN = policies.map(policy => ({
    ...policy,
    blockInflationRate: new BN(policy.blockInflationRate),
  }))

  return policiesWithBN.map(policy => ({
    ...policy,
    blockInflationRate: policy.blockInflationRate
      .mul(BLOCKS_PER_YEAR)
      .div(PCT_BASE)
      .toString(),
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

  const normalizedPolicies = normalizeInflationRate(state.policies)
  const sortedPolicies = sortPolicies(normalizedPolicies)
  return { ...state, policies: sortedPolicies }
}
