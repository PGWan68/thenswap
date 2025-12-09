import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, TOKEN_ABI, DEX_ABI } from './contractsConfig';
import Swap from './components/Swap';
import LiquidityPool from './components/LiquidityPool';
import NFTMarket from './components/NFTMarket';
import Staking from './components/Staking';
import Portfolio from './components/Portfolio';

// 真实部署的代币数据
export const availableTokens = [
  { symbol: 'ETH', name: 'Ethereum', address: CONTRACT_ADDRESSES.ETH, balance: 0, price: 3000, decimals: 18 },
  { symbol: 'USDT', name: 'Tether USD', address: CONTRACT_ADDRESSES.USDT, balance: 0, price: 1, decimals: 18 },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: CONTRACT_ADDRESSES.DAI, balance: 0, price: 1, decimals: 18 },
  { symbol: 'THEN', name: 'Then Token', address: CONTRACT_ADDRESSES.THEN || '0x', balance: 0, price: 0.5, decimals: 18 },
];

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [userTokens, setUserTokens] = useState([]);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [dexContract, setDexContract] = useState(null);
  const [tokenContracts, setTokenContracts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tokenPrices, setTokenPrices] = useState({});

  // 连接钱包
  const connectWallet = async () => {
    try {
      setError('');
      setSuccessMessage('');
      
      // 检查是否有MetaMask或其他钱包
      if (!window.ethereum) {
        setError('请安装MetaMask或其他Web3钱包');
        return;
      }
      
      // 请求账户访问权限
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (!accounts || accounts.length === 0) {
        setError('未获取到账户信息');
        return;
      }
      
      // 设置提供商和签名者
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // 尝试获取网络信息
      let network;
      try {
        network = await provider.getNetwork();
      } catch (networkError) {
        console.warn('无法检测网络:', networkError);
        // 继续执行，即使网络检测失败
      }
      
      // 尝试获取签名者
      let signer;
      try {
        signer = await provider.getSigner();
      } catch (signerError) {
        console.error('获取签名者失败:', signerError);
        setError('获取签名者失败，请确保钱包已解锁');
        return;
      }
      
      setProvider(provider);
      setSigner(signer);
      setWalletAddress(accounts[0]);
      setWalletConnected(true);
      
      // 初始化合约
      try {
        await initializeContracts(provider, signer);
      } catch (contractError) {
        console.error('初始化合约失败:', contractError);
        setError('初始化合约失败，请检查网络连接');
        // 不返回，继续执行
      }
      
      // 监听账户变化
      if (window.ethereum.on) {
        window.ethereum.on('accountsChanged', (newAccounts) => {
          setWalletAddress(newAccounts[0]);
          setSigner(provider.getSigner());
        });
        
        // 监听网络变化
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
      setError('连接钱包失败: ' + error.message);
    }
  };
  
  // 初始化合约
  const initializeContracts = async (provider, signer) => {
    try {
      // 创建DEX合约实例
      const dexContract = new ethers.Contract(
        CONTRACT_ADDRESSES.DEX,
        DEX_ABI,
        signer
      );
      setDexContract(dexContract);
      
      // 创建代币合约实例
      const contracts = {};
      availableTokens.forEach(token => {
        contracts[token.symbol] = new ethers.Contract(
          token.address,
          TOKEN_ABI,
          signer
        );
      });
      setTokenContracts(contracts);
      
      // 获取代币余额
      await fetchTokenBalances();
      
      // 获取代币价格
      await fetchTokenPrices();
    } catch (error) {
      console.error('初始化合约失败:', error);
      setError('初始化合约失败: ' + error.message);
    }
  };
  
  // 获取代币余额
  const fetchTokenBalances = async () => {
    if (!walletConnected || !signer) return;
    
    try {
      setIsLoading(true);
      const updatedTokens = [...availableTokens];
      
      for (let i = 0; i < updatedTokens.length; i++) {
        const token = updatedTokens[i];
        try {
          // 获取代币余额
          const contract = tokenContracts[token.symbol];
          const balance = await contract.balanceOf(walletAddress);
          updatedTokens[i].balance = ethers.utils.formatUnits(balance, token.decimals);
        } catch (tokenError) {
          console.error(`获取${token.symbol}余额失败:`, tokenError);
          updatedTokens[i].balance = 0;
        }
      }
      
      setUserTokens(updatedTokens.filter(token => parseFloat(token.balance) > 0));
    } catch (error) {
      console.error('获取代币余额失败:', error);
      setError('获取代币余额失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 获取代币价格
  const fetchTokenPrices = async () => {
    if (!walletConnected || !dexContract) return;
    
    try {
      const prices = {};
      
      // 获取ETH-USDT价格
      const ethUsdtPrice = await dexContract.getPrice(
        CONTRACT_ADDRESSES.ETH,
        CONTRACT_ADDRESSES.USDT
      );
      prices.ETH = ethers.utils.formatUnits(ethUsdtPrice, 18);
      prices.USDT = '1';
      prices.DAI = '1';
      
      setTokenPrices(prices);
    } catch (error) {
      console.error('获取代币价格失败:', error);
      // 使用默认价格
      setTokenPrices({ ETH: '3000', USDT: '1', DAI: '1' });
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setUserTokens([]);
    setProvider(null);
    setSigner(null);
    setDexContract(null);
    setTokenContracts({});
  };

  // 处理代币兑换
  const handleSwap = async () => {
    if (!fromAmount || isNaN(fromAmount) || parseFloat(fromAmount) <= 0) {
      setError('请输入有效的兑换数量');
      return;
    }

    if (!walletConnected || !dexContract || !tokenContracts[fromToken] || !tokenContracts[toToken]) {
      setError('请先连接钱包');
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsSwapping(true);

    try {
      const fromTokenData = availableTokens.find(token => token.symbol === fromToken);
      const toTokenData = availableTokens.find(token => token.symbol === toToken);

      if (!fromTokenData || !toTokenData) {
        setError('无效的代币');
        return;
      }

      // 将金额转换为wei
      const amountInWei = ethers.utils.parseUnits(fromAmount, fromTokenData.decimals);
      
      // 批准DEX合约使用代币
      const fromTokenContract = tokenContracts[fromToken];
      const approveTx = await fromTokenContract.approve(
        CONTRACT_ADDRESSES.DEX,
        amountInWei
      );
      
      // 等待批准交易确认
      await approveTx.wait();
      
      // 执行兑换
      const swapTx = await dexContract.swap(
        fromTokenData.address,
        toTokenData.address,
        amountInWei
      );
      
      // 等待兑换交易确认
      await swapTx.wait();
      
      // 更新余额
      await fetchTokenBalances();
      
      // 计算实际兑换金额
      const fromValue = parseFloat(fromAmount) * parseFloat(tokenPrices[fromToken] || fromTokenData.price);
      const calculatedToAmount = fromValue / parseFloat(tokenPrices[toToken] || toTokenData.price);
      
      setToAmount(calculatedToAmount.toFixed(6));
      
      setSuccessMessage(`成功兑换 ${fromAmount} ${fromToken} 为 ${calculatedToAmount.toFixed(6)} ${toToken}`);
    } catch (error) {
      console.error('兑换失败:', error);
      setError('兑换失败: ' + error.message);
    } finally {
      setIsSwapping(false);
    }
  };
  
  // 处理发送代币变化
  const handleFromTokenChange = async (tokenSymbol) => {
    setFromToken(tokenSymbol);
    setToAmount('');
    await fetchTokenPrices();
  };
  
  // 处理接收代币变化
  const handleToTokenChange = async (tokenSymbol) => {
    setToToken(tokenSymbol);
    setToAmount('');
    await fetchTokenPrices();
  };
  
  // 处理发送金额变化
  const handleFromAmountChange = (amount) => {
    setFromAmount(amount);
    
    // 预估接收金额
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      const fromTokenData = availableTokens.find(token => token.symbol === fromToken);
      const toTokenData = availableTokens.find(token => token.symbol === toToken);

      if (fromTokenData && toTokenData) {
        const fromPrice = parseFloat(tokenPrices[fromToken] || fromTokenData.price);
        const toPrice = parseFloat(tokenPrices[toToken] || toTokenData.price);
        const fromValue = parseFloat(amount) * fromPrice;
        const calculatedToAmount = fromValue / toPrice;
        
        setToAmount(calculatedToAmount.toFixed(6));
      }
    } else {
      setToAmount('');
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="logo-container">
          <h1 onClick={() => setCurrentPage('home')} className="logo">ThenSwap</h1>
        </div>
        <nav className="nav">
          <button 
            className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
          <button 
            className={`nav-button ${currentPage === 'swap' ? 'active' : ''}`}
            onClick={() => setCurrentPage('swap')}
          >
            Swap
          </button>
          <button 
            className={`nav-button ${currentPage === 'liquidity' ? 'active' : ''}`}
            onClick={() => setCurrentPage('liquidity')}
          >
            Liquidity Pool
          </button>
          <button 
            className={`nav-button ${currentPage === 'nft' ? 'active' : ''}`}
            onClick={() => setCurrentPage('nft')}
          >
            NFT Market
          </button>
          <button 
            className={`nav-button ${currentPage === 'staking' ? 'active' : ''}`}
            onClick={() => setCurrentPage('staking')}
          >
            Staking
          </button>
          <button 
            className={`nav-button ${currentPage === 'portfolio' ? 'active' : ''}`}
            onClick={() => setCurrentPage('portfolio')}
          >
            Portfolio
          </button>
        </nav>
        <div className="wallet-section">
          {walletConnected ? (
            <div className="connected-wallet">
              <span className="wallet-address">{walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</span>
              <button className="disconnect-button" onClick={disconnectWallet}>
                断开连接
              </button>
            </div>
          ) : (
            <button className="connect-button" onClick={connectWallet}>
              连接钱包
            </button>
          )}
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        {!walletConnected ? (
          <div className="welcome-section">
            <h2>欢迎使用 ThenSwap</h2>
            <p>请连接您的钱包开始使用我们的服务</p>
            <button className="primary-button" onClick={connectWallet}>
              连接钱包
            </button>
          </div>
        ) : (
          <div className="content-container">
            {currentPage === 'home' && (
              <Home 
                userTokens={userTokens}
                tokenPrices={tokenPrices}
                walletConnected={walletConnected}
              />
            )}
            
            {currentPage === 'swap' && (
              <Swap 
                userTokens={userTokens}
                availableTokens={availableTokens}
                tokenPrices={tokenPrices}
                dexContract={dexContract}
                tokenContracts={tokenContracts}
                fetchTokenBalances={fetchTokenBalances}
                isLoading={isLoading}
              />
            )}
            
            {currentPage === 'liquidity' && (
              <LiquidityPool 
                userTokens={userTokens}
                availableTokens={availableTokens}
                tokenPrices={tokenPrices}
                dexContract={dexContract}
                tokenContracts={tokenContracts}
                fetchTokenBalances={fetchTokenBalances}
                isLoading={isLoading}
              />
            )}
            
            {currentPage === 'nft' && (
              <NFTMarket 
                walletAddress={walletAddress}
                provider={provider}
                signer={signer}
              />
            )}
            
            {currentPage === 'staking' && (
              <Staking 
                userTokens={userTokens}
                availableTokens={availableTokens}
                tokenPrices={tokenPrices}
                fetchTokenBalances={fetchTokenBalances}
              />
            )}
            
            {currentPage === 'portfolio' && (
              <Portfolio 
                userTokens={userTokens}
                tokenPrices={tokenPrices}
                walletAddress={walletAddress}
              />
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>ThenSwap</h3>
            <p>去中心化金融平台，提供代币兑换、流动性挖矿、NFT市场和质押服务</p>
          </div>
          <div className="footer-section">
            <h4>功能</h4>
            <ul>
              <li>Swap</li>
              <li>Liquidity Pool</li>
              <li>NFT Market</li>
              <li>Staking</li>
              <li>Portfolio</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>社交媒体</h4>
            <ul>
              <li>Twitter</li>
              <li>Discord</li>
              <li>Telegram</li>
              <li>GitHub</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 ThenSwap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App