import React from 'react';
import { availableTokens } from '../App';

function Home({ userTokens, tokenPrices, walletConnected }) {
  // 计算用户总资产
  const calculateTotalAssets = () => {
    if (!userTokens || userTokens.length === 0) return 0;
    return userTokens.reduce((total, token) => {
      const tokenPrice = parseFloat(tokenPrices[token.symbol] || token.price);
      const tokenValue = parseFloat(token.balance) * tokenPrice;
      return total + tokenValue;
    }, 0);
  };

  // 获取热门代币
  const getPopularTokens = () => {
    return availableTokens.slice(0, 4);
  };

  return (
    <div className="home-container">
      <div className="feature-card">
        <div className="hero-section">
          <h2>欢迎来到 ThenSwap</h2>
          <p>去中心化金融平台，提供代币兑换、流动性挖矿、NFT市场和质押服务</p>
          {!walletConnected && (
            <div className="hero-cta">
              <p>连接您的钱包，开始探索 DeFi 世界</p>
            </div>
          )}
        </div>
      </div>

      {walletConnected && (
        <div className="feature-card">
          <div className="portfolio-overview">
            <h3>我的资产概览</h3>
            <div className="total-assets">
              <p className="total-value">${calculateTotalAssets().toFixed(2)}</p>
              <p className="asset-desc">总资产价值</p>
            </div>
          </div>
        </div>
      )}

      <div className="feature-card">
        <h3>热门代币</h3>
        <div className="tokens-grid">
          {getPopularTokens().map((token) => (
            <div key={token.symbol} className="token-card">
              <div className="token-info">
                <span className="token-symbol">{token.symbol}</span>
                <span className="token-name">{token.name}</span>
              </div>
              <div className="token-price">
                ${parseFloat(tokenPrices[token.symbol] || token.price).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <h3>代币兑换</h3>
          <p>轻松兑换各种加密货币，享受低手续费和快速交易</p>
        </div>
        <div className="feature-card">
          <h3>流动性池</h3>
          <p>提供流动性，获得交易手续费和额外奖励</p>
        </div>
        <div className="feature-card">
          <h3>NFT市场</h3>
          <p>购买、出售和创建独特的数字艺术品</p>
        </div>
        <div className="feature-card">
          <h3>质押服务</h3>
          <p>质押您的代币，获得稳定的年化收益</p>
        </div>
      </div>
    </div>
  );
}

export default Home;