// SPDX-License-Identifier: MIT
// 系统集成测试脚本

async function main() {
  // 获取Hardhat Runtime Environment
  const hre = require('hardhat');
  
  console.log('开始系统集成测试...');
  
  try {
    // 1. 连接到Hardhat网络
    const signers = await hre.ethers.getSigners();
    const owner = signers[0];
    const user = signers[1];
    
    console.log('✓ 连接到Hardhat网络成功');
    console.log('✓ 账户:', owner.address);
    
    // 2. 加载合约ABI和地址
    const TestToken = await hre.ethers.getContractFactory('TestToken');
    const SimpleDEX = await hre.ethers.getContractFactory('SimpleDEX');
    
    // 3. 获取已部署的合约
    const ethToken = await TestToken.attach('0x5FbDB2315678afecb367f032d93F642f64180aa3');
    const usdtToken = await TestToken.attach('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
    const daiToken = await TestToken.attach('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0');
    const dexContract = await SimpleDEX.attach('0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9');
    
    console.log('✓ 加载合约成功');
    
    // 4. 检查代币余额
    const ownerEthBalance = await ethToken.balanceOf(owner.address);
    const ownerUsdtBalance = await usdtToken.balanceOf(owner.address);
    const ownerDaiBalance = await daiToken.balanceOf(owner.address);
    
    console.log('✓ 代币余额检查:');
    console.log(`  - ETH: ${hre.ethers.utils.formatUnits(ownerEthBalance, 18)}`);
    console.log(`  - USDT: ${hre.ethers.utils.formatUnits(ownerUsdtBalance, 18)}`);
    console.log(`  - DAI: ${hre.ethers.utils.formatUnits(ownerDaiBalance, 18)}`);
    
    // 5. 测试代币转账
    const transferAmount = hre.ethers.utils.parseUnits('100', 18);
    
    // 从owner转账给user
    await ethToken.transfer(user.address, transferAmount);
    await usdtToken.transfer(user.address, transferAmount);
    
    const userEthBalance = await ethToken.balanceOf(user.address);
    const userUsdtBalance = await usdtToken.balanceOf(user.address);
    
    console.log('✓ 代币转账测试:');
    console.log(`  - 用户ETH余额: ${hre.ethers.utils.formatUnits(userEthBalance, 18)}`);
    console.log(`  - 用户USDT余额: ${hre.ethers.utils.formatUnits(userUsdtBalance, 18)}`);
    
    // 6. 测试DEX功能
    // 用户批准DEX使用代币
    const userEthContract = ethToken.connect(user);
    const userUsdtContract = usdtToken.connect(user);
    const userDexContract = dexContract.connect(user);
    
    await userEthContract.approve(dexContract.address, transferAmount);
    await userUsdtContract.approve(dexContract.address, transferAmount);
    
    // 测试代币兑换
    const swapAmount = hre.ethers.utils.parseUnits('10', 18);
    const initialUserUsdtBalance = await userUsdtBalance;
    
    console.log('\n测试代币兑换功能...');
    const swapTx = await userDexContract.swap(ethToken.address, usdtToken.address, swapAmount);
    await swapTx.wait();
    
    const finalUserEthBalance = await userEthContract.balanceOf(user.address);
    const finalUserUsdtBalance = await userUsdtContract.balanceOf(user.address);
    
    const ethSpent = hre.ethers.utils.formatUnits(swapAmount, 18);
    const usdtReceived = hre.ethers.utils.formatUnits(finalUserUsdtBalance.sub(initialUserUsdtBalance), 18);
    
    console.log('✓ 代币兑换成功:');
    console.log(`  - 消耗ETH: ${ethSpent}`);
    console.log(`  - 获得USDT: ${usdtReceived}`);
    console.log(`  - 最终ETH余额: ${hre.ethers.utils.formatUnits(finalUserEthBalance, 18)}`);
    console.log(`  - 最终USDT余额: ${hre.ethers.utils.formatUnits(finalUserUsdtBalance, 18)}`);
    
    // 7. 获取当前价格
    const price = await dexContract.getPrice(ethToken.address, usdtToken.address);
    console.log(`\n✓ 当前ETH-USDT价格: ${hre.ethers.utils.formatUnits(price, 18)} USDT/ETH`);
    
    console.log('\n🎉 所有测试通过！系统集成测试完成。');
    
  } catch (error) {
    console.error('✗ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行主函数
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
