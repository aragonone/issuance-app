import BN from 'bn.js'

const PCT_BASE = new BN('10000000000000000')

function normalizeInflationRate(policies) {
  const policiesWithBN = policies.map(policy => ({
    ...policy,
    blockInflationRate: new BN(policy.blockInflationRate),
  }))

  return policiesWithBN.map(policy => ({
    ...policy,
    blockInflationRate: policy.blockInflationRate.div(PCT_BASE).toString(),
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
