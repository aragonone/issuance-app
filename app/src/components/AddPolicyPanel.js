import React, { useState, useCallback } from 'react'
import BN from 'bn.js'
import { Button, Field, SidePanel, TextInput, GU } from '@aragon/ui'
import { PCT_BASE } from '../lib/constants'

export default function AddPolicyPanel({ onAdd, onClose, opened }) {
  const [beneficiary, setBeneficiary] = useState('')
  const [inflationRate, setInflationRate] = useState('')

  const handleBeneficiaryChange = useCallback(
    e => setBeneficiary(e.target.value),
    []
  )

  const handleInflationRateChange = useCallback(
    e => setInflationRate(e.target.value),
    []
  )

  const handleAddPolicy = useCallback(() => {
    const preparedInflationRate = new BN(inflationRate)
      .mul(new BN(PCT_BASE))
      .toString()
    console.log(preparedInflationRate)
    onAdd(beneficiary, preparedInflationRate)
  })

  return (
    <SidePanel onClose={onClose} opened={opened} title="Add new policy">
      <div
        css={`
          margin-top: ${2 * GU}px;
          width: 100%:
        `}
      >
        <Field label="Beneficiary">
          <TextInput
            placeholder="0xcafe"
            value={beneficiary}
            onChange={handleBeneficiaryChange}
            css={`
              width: 100%;
            `}
          />
        </Field>
        <Field label="Inflation Rate (in %)">
          <TextInput
            placeholder="1"
            value={inflationRate}
            onChange={handleInflationRateChange}
            css={`
              width: 100%;
            `}
          />
        </Field>
      </div>
      <Button onClick={handleAddPolicy} mode="strong" label="Add policy">
        Add policy
      </Button>
    </SidePanel>
  )
}
