const Web3 = require('web3');

// Initialize web3 instance (either local node or Infura/Alchemy)
const web3 = new Web3(); // no provider needed for signing messages

// Private key of the Ethereum account
const privateKey = '0x27d33a497f8d180b24ff7da1aea0a5f083d1d2c11eff39251a84f5b2960d39d6';  // replace with your private key

// Message you want to sign
const message = '';

// Sign the message
const signedMessage = web3.eth.accounts.sign(message, privateKey);

console.log('Signed Message:', signedMessage);