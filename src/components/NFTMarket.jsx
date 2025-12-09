import React, { useState } from 'react';

function NFTMarket({ walletAddress, provider, signer }) {
  const [isCreatingNFT, setIsCreatingNFT] = useState(false);
  const [nftError, setNFTError] = useState('');
  const [nftSuccess, setNFTSuccess] = useState('');
  const [selectedNFT, setSelectedNFT] = useState(null);

  // 示例NFT数据
  const nfts = [
    {
      id: 1,
      name: '以太坊创始人画像',
      description: '纪念以太坊的创始人Vitalik Buterin',
      image: '🟣',
      price: 0.5,
      owner: '0x123...456',
      forSale: true
    },
    {
      id: 2,
      name: '加密朋克',
      description: '经典的CryptoPunk风格NFT',
      image: '🤖',
      price: 2.5,
      owner: '0x789...012',
      forSale: true
    },
    {
      id: 3,
      name: '去中心化金融',
      description: 'DeFi生态系统的抽象艺术',
      image: '📈',
      price: 1.2,
      owner: '0x345...678',
      forSale: true
    },
    {
      id: 4,
      name: '区块链未来',
      description: '展示区块链技术的未来愿景',
      image: '🔮',
      price: 0.8,
      owner: walletAddress,
      forSale: false
    },
    {
      id: 5,
      name: '数字黄金',
      description: '比特币的数字艺术表现',
      image: '💰',
      price: 1.8,
      owner: '0x901...234',
      forSale: true
    },
    {
      id: 6,
      name: '智能合约',
      description: '智能合约代码的视觉艺术',
      image: '📝',
      price: 0.6,
      owner: walletAddress,
      forSale: true
    }
  ];

  // 获取用户的NFT
  const getUserNFTs = () => {
    return nfts.filter(nft => nft.owner === walletAddress);
  };

  // 创建NFT
  const handleCreateNFT = async () => {
    setIsCreatingNFT(true);
    setNFTError('');
    setNFTSuccess('');

    try {
      // 这里是示例实现，实际需要与NFT合约交互
      // 模拟创建NFT的过程
      setTimeout(() => {
        setNFTSuccess('NFT创建成功！');
        setIsCreatingNFT(false);
      }, 1500);
    } catch (error) {
      console.error('创建NFT失败:', error);
      setNFTError('创建NFT失败: ' + error.message);
      setIsCreatingNFT(false);
    }
  };

  // 购买NFT
  const handleBuyNFT = async (nft) => {
    setNFTError('');
    setNFTSuccess('');

    try {
      // 这里是示例实现，实际需要与NFT合约交互
      // 模拟购买NFT的过程
      setTimeout(() => {
        setNFTSuccess(`成功购买NFT: ${nft.name}`);
      }, 1500);
    } catch (error) {
      console.error('购买NFT失败:', error);
      setNFTError('购买NFT失败: ' + error.message);
    }
  };

  // 查看NFT详情
  const handleViewNFT = (nft) => {
    setSelectedNFT(nft);
  };

  return (
    <div className="nft-container">
      <div className="feature-card">
        <h2 className="section-title">NFT市场</h2>
        
        {nftError && (
          <div className="error-message">
            {nftError}
          </div>
        )}
        {nftSuccess && (
          <div className="success-message">
            {nftSuccess}
          </div>
        )}

        <div className="nft-actions">
          <button className="primary-button" onClick={handleCreateNFT} disabled={isCreatingNFT}>
            {isCreatingNFT ? '创建中...' : '创建NFT'}
          </button>
        </div>

        <div className="nft-listings">
          <h3>NFT列表</h3>
          <div className="nft-grid">
            {nfts.map((nft) => (
              <div key={nft.id} className="nft-card">
                <div className="nft-image">
                  <span style={{ fontSize: '4rem' }}>{nft.image}</span>
                </div>
                <div className="nft-info">
                  <h4>{nft.name}</h4>
                  <p className="nft-description">{nft.description}</p>
                  <div className="nft-price">
                    <strong>{nft.price} ETH</strong>
                  </div>
                  <div className="nft-owner">
                    所有者: {nft.owner.substring(0, 6)}...{nft.owner.substring(nft.owner.length - 4)}
                  </div>
                  <div className="nft-buttons">
                    <button 
                      className="connect-button"
                      onClick={() => handleViewNFT(nft)}
                    >
                      查看详情
                    </button>
                    {nft.forSale && nft.owner !== walletAddress && (
                      <button 
                        className="primary-button"
                        onClick={() => handleBuyNFT(nft)}
                      >
                        购买
                      </button>
                    )}
                    {nft.owner === walletAddress && (
                      <button className="disconnect-button">
                        {nft.forSale ? '下架' : '上架'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="feature-card">
        <h2 className="section-title">我的NFT</h2>
        <div className="nft-grid">
          {getUserNFTs().map((nft) => (
            <div key={nft.id} className="nft-card">
              <div className="nft-image">
                <span style={{ fontSize: '4rem' }}>{nft.image}</span>
              </div>
              <div className="nft-info">
                <h4>{nft.name}</h4>
                <p className="nft-description">{nft.description}</p>
                <div className="nft-status">
                  {nft.forSale ? '出售中' : '不出售'}
                </div>
                <div className="nft-buttons">
                  <button 
                    className="connect-button"
                    onClick={() => handleViewNFT(nft)}
                  >
                    查看详情
                  </button>
                  <button className="disconnect-button">
                    {nft.forSale ? '下架' : '上架'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NFTMarket;