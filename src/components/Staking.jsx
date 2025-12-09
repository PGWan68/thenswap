import React, { useState } from 'react';

function Staking({ userTokens, availableTokens, tokenPrices, fetchTokenBalances }) {
  const [stakingAmount, setStakingAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [stakingError, setStakingError] = useState('');
  const [stakingSuccess, setStakingSuccess] = useState('');
  const [selectedPool, setSelectedPool] = useState('THEN-ETH');

  // 示例质押池数据
  const stakingPools = [
    {
      id: 'THEN-ETH',
      name: 'THEN-ETH 质押池',
      tokenA: 'THEN',
      tokenB: 'ETH',
      apr: 25.5,
      totalStaked: 15000,
      myStake: 500,
      rewards: 12.5
    },
    {
      id: 'THEN-USDT',
      name: 'THEN-USDT 质押池',
      tokenA: 'THEN',
      tokenB: 'USDT',
      apr: 18.2,
      totalStaked: 25000,
      myStake: 0,
      rewards: 0
    },
    {
      id: 'THEN',
      name: 'THEN 单币质押池',
      tokenA: 'THEN',
      tokenB: '',
      apr: 12.8,
      totalStaked: 50000,
      myStake: 1000,
      rewards: 25.3
    }
  ];

  // 获取用户的THEN代币余额
  const getUserThenBalance = () => {
    const thenToken = userTokens.find(token => token.symbol === 'THEN');
    return thenToken ? parseFloat(thenToken.balance) : 0;
  };

  // 处理质押
  const handleStake = async () => {
    if (!stakingAmount || isNaN(stakingAmount) || parseFloat(stakingAmount) <= 0) {
      setStakingError('请输入有效的质押数量');
      return;
    }

    const userBalance = getUserThenBalance();
    if (parseFloat(stakingAmount) > userBalance) {
      setStakingError('余额不足');
      return;
    }

    setStakingError('');
    setStakingSuccess('');
    setIsStaking(true);

    try {
      // 这里是示例实现，实际需要与质押合约交互
      // 模拟质押过程
      setTimeout(async () => {
        setStakingSuccess(`成功质押 ${stakingAmount} THEN`);
        setStakingAmount('');
        // 更新余额
        // await fetchTokenBalances();
      }, 1500);
    } catch (error) {
      console.error('质押失败:', error);
      setStakingError('质押失败: ' + error.message);
    } finally {
      setIsStaking(false);
    }
  };

  // 处理解除质押
  const handleUnstake = async () => {
    setStakingError('');
    setStakingSuccess('');
    setIsUnstaking(true);

    try {
      // 这里是示例实现，实际需要与质押合约交互
      // 模拟解除质押过程
      setTimeout(async () => {
        setStakingSuccess('成功解除质押');
        // 更新余额
        // await fetchTokenBalances();
      }, 1500);
    } catch (error) {
      console.error('解除质押失败:', error);
      setStakingError('解除质押失败: ' + error.message);
    } finally {
      setIsUnstaking(false);
    }
  };

  // 处理领取奖励
  const handleClaimRewards = async (poolId) => {
    setStakingError('');
    setStakingSuccess('');

    try {
      // 这里是示例实现，实际需要与质押合约交互
      // 模拟领取奖励过程
      setTimeout(async () => {
        setStakingSuccess('成功领取奖励');
        // 更新余额
        // await fetchTokenBalances();
      }, 1500);
    } catch (error) {
      console.error('领取奖励失败:', error);
      setStakingError('领取奖励失败: ' + error.message);
    }
  };

  return (
    <div className="staking-container">
      <div className="feature-card">
        <h2 className="section-title">质押中心</h2>
        
        {stakingError && (
          <div className="error-message">
            {stakingError}
          </div>
        )}
        {stakingSuccess && (
          <div className="success-message">
            {stakingSuccess}
          </div>
        )}

        <div className="staking-info">
          <p>THEN 代币余额: <strong>{getUserThenBalance().toFixed(6)} THEN</strong></p>
          <p>THEN 代币价值: <strong>${(getUserThenBalance() * (tokenPrices.THEN || 0.5)).toFixed(2)}</strong></p>
        </div>

        <div className="staking-form">
          <h3>质押 THEN 代币</h3>
          <div className="staking-input-group">
            <input
              type="number"
              value={stakingAmount}
              onChange={(e) => setStakingAmount(e.target.value)}
              placeholder="输入质押数量"
              step="0.000001"
              disabled={isStaking || isUnstaking}
            />
          </div>
          <div className="staking-buttons">
            <button 
              className="primary-button"
              onClick={handleStake}
              disabled={isStaking || isUnstaking || !stakingAmount || parseFloat(stakingAmount) <= 0}
            >
              {isStaking ? '质押中...' : '质押'}
            </button>
            <button 
              className="disconnect-button"
              onClick={handleUnstake}
              disabled={isStaking || isUnstaking || getUserThenBalance() <= 0}
            >
              {isUnstaking ? '解除中...' : '解除质押'}
            </button>
          </div>
        </div>
      </div>

      <div className="feature-card">
        <h2 className="section-title">质押池</h2>
        <div className="staking-pools">
          {stakingPools.map((pool) => (
            <div key={pool.id} className="feature-card">
              <div className="pool-header">
                <h3>{pool.name}</h3>
                <div className="pool-apr">
                  <strong>APR: {pool.apr}%</strong>
                </div>
              </div>
              <div className="pool-details">
                <p>总质押: {pool.totalStaked} {pool.tokenA}</p>
                <p>我的质押: {pool.myStake} {pool.tokenA}</p>
                <p>待领取奖励: {pool.rewards} {pool.tokenA}</p>
              </div>
              <div className="pool-actions">
                <button 
                  className="connect-button"
                  onClick={() => setSelectedPool(pool.id)}
                >
                  选择池
                </button>
                {pool.rewards > 0 && (
                  <button 
                    className="primary-button"
                    onClick={() => handleClaimRewards(pool.id)}
                  >
                    领取奖励
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Staking;