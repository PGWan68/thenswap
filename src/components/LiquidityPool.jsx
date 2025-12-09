import React, { useState } from 'react';
import { ethers } from 'ethers';

function LiquidityPool({ userTokens, availableTokens, tokenPrices, dexContract, tokenContracts, fetchTokenBalances, isLoading }) {
  const [tokenA, setTokenA] = useState('ETH');
  const [tokenB, setTokenB] = useState('USDT');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [liquidityError, setLiquidityError] = useState('');
  const [liquiditySuccess, setLiquiditySuccess] = useState('');

  // 处理代币A变化
  const handleTokenAChange = (tokenSymbol) => {
    setTokenA(tokenSymbol);
    calculateAmountB(amountA, tokenSymbol, tokenB);
  };

  // 处理代币B变化
  const handleTokenBChange = (tokenSymbol) => {
    setTokenB(tokenSymbol);
    calculateAmountB(amountA, tokenA, tokenSymbol);
  };

  // 处理金额A变化
  const handleAmountAChange = (amount) => {
    setAmountA(amount);
    calculateAmountB(amount, tokenA, tokenB);
  };

  // 计算金额B
  const calculateAmountB = (amountA, tokenASymbol, tokenBSymbol) => {
    if (!amountA || isNaN(amountA) || parseFloat(amountA) <= 0) {
      setAmountB('');
      return;
    }

    const tokenAData = availableTokens.find(token => token.symbol === tokenASymbol);
    const tokenBData = availableTokens.find(token => token.symbol === tokenBSymbol);

    if (tokenAData && tokenBData) {
      const tokenAPrice = parseFloat(tokenPrices[tokenASymbol] || tokenAData.price);
      const tokenBPrice = parseFloat(tokenPrices[tokenBSymbol] || tokenBData.price);
      const valueA = parseFloat(amountA) * tokenAPrice;
      const calculatedAmountB = valueA / tokenBPrice;
      setAmountB(calculatedAmountB.toFixed(6));
    }
  };

  // 添加流动性
  const handleAddLiquidity = async () => {
    if (!amountA || isNaN(amountA) || parseFloat(amountA) <= 0 || !amountB || isNaN(amountB) || parseFloat(amountB) <= 0) {
      setLiquidityError('请输入有效的金额');
      return;
    }

    if (!dexContract || !tokenContracts[tokenA] || !tokenContracts[tokenB]) {
      setLiquidityError('合约未初始化，请刷新页面重试');
      return;
    }

    setLiquidityError('');
    setLiquiditySuccess('');
    setIsAddingLiquidity(true);

    try {
      const tokenAData = availableTokens.find(token => token.symbol === tokenA);
      const tokenBData = availableTokens.find(token => token.symbol === tokenB);

      if (!tokenAData || !tokenBData) {
        setLiquidityError('无效的代币');
        return;
      }

      // 将金额转换为wei
      const amountAInWei = ethers.utils.parseUnits(amountA, tokenAData.decimals);
      const amountBInWei = ethers.utils.parseUnits(amountB, tokenBData.decimals);

      // 批准DEX合约使用代币A
      const tokenAContract = tokenContracts[tokenA];
      const approveTxA = await tokenAContract.approve(dexContract.address, amountAInWei);
      await approveTxA.wait();

      // 批准DEX合约使用代币B
      const tokenBContract = tokenContracts[tokenB];
      const approveTxB = await tokenBContract.approve(dexContract.address, amountBInWei);
      await approveTxB.wait();

      // 添加流动性
      const addLiquidityTx = await dexContract.addLiquidity(
        tokenAData.address,
        tokenBData.address,
        amountAInWei,
        amountBInWei
      );
      await addLiquidityTx.wait();

      // 更新余额
      await fetchTokenBalances();

      setLiquiditySuccess(`成功添加 ${amountA} ${tokenA} 和 ${amountB} ${tokenB} 到流动性池`);
      setAmountA('');
      setAmountB('');
    } catch (error) {
      console.error('添加流动性失败:', error);
      setLiquidityError('添加流动性失败: ' + error.message);
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  // 获取流动性池列表
  const getLiquidityPools = () => {
    // 返回示例数据
    return [
      { pair: 'ETH-USDT', myLiquidity: 100, totalLiquidity: 1000, apr: 15.5 },
      { pair: 'DAI-USDT', myLiquidity: 50, totalLiquidity: 800, apr: 8.2 },
      { pair: 'ETH-DAI', myLiquidity: 200, totalLiquidity: 1500, apr: 12.7 },
    ];
  };

  return (
    <div className="liquidity-container">
      <div className="feature-card">
        <h2 className="section-title">添加流动性</h2>
        
        {liquidityError && (
          <div className="error-message">
            {liquidityError}
          </div>
        )}
        {liquiditySuccess && (
          <div className="success-message">
            {liquiditySuccess}
          </div>
        )}

        <div className="liquidity-form">
          <div className="liquidity-input-group">
            <label>代币A</label>
            <input
              type="number"
              value={amountA}
              onChange={(e) => handleAmountAChange(e.target.value)}
              placeholder="输入数量"
              step="0.000001"
              disabled={isAddingLiquidity}
            />
            <select value={tokenA} onChange={(e) => handleTokenAChange(e.target.value)} disabled={isAddingLiquidity}>
              {availableTokens.map((token) => (
                <option key={token.address} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          <div className="liquidity-input-group">
            <label>代币B</label>
            <input
              type="number"
              value={amountB}
              placeholder="系统计算"
              readOnly
              step="0.000001"
            />
            <select value={tokenB} onChange={(e) => handleTokenBChange(e.target.value)} disabled={isAddingLiquidity}>
              {availableTokens.map((token) => (
                <option key={token.address} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="primary-button"
            onClick={handleAddLiquidity}
            disabled={isAddingLiquidity || isLoading || !amountA || !amountB}
          >
            {isAddingLiquidity ? '添加中...' : '添加流动性'}
          </button>
        </div>
      </div>

      <div className="feature-card">
        <h2 className="section-title">我的流动性池</h2>
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : (
          <div className="pools-grid">
            {getLiquidityPools().map((pool, index) => (
              <div key={index} className="feature-card">
                <h3>{pool.pair}</h3>
                <div className="pool-info">
                  <p>我的流动性: {pool.myLiquidity} LP</p>
                  <p>总流动性: {pool.totalLiquidity} LP</p>
                  <p>年化收益: {pool.apr}%</p>
                </div>
                <div className="pool-actions">
                  <button className="connect-button">查看详情</button>
                  <button className="disconnect-button">移除流动性</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LiquidityPool;