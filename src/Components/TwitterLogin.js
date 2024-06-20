import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  signInWithPopup,
  signOut,
  TwitterAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../Firebase/firebase"; // Adjust the import path if needed
import "../Styles/TwitterLogin.css";

import Withdraw from "./Withdraw";

const TwitterLogin = (currentProvider) => {
  const [user, setUser] = useState(null);
  const [Username, setUsername] = useState(null);
  const [signer, setSigner] = useState(null); // Add this line
  const [Tip, setTip] = useState(null);
  const networkProvider = currentProvider['currentProvider'];

  const data = {
    networkProvider: networkProvider,
    Username: Username
  };

  const handleTwitterLogin = async () => {
    const provider = new TwitterAuthProvider();
    try {
      await signInWithPopup(auth, provider)
        .then((userCredential) => {
          const screenName = userCredential.user.reloadUserInfo.screenName;
          setUsername(screenName);
          localStorage.setItem("Username", screenName);
          console.log(screenName);
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("Username");
      setUsername(null);
      setTip(null);
      disconnectWallet();
    } catch (error) {
      console.error(error);
      if(error.message === "Cannot read property 'send' of undefined"){
        alert("Please connect your wallet first.");
        window.location.reload();
      }else if(error.message){
        alert("Something Went wrong, Please try again.");
        window.location.reload();
      }
    }
  };

  const disconnectWallet = async () => {
    // Logic to disconnect the user's wallet
    if (window.ethereum && window.ethereum.isConnected()) {
      try {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [
            {
              eth_accounts: {},
            },
          ],
        });
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const storedUsername = localStorage.getItem("Username");
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="TwitterLogin" id="claim-tips">
    <div className="name"><h1>Claim Your <span className="tip-blue">Funds</span></h1></div>
      <div className="Withdraw-Content">
        {user ? (
          <div className="User-details">
            <h2>Hii, {Username}!</h2>
            <Withdraw data={data} />
            <button onClick={handleLogout} className="twitter-logout-btn">Logout</button>
          </div>
        ) : (
          <div>
            <button onClick={handleTwitterLogin} className="twitter-login-btn">
              Login with Twitter
            </button>
          </div>
        )}
      {user && <dotlottie-player src="https://lottie.host/96a0a6ae-d333-4a22-bebb-52b8b9265d11/RRWSkQc4lT.json" background="transparent" speed="1" style={{width: '40%', height: '40%'}} loop autoplay></dotlottie-player>}
      </div>
    </div>
  );
};

export default TwitterLogin;