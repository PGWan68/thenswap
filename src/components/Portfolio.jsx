import React from 'react';

function Portfolio({ userTokens, tokenPrices, walletAddress }) {
  // 计算用户总资产
  const calculateTotalAssets = () => {
    return userTokens.reduce((total, token) => {
      const tokenPrice = parseFloat(tokenPrices[token.symbol] || token.price);
      const tokenValue = parseFloat(token.balance) * tokenPrice;
      return total + tokenValue;
    }, 0);
  };

  // 示例热门钱包数据
  const topWallets = [
    {
      address: '0x1234567890123456789012345678901234567890',
      name: '鲸鱼钱包 #1',
      totalValue: 500000,
      tokens: ['ETH', 'USDT', 'THEN'],
      rank: 1
    },
    {
      address: '0x0987654321098765432109876543210987654321',
      name: '鲸鱼钱包 #2',
      totalValue: 350000,
      tokens: ['ETH', 'THEN', 'DAI'],
      rank: 2
    },
    {
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      name: '鲸鱼钱包 #3',
      totalValue: 280000,
      tokens: ['THEN', 'USDT', 'DAI'],
      rank: 3
    },
    {
      address: '0xfedcba0987654321fedcba0987654321fedcba09',
      name: '鲸鱼钱包 #4',
      totalValue: 220000,
      tokens: ['ETH', 'THEN'],
      rank: 4
    },
    {
      address: '0x1122334455667788990011223344556677889900',
      name: '鲸鱼钱包 #5',
      totalValue: 180000,
      tokens: ['THEN', 'USDT'],
      rank: 5
    }
  ];

  // 计算用户在各功能模块的参与情况
  const userActivity = {
    swapCount: 12,
    liquidityPools: 2,
    nftsOwned: 4,
    stakingPools: 2,
    totalRewards: 37.8
  };

  return (
    <div className="portfolio-container">
      <div className="feature-card">
        <h2 className="section-title">我的投资组合</h2>
        
        <div className="portfolio-overview">
          <div className="portfolio-summary">
            <div className="total-assets">
              <h3>总资产价值</h3>
              <p className="total-value">${calculateTotalAssets().toFixed(2)}</p>
            </div>
            <div className="wallet-address">
              <h3>钱包地址</h3>
              <p className="address">{walletAddress}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="feature-card">
        <h2 className="section-title">我的资产</h2>
        <div className="assets-list">
          {userTokens.map((token, index) => (
            <div key={index} className="token-item">
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
              <div className="token-percentage">
                {((parseFloat(token.balance) * parseFloat(tokenPrices[token.symbol] || token.price) / calculateTotalAssets()) * 100).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="feature-card">
        <h2 className="section-title">我的活动</h2>
        <div className="activity-grid">
          <div className="activity-item">
            <h4>兑换次数</h4>
            <p className="activity-value">{userActivity.swapCount}</p>
          </div>
          <div className="activity-item">
            <h4>流动性池</h4>
            <p className="activity-value">{userActivity.liquidityPools}</p>
          </div>
          <div className="activity-item">
            <h4>拥有NFT</h4>
            <p className="activity-value">{userActivity.nftsOwned}</p>
          </div>
          <div className="activity-item">
            <h4>质押池</h4>
            <p className="activity-value">{userActivity.stakingPools}</p>
          </div>
          <div className="activity-item">
            <h4>总奖励</h4>
            <p className="activity-value">{userActivity.totalRewards} THEN</p>
          </div>
        </div>
      </div>

      <div className="feature-card">
        <h2 className="section-title">热门钱包</h2>
        <div className="wallets-list">
          {topWallets.map((wallet) => (
            <div key={wallet.rank} className="wallet-item">
              <div className="wallet-info">
                <div className="wallet-rank">#{wallet.rank}</div>
                <div className="wallet-details">
                  <h4>{wallet.name}</h4>
                  <p className="wallet-address">{wallet.address}</p>
                  <div className="wallet-tokens">
                    {wallet.tokens.map((token, index) => (
                      <span key={index} className="wallet-token-tag">{token}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="wallet-value">
                ${wallet.totalValue.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Portfolio;