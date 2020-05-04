import React from 'react'
import ReactDOM from 'react-dom'
import { ViewportProvider } from 'use-viewport'
import { AragonApi } from '@aragon/api-react'
import App from './App'

const reducer = state => {
  if (state === null) {
    return { count: 0, isSyncing: true }
  }
  return state
}

ReactDOM.render(
  <AragonApi reducer={reducer}>
    <ViewportProvider>
      <App />
    </ViewportProvider>
  </AragonApi>,
  document.getElementById('root')
)
