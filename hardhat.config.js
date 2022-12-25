require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const NETWORK = process.env.NETWORK || 'hardhat';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const INFURA_KEY = process.env.INFURA_KEY || '';


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks : {
    goerli : {
      url : `https://goerli.infura.io/v3/${INFURA_KEY}`,
      accounts : [`0x${PRIVATE_KEY}`],
    }
  }
};
