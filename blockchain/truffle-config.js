module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gas: 30000000,
      from: '0x092c7B811a5C808b7a6Ae2FA5f885FCa01123A49',
    },
  },
  contracts_directory: './testing/',
  contracts_build_directory: './src/build/',
  compilers: {
    solc: {
      version: "0.6.6",
      settings: {
        optimizer: {
          enabled: true,
          runs: 100
        }
      }
    }
  }
}