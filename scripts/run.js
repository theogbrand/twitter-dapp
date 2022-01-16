// used for TESTING smart contract when new functionality is added 

const main = async () => {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  // hre is hardhat runtime enviro
  const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
  // fresh local blockchain deployed each time
  const waveContract = await waveContractFactory.deploy({
    // deploy contract with ether funded
    value: hre.ethers.utils.parseEther("0.1"),
  });
  await waveContract.deployed();
  // use address in local blockchain to find deployed contract
  console.log('Contract deployed to: ', waveContract.address);
  console.log('Contracted deployted by: ', owner.address);

  let contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address
  );
  console.log("contract balance is currently: ", hre.ethers.utils.formatEther(contractBalance));

  let waveCount;
  waveCount = await waveContract.getTotalWaves();

  // temporarily manual text input used cos "tweet" func not impl in frontend 
  let waveTxn = await waveContract.wave("This is Wave #1 from run.js");
  await waveTxn.wait();

  let waveTxn2 = await waveContract.wave("This is Wave #2 from same address from run.js");
  await waveTxn2.wait();

  waveTxn = await waveContract.connect(randomPerson).wave("This is Wave #3 by Random Person from run.js")
  await waveTxn.wait();

  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves);

  waveCount = await waveContract.getTotalWaves();
  contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
