import React from 'react'
import { useViewport } from 'use-viewport'
import { useAragonApi } from '@aragon/api-react'
import {
  Box,
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

function App() {
  const { api, appState } = useAragonApi()
  React.useEffect(() => {
    console.log('appState', appState)
  }, [appState])
  const { policies, isSyncing } = appState

  const theme = useTheme()
  const { below } = useViewport()

  const compactMode = below('medium')

  const handleAdd = React.useCallback(async () => {
    const add = api
      .addPolicy(
        '0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb',
        '10000000000000000'
      )
      .toPromise()
    console.log(add, 'add')
  }, [api])

  return (
    <Main>
      {isSyncing && <SyncIndicator />}
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
              label="IST"
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
              onClick={handleAdd}
              css={`
                margin-right: ${1 * GU}px;
              `}
            />
            <Button
              mode="strong"
              label="New policy"
              icon={<IconAdd />}
              onClick={() => api.decrement(1).toPromise()}
              display={compactMode ? 'icon' : 'all'}
            />
          </>
        }
      />
      <DataView
        fields={['Beneficiary', 'Rate']}
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
        renderEntryActions={({ policyid }, index) => {
          return (
            <ContextMenu>
              <ContextMenuItem
                onClick={() => api.removePolicy(0).toPromise()}
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
