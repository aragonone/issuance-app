import React, { useState, useCallback, useMemo } from 'react'
import { useViewport } from 'use-viewport'
import { useAragonApi } from '@aragon/api-react'
import {
  Button,
  ContextMenu,
  ContextMenuItem,
  DataView,
  GU,
  Header,
  Help,
  IconAdd,
  IconFundraising,
  IconTrash,
  IdentityBadge,
  Main,
  SyncIndicator,
  Tag,
  textStyle,
  useTheme,
} from '@aragon/ui'
import AddPolicyPanel from './components/AddPolicyPanel'

function App() {
  const [addPolicyPanelOpen, setAddPolicyPanelOpen] = useState(false)
  const { api, appState } = useAragonApi()
  const { policies, isSyncing, tokenSymbol } = appState

  const theme = useTheme()
  const { below } = useViewport()

  const compactMode = below('medium')

  const handleAdd = React.useCallback(
    (beneficiary, inflationRate) => {
      return api.addPolicy(beneficiary, inflationRate).toPromise()
    },
    [api]
  )

  const handleExecute = useCallback(() => api.executeIssuance().toPromise(), [
    api,
  ])

  const handleRemove = useCallback(id => api.removePolicy(id).toPromise(), [
    api,
  ])

  const handleAddPolicyPanelOpen = useCallback(
    () => setAddPolicyPanelOpen(true),
    []
  )
  const handleAddPolicyPanelClose = useCallback(
    () => setAddPolicyPanelOpen(false),
    []
  )

  const executeDisabled = useMemo(() => policies.length === 0, [policies])

  return (
    <Main>
      {isSyncing && <SyncIndicator />}
      <AddPolicyPanel
        onAdd={handleAdd}
        onClose={handleAddPolicyPanelClose}
        opened={addPolicyPanelOpen}
      />
      <Header
        primary={
          <div
            css={`
              display: flex;
              justify-content: center;
              align-items: center;
            `}
          >
            <div
              css={`
                ${textStyle('title2')}
              `}
            >
              Issuance
            </div>
            <Tag
              mode="identifier"
              label={tokenSymbol}
              css={`
                margin-left: ${1 * GU}px;
                margin-top: ${0.5 * GU}px;
              `}
            />
          </div>
        }
        secondary={
          <>
            <Button
              label="Execute policies"
              icon={<IconFundraising />}
              display={compactMode ? 'icon' : 'all'}
              onClick={handleExecute}
              disabled={executeDisabled}
              css={`
                margin-right: ${1 * GU}px;
              `}
            />
            <Button
              mode="strong"
              label="New policy"
              icon={<IconAdd />}
              onClick={handleAddPolicyPanelOpen}
              display={compactMode ? 'icon' : 'all'}
            />
          </>
        }
      />
      <DataView
        fields={[
          'Beneficiary',
          <span
            css={`
              display: inline-flex;
              align-items: center;
            `}
          >
            <span css="margin: 2px 5px 0 0;">Rate</span>
            <span css="margin-right: 2px">
              <Help hint="What's the rate?">
                Rate the is approximation of the annual issuance of a single
                policy without accounting for compounding or other changes to
                total supply, the actual rate of issuance depends on total
                supply each time the policy is executed.
              </Help>
            </span>
          </span>,
        ]}
        entries={policies}
        renderEntry={({ beneficiary, blockInflationRate }) => {
          return [
            <IdentityBadge entity={beneficiary} />,
            <div
              css={`
                ${textStyle('body2')}
              `}
            >
              {blockInflationRate}%
            </div>,
          ]
        }}
        renderEntryActions={({ id }) => {
          return (
            <ContextMenu>
              <ContextMenuItem
                onClick={() => handleRemove(id)}
                css={`
                  color: ${theme.negative};
                `}
              >
                <IconTrash /> Remove policy
              </ContextMenuItem>
            </ContextMenu>
          )
        }}
      />
    </Main>
  )
}

export default App
