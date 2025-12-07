// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract SimpleDEX {
  using SafeERC20 for IERC20;

  // 流动性池信息
  struct Pool {
    IERC20 tokenA;
    IERC20 tokenB;
    uint256 reserveA;
    uint256 reserveB;
    uint256 totalSupply;
    mapping(address => uint256) liquidity;
  }

  mapping(bytes32 => Pool) public pools;
  mapping(IERC20 => mapping(IERC20 => bytes32)) public poolIds;

  // 创建流动性池
  function createPool(IERC20 tokenA, IERC20 tokenB) external {
    require(tokenA != tokenB, 'Tokens must be different');
    require(address(tokenA) != address(0) && address(tokenB) != address(0), 'Invalid token address');

    bytes32 poolId = keccak256(abi.encodePacked(tokenA, tokenB));
    require(pools[poolId].tokenA == IERC20(address(0)), 'Pool already exists');

    // 逐个字段赋值，避免直接构造包含映射的结构体
    pools[poolId].tokenA = tokenA;
    pools[poolId].tokenB = tokenB;
    pools[poolId].reserveA = 0;
    pools[poolId].reserveB = 0;
    pools[poolId].totalSupply = 0;

    poolIds[tokenA][tokenB] = poolId;
    poolIds[tokenB][tokenA] = poolId;
  }

  // 添加流动性
  function addLiquidity(
    IERC20 tokenA,
    IERC20 tokenB,
    uint256 amountA,
    uint256 amountB
  ) external returns (uint256 liquidity) {
    bytes32 poolId = poolIds[tokenA][tokenB];
    require(pools[poolId].tokenA != IERC20(address(0)), 'Pool does not exist');

    Pool storage pool = pools[poolId];

    // 确保tokens顺序正确
    if (tokenA != pool.tokenA) {
      (tokenA, tokenB) = (tokenB, tokenA);
      (amountA, amountB) = (amountB, amountA);
    }

    // 转账代币到合约
    tokenA.safeTransferFrom(msg.sender, address(this), amountA);
    tokenB.safeTransferFrom(msg.sender, address(this), amountB);

    // 更新储备
    pool.reserveA += amountA;
    pool.reserveB += amountB;

    // 计算流动性份额
    if (pool.totalSupply == 0) {
      liquidity = sqrt(amountA * amountB);
    } else {
      liquidity = min((amountA * pool.totalSupply) / pool.reserveA, (amountB * pool.totalSupply) / pool.reserveB);
    }

    require(liquidity > 0, 'Insufficient liquidity provided');

    // 更新流动性
    pool.totalSupply += liquidity;
    pool.liquidity[msg.sender] += liquidity;
  }

  // 移除流动性
  function removeLiquidity(
    IERC20 tokenA,
    IERC20 tokenB,
    uint256 liquidity
  ) external returns (uint256 amountA, uint256 amountB) {
    bytes32 poolId = poolIds[tokenA][tokenB];
    require(pools[poolId].tokenA != IERC20(address(0)), 'Pool does not exist');

    Pool storage pool = pools[poolId];
    require(pool.liquidity[msg.sender] >= liquidity, 'Insufficient liquidity');

    // 计算应该返回的代币数量
    amountA = (liquidity * pool.reserveA) / pool.totalSupply;
    amountB = (liquidity * pool.reserveB) / pool.totalSupply;

    require(amountA > 0 && amountB > 0, 'Insufficient liquidity');

    // 更新流动性
    pool.totalSupply -= liquidity;
    pool.liquidity[msg.sender] -= liquidity;

    // 更新储备
    pool.reserveA -= amountA;
    pool.reserveB -= amountB;

    // 转账代币给用户
    pool.tokenA.safeTransfer(msg.sender, amountA);
    pool.tokenB.safeTransfer(msg.sender, amountB);
  }

  // 交换代币
  function swap(
    IERC20 inputToken,
    IERC20 outputToken,
    uint256 inputAmount
  ) external returns (uint256 outputAmount) {
    bytes32 poolId = poolIds[inputToken][outputToken];
    require(pools[poolId].tokenA != IERC20(address(0)), 'Pool does not exist');

    Pool storage pool = pools[poolId];
    require(inputToken == pool.tokenA || inputToken == pool.tokenB, 'Invalid input token');
    require(outputToken == pool.tokenA || outputToken == pool.tokenB, 'Invalid output token');
    require(inputToken != outputToken, 'Input and output tokens must be different');

    // 确保输入输出顺序正确
    bool isTokenAInput = inputToken == pool.tokenA;
    (uint256 reserveIn, uint256 reserveOut) = isTokenAInput ? (pool.reserveA, pool.reserveB) : (pool.reserveB, pool.reserveA);

    // 转账输入代币到合约
    inputToken.safeTransferFrom(msg.sender, address(this), inputAmount);

    // 计算输出数量 (包含0.3%的手续费)
    uint256 inputAmountWithFee = inputAmount * 997;
    outputAmount = (inputAmountWithFee * reserveOut) / (reserveIn * 1000 + inputAmountWithFee);

    require(outputAmount > 0, 'Insufficient output amount');

    // 更新储备
    if (isTokenAInput) {
      pool.reserveA += inputAmount;
      pool.reserveB -= outputAmount;
    } else {
      pool.reserveB += inputAmount;
      pool.reserveA -= outputAmount;
    }

    // 转账输出代币给用户
    outputToken.safeTransfer(msg.sender, outputAmount);
  }

  // 获取当前价格
  function getPrice(IERC20 tokenA, IERC20 tokenB) external view returns (uint256 price) {
    bytes32 poolId = poolIds[tokenA][tokenB];
    require(pools[poolId].tokenA != IERC20(address(0)), 'Pool does not exist');

    Pool storage pool = pools[poolId];
    require(pool.reserveA > 0 && pool.reserveB > 0, 'Insufficient liquidity');

    if (tokenA == pool.tokenA) {
      price = (pool.reserveB * 10 ** 18) / pool.reserveA;
    } else {
      price = (pool.reserveA * 10 ** 18) / pool.reserveB;
    }
  }

  // 辅助函数：计算平方根
  function sqrt(uint256 y) internal pure returns (uint256 z) {
    if (y > 3) {
      z = y;
      uint256 x = y / 2 + 1;
      while (x < z) {
        z = x;
        x = (y / x + x) / 2;
      }
    } else if (y != 0) {
      z = 1;
    }
  }

  // 辅助函数：取最小值
  function min(uint256 a, uint256 b) internal pure returns (uint256) {
    return a < b ? a : b;
  }
}
