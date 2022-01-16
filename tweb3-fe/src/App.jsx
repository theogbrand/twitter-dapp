import React, { useEffect, useState } from "react";
import {ethers} from "ethers";
import abi from "./utils/WavePortal.json";
import './App.css';

export default function App() {
  const [ currentAccount, setCurrentAccount] = useState("");
  const [ allWaves, setAllWaves] = useState([]);

  // most updated address of contract on blockchain
  const contractAddress = "0xaD7F75Bd7236103d213d9d9644eE2B2e0F41FE62";
  // application binary interface - how frontend understands smart contract 
  const contractABI = abi.abi

  const checkIfWalletIsConnected = async () => {
    // window.ethereum object accessible if wallet connected
    try {
      const {ethereum} = window;

      if (!ethereum) {
        console.log("make sure metamask is connected");
      } else {
        console.log("Window.ethereum object accessible, metamask connected!", ethereum);
      }

      // check if auth-ed to access login-ed user's wallet
      const accounts = await ethereum.request({method: "eth_accounts"});

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("Found first authorised account: ", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorised account Found")
      }
    } catch(error) {
      console.log(error)
    }
   
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        alert("get metamask or sign in to metamask")
        return
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts"});

      console.log("connected to first account with address", accounts[0]);
      setCurrentAccount(accounts[0]);
      alert("Metamask wallet connected!")

    } catch(error){
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const {ethereum} = window

      if(ethereum) {
        // provides abstraction of a connection to Ethereum network - talking to Eth Nodes
        const provider = new ethers.providers.Web3Provider(ethereum)
        // abstraction of an eth account interacting with contract - the signer's account
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // read current total waves - getTotalWaves is func defined in smart contract
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieving current total wave count...", count.toNumber());

        // actually wave and increase total waves - wave is func defined in smart contract 
        const waveTxn = await wavePortalContract.wave("Waving from frontend");
        console.log("Mining... Etherscan this hash while waiting: https://rinkeby.etherscan.io/address/", waveTxn.hash)

        await waveTxn.wait();
        console.log("mined --", waveTxn.hash);
        alert("Wave completed!")

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Eth object does not exist!");
      }
    } catch(error) {
      console.log(error)
    }
  }
  
  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesProcessed = [];
        waves.forEach(w => {
          wavesProcessed.push({
            address: w.waver,
            timestamp: new Date(w.timestamp * 1000),
            message: w.message,
          });
        });
        setAllWaves(wavesProcessed);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    let wavePortalContract;

    // function called when event listener is activated 
    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave event from wave() function in smart contract emitted!", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from, 
          timestamp: new Date(timestamp * 1000),
          message: message,
        }
      ])
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    // event listener for when contract throws the NewWave event
    wavePortalContract.on("NewWave", onNewWave)
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave)
      }
    }

    checkIfWalletIsConnected();
  }, []) 

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hello
        </div>

        <div className="bio">
        I am broccoli brandon and I <b><u>ALWAYS</u></b> eat my greens. Connect your Ethereum wallet to wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {
          !currentAccount && (
            <button className="waveButton" onClick={connectWallet}>Connect Metamask wallet</button>
          )
        }

        {
          allWaves.map((wave, index) => {
            return (
              <div key={index} style={ {backgroundColor: "OldLace", marginTop: "16px", padding: "8px"} }>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>
            )
          })
        }
      </div>
    </div>
  );
}
