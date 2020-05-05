import React, { useState, useCallback } from 'react'
import { useViewport } from 'use-viewport'
import { useAragonApi } from '@aragon/api-react'
import {
  Button,
  ContextMenu,
  ContextMenuItem,
  DataView,
  GU,
  Header,
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
  React.useEffect(() => {
    console.log('appState', appState)
  }, [appState])
  const { policies, isSyncing, tokenSymbol } = appState

  const theme = useTheme()
  const { below } = useViewport()

  const compactMode = below('medium')

  const handleAdd = React.useCallback(
    async (beneficiary, inflationRate) => {
      api
        .addPolicy(
          beneficiary,
          inflationRate
        )
        .toPromise()
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
              mode="strong"
              label="Execute policies"
              icon={<IconFundraising />}
              display={compactMode ? 'icon' : 'all'}
              onClick={handleExecute}
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
        fields={['Beneficiary', 'Rate', 'State']}
        entries={policies}
        renderEntry={({ beneficiary, blockInflationRate, executed }) => {
          return [
            <IdentityBadge entity={beneficiary} />,
            <div
              css={`
                ${textStyle('body2')}
              `}
            >
              {blockInflationRate}%
            </div>,
            <div
              css={`
              ${textStyle('label2')}
              color: ${executed ? theme.positive : theme.warning}
            `}
            >
              {executed ? 'Executed' : 'Awaiting'}
            </div>,
          ]
        }}
        renderEntryActions={({ executed, id }) => {
          if (executed) {
            return null
          }

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
