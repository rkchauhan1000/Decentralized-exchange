
require('babel-register');
require('babel-polyfill');
require('dotenv').config();
const HDWalletProvider = require("truffle-hdwallet-provider-privkey");
const privateKeys = [" 2e197ee1aa0d2c9fee451cfb070c2f5ff4973583abb977b245123b7f38ab084c" , "c1f131b5599831fb24a54834f83147a6f1df34047c798b460e4a2a85751085e0"];

module.exports = {
  

  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },

   /*kovan: {
      provider: function() {
        return new HDWalletProvider(
          privateKeys,
          'https:/kovan.infura.io/v3/4bfb2fc3afef45f6918419f3bc681e9a'
          )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id:42
    }*/
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',

  compilers: {
    solc: {
      optimizer:{
        enabled: true,
        runs: 200
      }
     
    }
  }
}
