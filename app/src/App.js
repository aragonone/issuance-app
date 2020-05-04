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
  IconEnter,
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

  const { count, isSyncing } = appState

  const theme = useTheme()
  const { below } = useViewport()

  const compactMode = below('medium')

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
              icon={<IconEnter />}
              display={compactMode ? 'icon' : 'all'}
              onClick={() => api.increment(1).toPromise()}
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
        entries={[
          { account: '0x5790dB5E4D9e868BB86F5280926b9838758234DD', rate: '5' },
          { account: '0x5790dB5E4D9e868BB86F5280926b9838758234DD', rate: '5' },
          { account: '0x5790dB5E4D9e868BB86F5280926b9838758234DD', rate: '5' },
        ]}
        renderEntry={({ account, rate }) => {
          return [
            <IdentityBadge entity={account} />,
            <div
              css={`
                ${textStyle('body2')}
              `}
            >
              {rate}%
            </div>,
          ]
        }}
        renderEntryActions={({ account, rate }, index) => {
          return (
            <ContextMenu>
              <ContextMenuItem
                onClick={() => api.decrement(1).toPromise()}
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
