import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 模拟web3环境
window.ethereum = {
  request: async (args) => {
    if (args.method === 'eth_requestAccounts') {
      return ['0x742d35Cc6634C0532925a3b80152609BCd365714'];
    }
    return [];
  },
  on: () => {},
  removeListener: () => {}
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)