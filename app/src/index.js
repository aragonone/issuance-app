import React from 'react'
import ReactDOM from 'react-dom'
import { ViewportProvider } from 'use-viewport'
import { AragonApi } from '@aragon/api-react'
import App from './App'
import AppStateReducer from './app-state-reducer'

ReactDOM.render(
  <AragonApi reducer={AppStateReducer}>
    <ViewportProvider>
      <App />
    </ViewportProvider>
  </AragonApi>,
  document.getElementById('root')
)
