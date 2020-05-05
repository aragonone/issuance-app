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

export default function AppStateReducer(state) {
  if (state === null) {
    return { policies: [], isSyncing: true, tokenSymbol: null }
  }

  const normalizedPolicies = normalizeInflationRate(state.policies)
  return { ...state, policies: normalizedPolicies }
}
