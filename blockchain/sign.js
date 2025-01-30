const Web3 = require('web3');

// Initialize web3 instance (either local node or Infura/Alchemy)
const web3 = new Web3(); // no provider needed for signing messages

// Private key of the Ethereum account
const privateKey = '0xc04dfc6a05f3c607f7353a0e36697aa73911520c54d4972adf1c1da5c9cf4f68';  // replace with your private key

// Message you want to sign
const message = '0x7EdAFfa3b2cAf0fc1BBAdC51d451503a8D7cBE70';

// Sign the message
const signedMessage = web3.eth.accounts.sign(message, privateKey);

console.log('Signed Message:', signedMessage);