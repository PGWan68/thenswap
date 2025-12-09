import React, { useState } from 'react';
import { ethers } from 'ethers';

function Swap({ userTokens, availableTokens, tokenPrices, dexContract, tokenContracts, fetchTokenBalances, isLoading }) {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDT');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState('');
  const [swapSuccess, setSwapSuccess] = useState('');

  // 处理代币变化
  const handleFromTokenChange = (tokenSymbol) => {
    setFromToken(tokenSymbol);
    calculateToAmount(fromAmount, tokenSymbol, toToken);
  };

  const handleToTokenChange = (tokenSymbol) => {
    setToToken(tokenSymbol);
    calculateToAmount(fromAmount, fromToken, tokenSymbol);
  };

  // 处理金额变化
  const handleFromAmountChange = (amount) => {
    setFromAmount(amount);
    calculateToAmount(amount, fromToken, toToken);
  };

  // 计算兑换金额
  const calculateToAmount = (amount, fromTokenSymbol, toTokenSymbol) => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setToAmount('');
      return;
    }

    const fromTokenData = availableTokens.find(token => token.symbol === fromTokenSymbol);
    const toTokenData = availableTokens.find(token => token.symbol === toTokenSymbol);

    if (fromTokenData && toTokenData) {
      const fromPrice = parseFloat(tokenPrices[fromTokenSymbol] || fromTokenData.price);
      const toPrice = parseFloat(tokenPrices[toTokenSymbol] || toTokenData.price);
      const fromValue = parseFloat(amount) * fromPrice;
      const calculatedToAmount = fromValue / toPrice;
      setToAmount(calculatedToAmount.toFixed(6));
    }
  };

  // 交换代币
  const handleSwap = async () => {
    if (!fromAmount || isNaN(fromAmount) || parseFloat(fromAmount) <= 0) {
      setSwapError('请输入有效的兑换数量');
      return;
    }

    if (!dexContract || !tokenContracts[fromToken] || !tokenContracts[toToken]) {
      setSwapError('合约未初始化，请刷新页面重试');
      return;
    }

    setSwapError('');
    setSwapSuccess('');
    setIsSwapping(true);

    try {
      const fromTokenData = availableTokens.find(token => token.symbol === fromToken);
      const toTokenData = availableTokens.find(token => token.symbol === toToken);

      if (!fromTokenData || !toTokenData) {
        setSwapError('无效的代币');
        return;
      }

      // 将金额转换为wei
      const amountInWei = ethers.utils.parseUnits(fromAmount, fromTokenData.decimals);
      
      // 批准DEX合约使用代币
      const fromTokenContract = tokenContracts[fromToken];
      const approveTx = await fromTokenContract.approve(
        dexContract.address,
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
      
      setSwapSuccess(`成功兑换 ${fromAmount} ${fromToken} 为 ${calculatedToAmount.toFixed(6)} ${toToken}`);
    } catch (error) {
      console.error('兑换失败:', error);
      setSwapError('兑换失败: ' + error.message);
    } finally {
      setIsSwapping(false);
    }
  };

  // 交换代币输入
  const swapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  return (
    <div className="swap-container">
      <div className="feature-card">
        <h2 className="section-title">代币兑换</h2>
        
        {swapError && (
          <div className="error-message">
            {swapError}
          </div>
        )}
        {swapSuccess && (
          <div className="success-message">
            {swapSuccess}
          </div>
        )}

        <div className="swap-form">
          <div className="swap-input-group">
            <label>发送</label>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              placeholder="输入数量"
              step="0.000001"
              disabled={isSwapping}
            />
            <select value={fromToken} onChange={(e) => handleFromTokenChange(e.target.value)} disabled={isSwapping}>
              {availableTokens.map((token) => (
                <option key={token.address} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          <div className="swap-arrow">
            <button onClick={swapTokens} disabled={isSwapping}>
              ↓↑
            </button>
          </div>

          <div className="swap-input-group">
            <label>接收</label>
            <input
              type="number"
              value={toAmount}
              placeholder="预估数量"
              readOnly
              step="0.000001"
            />
            <select value={toToken} onChange={(e) => handleToTokenChange(e.target.value)} disabled={isSwapping}>
              {availableTokens.map((token) => (
                <option key={token.address} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="swap-button primary-button"
            onClick={handleSwap}
            disabled={isSwapping || isLoading}
          >
            {isSwapping ? '兑换中...' : '确认兑换'}
          </button>
        </div>
      </div>

      <div className="feature-card">
        <h2 className="section-title">我的资产</h2>
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : (
          <ul className="token-list">
            {userTokens.map((token, index) => (
              <li key={index} className="token-item">
                <div className="token-info">
                  <span className="token-symbol">{token.symbol}</span>
                  <span className="token-name">{token.name}</span>
                </div>
                <div className="token-balance">
                  <span>{parseFloat(token.balance).toFixed(6)} {token.symbol}</span>
                  <span className="token-value">
                    ${(parseFloat(token.balance) * parseFloat(tokenPrices[token.symbol] || token.price)).toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Swap;