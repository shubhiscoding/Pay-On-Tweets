import { useEffect, useState } from "react";
import TweetPreview from "./TweetPreview";
import { ethers } from "ethers";
import Loading from "./loading";
import "../Styles/loading.css";
import ether from "../Assets/ether.jpg";

const TipForm = (provider) => {
  const [Username, setUsername] = useState("");
  const [Url, setUrl] = useState("");
  const [Tip, setTip] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const currentProvider = provider["provider"];
  const [loading, setLoading] = useState(false);
  const [TransactionProcessing, setTransactionProcessing] = useState(false);
  const [TipSent, setTipSent] = useState("");
  const [Explorer, setExplorer] = useState("");

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

  useEffect(() => {
    setTimeout(() => {
      setTipSent(null);
    }, 10000);
  }, [TipSent]);

  const tipform = async () => {
    if (!Url || !Tip) {
      alert("Please enter a valid tweet url and tip amount");
      return;
    }
    if (Url) {
      const parts = Url.split("/");
      if (parts.length < 6) {
        alert(
          "Please enter a valid tweet url: https://x.com/username/status/{tweetID: 1791806895335837804}"
        );
        return;
      }
      setUsername(parts[3]);
    }
    if (Tip <= 0) {
      alert("Please enter a valid tip amount");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setShowPreview(true);
    }, 1000);
  };

  useEffect(() => {
    if (showPreview) {
      setLoading(false);
      setTimeout(() => {
        document
          .getElementById("preview")
          .scrollIntoView({ behavior: "smooth" });
      }, 1500);
    }
  }, [showPreview]);

  useEffect(() => {
    if (TransactionProcessing) {
      const preview = document.getElementsByClassName("TweetPreview")[0];
      if (preview) {
        preview.style.display = "none";
      }
    }
  });

  const paytip = async () => {
    try {
      await switchNetwork();
      console.log(Username);
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const signerBalance = await provider.getBalance(signer.address);

      const contractAddress = ContractAdd;
      const contractABI = [
        "function tip(string memory username) public payable",
      ];

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const tipAmount = ethers.parseEther(Tip.toString());
      if (tipAmount > signerBalance) {
        alert(
          "Insufficient Funds for the Transaction, Please enter a valid ammount"
        );
        console.log("check");
      } else {
        console.log(Tip, " mybal", signerBalance);
      }
      setTransactionProcessing(true);
      setExplorer(networkParams[currentProvider].blockExplorerUrls);
      const tx = await contract.tip(Username, { value: tipAmount });

      await tx.wait();
      withdrawn();
      setTransactionProcessing(false);
      setTipSent(tx.hash);
    } catch (err) {
      console.log(err.message);
      setTransactionProcessing(false);
      if (err.message.includes("User denied transaction signature")) {
        alert("Please confirm the transaction to tip the tweet");
        window.location.reload();
      }else
      if (err.message.includes("Tip amount must be greater than 0.001 ether")) {
        alert("Please enter a Tip ammount greater then 0.001 matic");
      window.location.reload();
      }else
      if(err.message){
        alert("Transaction Failed, Refresh Please try again");
        window.location.reload();
      }
    }
  };

  const withdrawn = async () => {
    const preview = document.getElementsByClassName("TweetPreview")[0];
    const inputs = document.getElementsByClassName("tweetInput");
    if (inputs) {
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].value = "";
      }
    }
    if (preview) {
      preview.style.display = "none";
    } else {
      console.error("Element with class 'TweetPreview' not found.");
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setShowPreview(false); // Hide the preview when any input changes
  };

  const HashLink = (hash) => {
    console.log(Explorer, hash);
    if(Explorer && hash)
    var link = Explorer + hash;
  console.log(link);
    return link;
  }

  return (
    <div className="Tip-Page">
      <lottie-player src="https://lottie.host/de5d2b44-6f66-4b0a-a3ee-c1382da7aecf/Ku8FulinD6.json" background="transparent" speed="1" style={{width: '100%', height: '100%'}} loop autoplay direction="1" mode="normal"></lottie-player>
      
      <div className="TipForm" id="Tip-A-Tweet">
        <h1>Tip a Tweet</h1>
        <input
          type="text"
          className="tweetInput"
          placeholder="Enter Tweet url"
          onChange={handleInputChange(setUrl)}
        />
        <input
          type="number"
          className="tweetInput"
          placeholder="Enter your tip Amount"
          onChange={handleInputChange(setTip)}
        />
        <div className="labels">
          <button onClick={tipform}>Tip the tweet</button>
        </div>
        {showPreview && Username && (
          <div className="tweet" id="preview">
            {" "}
            <TweetPreview url={Url} payTip={paytip} />{" "}
          </div>
        )}
        {loading && (
          <div className="loading">
            <Loading />
          </div>
        )}
        {TransactionProcessing && (
          <span>
            Processing Transaction
            <div className="loading">
              <Loading />
            </div>
          </span>
        )}
        {TipSent && <span>Tip Sent Successfully: <a href={HashLink(TipSent)} target="blank">View On Explorer!</a></span>}
      </div>
    </div>
  );
};

export default TipForm;
