import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import Image from 'next/image'
import axios from 'axios';
import Token from "../artifacts/contracts/Token.sol/MyToken.json"
import Receiver from "../artifacts/contracts/Receiver.sol/Receiver.json";
import Forwarder from "../artifacts/contracts/Forwarder.sol/MyForwarder.json";
import { receiverAddress, forwarderAddress, tokenAddress, autoTaskApi } from '../configuration';
import Web3Modal from 'web3modal'



const MetaTransaction = () => {
  const [receiver, setReceiver] = useState();
  const [token, setToken] = useState();
  const [account, setAccount] = useState();
  const [Amount, setAmount] = useState();
  const [connected, setconnected] = useState(false);
  const [sent, setsent] = useState(false);

  const [nonce, setnonce] = useState();
  const [recipient, setRecipient] = useState();
  const [request, setrequest] = useState();
  const [signature, setsignature] = useState();



  async function ConnectToWeb3() {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const receiver = new ethers.Contract(
      receiverAddress,
      Receiver.abi,
      signer
    );
    const forwarder = new ethers.Contract(
      forwarderAddress,
      Forwarder.abi,
      signer
    );
    const accounts = await provider.listAccounts();
    setAccount(accounts[0]);
    const newNonce = await forwarder.getNonce(accounts[0].toString()).then(nonce => nonce.toString());
    const token = new ethers.Contract(
      tokenAddress,
      Token.abi,
      signer
    );
    setnonce(newNonce);
    setToken(token)
    setReceiver(receiver);
    setconnected(true);
  }



  async function sendToDefender() {
    console.log("sendtoDefender")

    const body = { request: request, signature: signature };
    const meta = await axios.post(autoTaskApi, body)
    setsent(true);
    if (window.confirm('click "ok" to see your tansaction on etherscan')) {
      window.open(
        'https://rinkeby.etherscan.io/address/0x973dd251a3a0f89fa283b8f78593f84e8090222b',
        '_blank' // <- This is what makes it open in a new window.
      );
    };



  }


  const signer = () => {
    console.log("sign")
    const EncodedData = receiver.interface.encodeFunctionData('TransferFrom', [account, recipient, Amount]);



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
      verifyingContract: forwarderAddress,
    };
    const message = {
      from: account, to: receiverAddress, value: 0, gas: 1000000, nonce: nonce, data: EncodedData
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
    console.log("before worning")
    web3.currentProvider.sendAsync(
      {
        method: "eth_signTypedData_v4",
        params: [account, data],
        from: account
      },
      function (err, result) {
        if (err) {
          return console.error(err);
        }
        if (result.error) {
          return console.error(result.error.message)
        }
        setsignature(result.result)

      });
  }

  async function approve() {
    console.log("approve")

    await token.approve(receiverAddress, token.balanceOf(account));

  }

  return (
    <div className=" bg-repeat bg-[url('/header.png')] ">
      <div className="h-full">
        {/* <!--Nav--> */}
        <div className="w-full container mx-auto">
          <div className="w-full flex items-center justify-between">
            <a className="flex items-center text-blue-600 no-underline hover:no-underline font-bold text-2xl lg:text-4xl" href="">
              KPMG
              <span
                className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-pink-500 to-purple-500">
                META-TX
              </span>
            </a>
            <div className="flex w-1/2 justify-end content-center">
              <a className="inline-block text-blue-300 no-underline hover:text-pink-500 hover:text-underline text-center h-10 p-2 md:h-auto md:p-4 transform hover:scale-125 duration-300 ease-in-out"
                href="https://twitter.com/">
                <svg className="fill-current h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                  <path
                    d="M30.063 7.313c-.813 1.125-1.75 2.125-2.875 2.938v.75c0 1.563-.188 3.125-.688 4.625a15.088 15.088 0 0 1-2.063 4.438c-.875 1.438-2 2.688-3.25 3.813a15.015 15.015 0 0 1-4.625 2.563c-1.813.688-3.75 1-5.75 1-3.25 0-6.188-.875-8.875-2.625.438.063.875.125 1.375.125 2.688 0 5.063-.875 7.188-2.5-1.25 0-2.375-.375-3.375-1.125s-1.688-1.688-2.063-2.875c.438.063.813.125 1.125.125.5 0 1-.063 1.5-.25-1.313-.25-2.438-.938-3.313-1.938a5.673 5.673 0 0 1-1.313-3.688v-.063c.813.438 1.688.688 2.625.688a5.228 5.228 0 0 1-1.875-2c-.5-.875-.688-1.813-.688-2.75 0-1.063.25-2.063.75-2.938 1.438 1.75 3.188 3.188 5.25 4.25s4.313 1.688 6.688 1.813a5.579 5.579 0 0 1 1.5-5.438c1.125-1.125 2.5-1.688 4.125-1.688s3.063.625 4.188 1.813a11.48 11.48 0 0 0 3.688-1.375c-.438 1.375-1.313 2.438-2.563 3.188 1.125-.125 2.188-.438 3.313-.875z">
                  </path>
                </svg>
              </a>
              <a className="inline-block text-blue-300 no-underline hover:text-pink-500 hover:text-underline text-center h-10 p-2 md:h-auto md:p-4 transform hover:scale-125 duration-300 ease-in-out"
                href="https://www.facebook.com/">
                <svg className="fill-current h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                  <path d="M19 6h5V0h-5c-3.86 0-7 3.14-7 7v3H8v6h4v16h6V16h5l1-6h-6V7c0-.542.458-1 1-1z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* <!--Main--> */}
        <div className="container pt-24 md:pt-36 mx-auto flex flex-wrap flex-col md:flex-row items-center">
          {/* <!--Left Col--> */}
          <div className="flex flex-col w-full xl:w-2/5 justify-center lg:items-start overflow-y-hidden">
            <h1 className="my-4 text-3xl md:text-5xl text-white opacity-75 font-bold leading-tight text-center md:text-left">
              Send  Your Tokens &nbsp;


              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-pink-500 to-purple-500">
                With Zero Fees
              </span>
            </h1>
            <p className=" text-green-200 leading-normal text-base md:text-2xl mb-8 text-center md:text-left">
              we take charge of  paying your transaction
            </p>

            <div className="bg-gray-900 opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <label className="block text-blue-300 py-2 font-bold mb-2" htmlFor="emailaddress">
                  Amount To Send
                </label>
                <input className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                  onChange={e => setAmount(e.target.value)}
                  inputMode="decimal"
                  title="Token Amount"
                  type="text"
                  placeholder={'Amount To Send'}
                  minLength={1}
                  maxLength={60}
                />
                <label className="block text-blue-300 py-2 font-bold mb-2" htmlFor="test">
                  Destination Address
                </label>
                <input className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                  onChange={e => setRecipient(e.target.value)}
                  inputMode="string"
                  title="recipient address"
                  type="text"
                  placeholder={'Destination Address'}
                  minLength={1}
                  maxLength={60}
                />

              </div>

              <div className="flex items-center justify-between pt-4">
                {!connected ?
                  <button className="bg-gradient-to-r from-purple-800 to-green-500 hover:from-pink-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                    onClick={ConnectToWeb3}> ConnectToWeb3 </button > :
                  <div className="bg-green-700 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                  > connected </div >}
                <button className="bg-gradient-to-r from-purple-800 to-green-500 hover:from-pink-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                  onClick={approve}> Approve </button >
                <button className="bg-gradient-to-r from-purple-800 to-green-500 hover:from-pink-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                  onClick={signer}> Sign </button >
                {!sent ? <button className="bg-gradient-to-r from-purple-800 to-green-500 hover:from-pink-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                  onClick={sendToDefender}> Send Transaction </button > : <div className="bg-red-600 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                  > Transaction Sent </div >}


              </div>
            </div>
          </div>
          {/* <!--Right Col--> */}
          <div className="w-full xl:w-3/5 p-12 overflow-hidden">
            <img
              className="mx-auto w-full md:w-4/5 transform -rotate-1 transition hover:scale-105 duration-700 ease-in-out hover:rotate-6"
              src="macbook.svg" />
          </div>

          <div className="mx-auto md:pt-16">
            <p className="text-blue-400 font-bold pb-8 lg:pb-6 text-center">
              Download our app:
            </p>
            <div className="flex w-full justify-center md:justify-start pb-24 lg:pb-0 fade-in">
              <img src="App Store.svg" className="h-12 pr-12 transform hover:scale-125 duration-300 ease-in-out" />
              <img src="Play Store.svg" className="h-12 transform hover:scale-125 duration-300 ease-in-out" />
            </div>
          </div>
          {/* <!--Footer--> */}
          <div className="w-full pt-40 pb-6 text-sm text-center md:text-left fade-in">
            <a className="text-gray-500 no-underline hover:no-underline" href="#">&copy; App 2020</a>
            - Made by
            <a className="text-blue-500 no-underline hover:no-underline"
              href="">&nbsp; KPMG Blockchain technical team</a>
          </div>
        </div>

      </div>

    </div >
  )
}

export default MetaTransaction;

