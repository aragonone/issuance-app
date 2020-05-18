import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { isAddress } from 'web3-utils'
import { Button, Field, Info, SidePanel, TextInput, GU } from '@aragon/ui'
import { BLOCKS_PER_YEAR, ETHERS_BASE_DIGITS } from '../lib/constants'
import { parseUnits } from '../lib/web3-utils'

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

  const handleClose = useCallback(() => {
    onClose()
    setBeneficiary('')
    setInflationRate('')
  }, [])

  const handleAddPolicy = useCallback(() => {
    const parsedInflationRate = parseUnits(inflationRate)
    const preparedInflationRate = parsedInflationRate
      .div(100)
      // On this:
      // Due to not having decimals, precision is lost due to the division
      // that happens below. To avoid always having the issue of setting, for
      // example, a 50% policy, but on the radspec handler and the policy rate itself
      // being 49.99%, we add BLOCKS_PER_YEAR to the above number to force
      // "ceiling", instead of "flooring".
      .add(BLOCKS_PER_YEAR)
      .div(BLOCKS_PER_YEAR)
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
