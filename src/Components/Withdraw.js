import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "../Styles/TwitterLogin.css";
import Loading from "./loading";

const Withdraw = (data) => {
  const [Tip, setTip] = useState(null);
  const [signer, setSigner] = useState(null);
  const Username = data["data"]["Username"];
  const currentProvider = data["data"]["networkProvider"];
  const [loading, setLoading] = useState(false);
  const [TxHash, setTxHash] = useState("");
  const [Explorer, setExplorer] = useState("");
  const Key = process.env.REACT_APP_HASH;

  const networkParams = {
    "Sepolia ETH": {
      chainId: "0xaa36a7", // Chain ID for Sepolia
      chain: "11155111",
      chainName: "Sepolia Test Network",
      rpcUrls: ["https://rpc.sepolia.org"],
      nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
      blockExplorerUrls: ["https://sepolia.etherscan.io/tx/"],
      contractAddress: "0x9d356bf3f6B154Da52a3eEa5F686480de52Aa8e9",
    },
    "Amoy Matic": {
      chainId: "0x13882", // Chain ID for Mumbai (Polygon Testnet)
      chain: "80002",
      chainName: "Amoy Test Network",
      rpcUrls: ["https://rpc-amoy.polygon.technology/"],
      nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
      blockExplorerUrls: ["https://www.oklink.com/amoy/tx/"],
      contractAddress: "0x7E90f2E631345D3F1e1056CaD15a2553360Dd73d",
    },
    "Base Sepolia Testnet": {
      chainId: "0x14a34",
      chain: "84532",
      chainName: "Base Sepolia Test Network",
      rpcUrls: ["https://base-sepolia.blockpi.network/v1/rpc/public"],
      nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
      blockExplorerUrls: ["https://base-sepolia.blockscout.com/tx/"],
      contractAddress: "0xBA9420F21bc1B7AdB0c604e2452c210fc82b7089",
    },
  };

  const ContractAdd = networkParams[currentProvider].contractAddress;

  const switchNetwork = async () => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: networkParams[currentProvider].chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[currentProvider]],
          });
        } catch (addError) {
          console.error(addError);
        }
      } else {
        console.error(switchError);
      }
    }
  };


  const paytip = async () => {
    try {
      switchNetwork();
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const sign = await provider.getSigner();
      setSigner(sign);
      const contractAddress = ContractAdd;
      const contractABI = [
        "function ammountOfTip(string memory username) public view returns (uint256)",
      ];

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      setExplorer(networkParams[currentProvider].blockExplorerUrls);
      const tx = await contract.ammountOfTip(Username);
      setTip(tx.toString());
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.log(err);
      if(err.message.includes("User denied account authorization")){
        alert("Please connect your wallet first.");
        window.location.reload();
      }
    }
  };

  const withdraw = async () => {
    try{
    switchNetwork();
    const contractAddress = ContractAdd;
    setLoading(true);
    const withdrawABI = ["function withdraw(string memory username, string memory Key) public"];
    const contract = new ethers.Contract(contractAddress, withdrawABI, signer);
    const tx = await contract.withdraw(Username, Key);

    tx.wait().then((receipt) => {
      console.log("Withdrawn");
      console.log(receipt["hash"]);
      setTxHash(tx.hash);
    }).then(() => {
      handleRefresh();
    });
  } catch (err){
    console.log(err);
    if(err.message.includes("User denied transaction signature")){
      alert("Please confirm the transaction to withdraw the tips");
      window.location.reload();
    }
    
    if(err.message.includes("No tips available to withdraw")){
      alert("Sadly! You don't have any tips.");
    }else if(err.message){
      alert("Something Went wrong, Please try again.");
      window.location.reload();
    }
  }
  };

  useEffect(() => {
    if(!Tip){
      paytip();
    }
  });

  useEffect(() => {
    setTimeout(() => {
      setTxHash(null);
    }, 10000);
  }, [TxHash]);

  const handleRefresh = () => {
    setTip(null);
    setLoading(true);
    paytip();
  };

  const HashLink = (hash) => {
    if(Explorer && hash)
    var link = Explorer + hash;
    return link;
  }

  return (
    <div className="Withdraw">
      {Tip && !loading ? (
        <div className="withdraw-block">
          <div className="balance">
            {loading && <Loading />}
            <p>You have {ethers.formatEther(Tip.toString())} ETH tips!</p>
            <button className="refresh" onClick={handleRefresh}>
              Refresh
            </button>
          </div>
        {TxHash && <span>Tip Sent Successfully: <a href={HashLink(TxHash)} target="blank">View On Explorer!</a></span>}
          <div className="withdraw-btns">
            <button onClick={withdraw} className="twitter-withdraw-btn">
              Withdraw
            </button>
          </div>
        </div>
      ) : (
        <div className="loading">
          {loading && <Loading />}
        </div>
      )}
    </div>
  );
};

export default Withdraw;
