import React, { useState, useEffect } from "react";
import { TwitterTweetEmbed } from "react-twitter-embed";

const TweetPreview = ({ url, payTip }) => {
  const [tweetId, setTweetId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [Username, setUsername] = useState("");

  useEffect(() => {
    const extractTweetId = (url) => {
      const parts = url.split("/");
      console.log(parts);
      setUsername(parts[3]);
      if(parts[parts.length - 1].includes("?")){
        return parts[parts.length - 1].split("?")[0];
      }
      return parts[parts.length - 1];
    };

    if (url) {
      const id = extractTweetId(url);
      if (id === null || isNaN(id)) {
        console.log("Invalid tweet URL");
        alert("Please enter a valid tweet URL");
        return;
      }
      setTweetId(id);
      setLoading(true);
    }
  }, [url]);

  const handleTweetLoad = () => {
    try{
      setLoading(false);
      const container = document.getElementsByClassName("twitter-tweet")[0];
      if (container) {
        const button = document.createElement("button");
        const createUsr = document.createElement("h3");
        createUsr.innerText = "Username: " + Username;
        container.appendChild(createUsr);
        button.classList.add("confirm-btn");
        button.innerText = "Confirm";
        container.appendChild(button);
        button.addEventListener("click", () => {
          payTip();
          setTimeout(() => {
          document.getElementById("Tip-A-Tweet").scrollIntoView({ behavior: "smooth" });
          }, 500);
        });
      }else{
        alert("Please enter a valid tweet URL");
      }
    } catch (err) {
      console.log(err);
      if(err.message === "Cannot read property 'appendChild' of null"){
        alert("Please enter a valid tweet URL");
        window.location.reload();
      }else
      if(err.message){
        alert("Something Went wrong, Please try again.");
        window.location.reload();
      }
    }
  };

  return (
    <div className="TweetPreview">
      {tweetId && (
        <div>
          <TwitterTweetEmbed tweetId={tweetId} onLoad={handleTweetLoad} />
        </div>
      )}
      {!loading && !tweetId && (
        <p>Enter a valid tweet URL to see the preview.</p>
      )}
    </div>
  );
};

export default TweetPreview;
