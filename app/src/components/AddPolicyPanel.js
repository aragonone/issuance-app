import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import BN from 'bn.js'
import { isAddress } from 'web3-utils'
import { Button, Field, Info, SidePanel, TextInput, GU } from '@aragon/ui'
import { PCT_BASE } from '../lib/constants'

export default function AddPolicyPanel({ onAdd, onClose, opened }) {
  const [beneficiary, setBeneficiary] = useState('')
  const [inflationRate, setInflationRate] = useState('')
  const firstRender = useRef(true)

  const handleBeneficiaryChange = useCallback(
    e => setBeneficiary(e.target.value),
    []
  )

  const handleInflationRateChange = useCallback(
    e => setInflationRate(e.target.value),
    []
  )

  const handleClose = useCallback(() => {
    onClose()
    setBeneficiary('')
    setInflationRate('')
  }, [])

  const handleAddPolicy = useCallback(() => {
    const preparedInflationRate = new BN(inflationRate)
      .mul(new BN(PCT_BASE))
      .toString()
    onAdd(beneficiary, preparedInflationRate).then(() => handleClose())
  })
  // Error if the provided beneficiary is not a valid address
  const beneficiaryError = useMemo(
    () => !isAddress(beneficiary) && beneficiary !== '',
    [beneficiary]
  )
  const percentageError = useMemo(
    () =>
      (Number(inflationRate) > 100 || Number(inflationRate) < 1) &&
      inflationRate !== '',
    [inflationRate]
  )
  const disabled = useMemo(
    () => beneficiaryError || percentageError || !beneficiary || !inflationRate,
    [beneficiaryError, percentageError, beneficiary, inflationRate]
  )

  return (
    <SidePanel onClose={handleClose} opened={opened} title="Add new policy">
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
          {beneficiaryError && (
            <Info
              mode="error"
              css={`
                margin-top ${1 * GU}px;
                margin-bottom: ${2 * GU}px;
              `}
            >
              {' '}
              This is not a valid Ethereum adddress.{' '}
            </Info>
          )}
        </Field>
        <Field label="Inflation Rate (in %)">
          <TextInput
            type="number"
            placeholder="1"
            value={inflationRate}
            onChange={handleInflationRateChange}
            css={`
              width: 100%;
            `}
          />
          {percentageError && (
            <Info
              mode="error"
              css={`
                margin-top: ${1 * GU}px;
                margin-bottom: ${2 * GU}px;
              `}
            >
              {' '}
              Please enter a number between 1 and 100.{' '}
            </Info>
          )}
        </Field>
      </div>
      <Button
        onClick={handleAddPolicy}
        mode="strong"
        label="Add policy"
        disabled={disabled}
      >
        Add policy
      </Button>
    </SidePanel>
  )
}
