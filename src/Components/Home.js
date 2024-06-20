import React, { useEffect, useRef } from "react";
import "../Styles/Home.css";

const Home = ({ onLottieLoaded }) => {
    const lottieRef = useRef(null);
    useEffect(() => {
        const lottieElement = lottieRef.current;

        const handleLottieLoad = () => {
            if (onLottieLoaded) {
                onLottieLoaded();
            }
        };

        // Add event listener for Lottie load
        lottieElement.addEventListener("load", handleLottieLoad);

        // Cleanup event listener
        return () => {
            lottieElement.removeEventListener("load", handleLottieLoad);
        };
    }, [onLottieLoaded]);

    const claimtip = () => {
        document.getElementById("claim-tips").scrollIntoView({ behavior: "smooth" });
    };

    const tipatweet = () => {
        document.getElementById("Tip-A-Tweet").scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="home">
            <div className="texts">
                <h1 className="tittle">Tip-A-Tweet</h1>
                <div className="home-content">
                    <h1>Empower Creators!</h1>
                    <p>
                        Welcome to the platform that revolutionizes tipping for the digital
                        age. Here, you can seamlessly reward creators you admire on Twitter
                        with cryptocurrency.
                    </p>
                    <div className="buttons">
                        <button onClick={claimtip}>Claim-Tips</button>
                        <button onClick={tipatweet}>Tip-A-Tweet</button>
                    </div>
                </div>
            </div>
            <div className="home-image">
                <lottie-player 
                    ref={lottieRef}
                    src="https://lottie.host/256779d3-1a14-4f09-a417-f58bc1f898b1/2M27YQJEtp.json" 
                    background="##FFFFFF" 
                    speed="1" 
                    style={{width: '80%', height: '80%'}} 
                    loop 
                    autoplay 
                    direction="1" 
                    mode="normal">
                </lottie-player>
            </div>
        </div>
    );
}

export default Home;
