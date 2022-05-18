import { useEffect, useState } from 'react'
import Web3 from 'web3'
import { ethers } from "ethers";
import axios from 'axios';
import sigUtil from "eth-sig-util";
import AutoTaskAPI from "./../configuration.js";
import Token from "../artifacts/contracts/Token.sol/Token"
import Forwarder from "../artifacts/contracts/Forwarder.sol/MyForwarder.json"



const MetaTransaction = () => {
  const [web3, setweb3] = useState();
  const [account, setaccount] = useState();
  const [Amount, setAmount] = useState();
  const [payload, setpayload] = useState();
  const [request, setrequest] = useState();
  const [signature, setsignature] = useState();
  const [nonce, setnonce] = useState();


  useEffect(() => {

    async function ConnectToWeb3() {
      const Instance = new Web3(Web3.givenProvider);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      setweb3(Instance);
      const accounts = await Instance.eth.requestAccounts();
      setaccount(accounts[0])
      const Tokenaddress = "0x95335b5b7357e52b4792B9Dd793BDfcc9cf1D616";
      const token = new ethers.Contract(
        Tokenaddress,
        Token.abi,
        signer
      );
      const encodeddata = token.interface.encodeFunctionData('TransferFrom', [accounts[0], "0x6A705836a314531b07247B6b8c7fC51b54211089", 10000]);
      setpayload(encodeddata)
      const forwarder = new ethers.Contract(
        "0x5EaaAEd25FC2bb84FdcC37463973496F558C796f",
        Forwarder.abi,
        signer
      );
      console.log(accounts[0])
      const newNonce = await forwarder.getNonce(accounts[0].toString()).then(nonce => nonce.toString());
      setnonce(newNonce)
    }
    ConnectToWeb3()
  }, []);


  async function sendToDefender() {
    const body = { request: request, signature: signature };
    const api = "https://api.defender.openzeppelin.com/autotasks/4b0e4e01-9a85-4916-b85f-06e53d46b887/runs/webhook/4adbc6b9-1cc3-4b91-b2a1-ff30b9762800/P4sx51rNwB6PC8Xekqa1zS";
    const meta = await axios.post(api, body)

  }


  const signer2 = () => {



    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ];

    const ForwardRequest = [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'gas', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ];

    const domainData = {
      name: "MinimalForwarder",
      version: "0.0.1",
      chainId: 4,
      verifyingContract: "0x5EaaAEd25FC2bb84FdcC37463973496F558C796f",
    };
    const message = {
      from: account, to: '0x95335b5b7357e52b4792B9Dd793BDfcc9cf1D616', value: 0, gas: 1000000, nonce: nonce, data: payload
    }
    setrequest(message)

    const data = JSON.stringify({
      types: {
        EIP712Domain,
        ForwardRequest,
      },
      domain: domainData,
      primaryType: 'ForwardRequest',
      message: message
    });

    web3.currentProvider.sendAsync(
      {
        method: "eth_signTypedData_v4",
        params: [account, data],
        from: account
      },
      function (err, result) {
        setsignature(result.result)
        if (err) {
          return console.error(err);
        }
        if (result.error) {
          return console.error(result.error.message)
        }
      });
  }










  return (
    <div >
      <input
        onChange={e => setAmount(e.target.value)}
        inputMode="decimal"
        title="Token Amount"
        type="text"
        placeholder={'Amount' || '0.0'}
        minLength={1}
        maxLength={60}
      />
      <button onClick={signer2}> signer2 </button >

      <button onClick={sendToDefender}> sendToDefender </button >



    </div>
  )
}

export default MetaTransaction;

