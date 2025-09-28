import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Web3Provider } from './contexts/Web3Context'
import { DataProvider } from './contexts/DataContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Web3Provider>
      <DataProvider>
        <App />
      </DataProvider>
    </Web3Provider>
  </React.StrictMode>,
)
