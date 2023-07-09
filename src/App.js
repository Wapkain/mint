import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connect } from './redux/blockchain/blockchainActions';
import { fetchData } from './redux/data/dataActions';
import * as s from './styles/globalStyles';
import styled from 'styled-components'; 

import { ethers } from 'ethers';


export const StyledButton = styled.button`
   
  cursor: pointer; 
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button` 
  border: none; 
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center; 
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
   
  
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;
function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(``);
  const [color, setColorFeedback] = useState(``);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: '',
    SCAN_LINK: '',
    NETWORK: {
      NAME: '',
      SYMBOL: '',
      ID: 5,
    },
    NFT_NAME: '',
    SYMBOL: '',
    MAX_SUPPLY: 1,
    GAS_LIMIT: 0,
    MARKETPLACE: '',
    MARKETPLACE_LINK: '',
    SHOW_BACKGROUND: false,
    SALE_STARTED: true,
  });


  // Public
  const claimNFTs = async () => {
    let cost = CONFIG.PUBLIC_COST;
    // let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    // let totalGasLimit = String(gasLimit * mintAmount);
    if (!CONFIG.SALE_STARTED) {
      setFeedback('Minting is not started yet!');
      setColorFeedback("alert alert-danger");
      return;
    }

    if (!window.ethereum) {
      setFeedback('Install Metamask & Use Metamask Browser');
      setColorFeedback("alert alert-danger");
    }
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let signer = await provider.getSigner();

    const abiResponse = await fetch('/config/abi.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    const abi = await abiResponse.json();

    let contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, abi, signer);

    let userBalance = await blockchain.smartContract.methods
      .balanceOf(blockchain.account)
      .call();

    if (parseInt(userBalance.toString()) + mintAmount > CONFIG.MAX_MINT) {
      setFeedback(
        'Amount exceeds your allocation! Allocation amount is 0 ARB/ETH per address!'
      );
      setColorFeedback("alert alert-danger");
      return;
    }

    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setColorFeedback("alert alert-success");
    setClaimingNft(true);

    try {
      await contract.mint(mintAmount, { value: totalCostWei });

      setFeedback(
        `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
      );
      setColorFeedback("alert alert-success");
      setClaimingNft(false);
      dispatch(fetchData(blockchain.account));
    } catch (err) {
      console.log(err.message);
      if (err.message.includes('insufficient funds')) {
        setFeedback("You don't have enough ETH for minting!");
        setColorFeedback("alert alert-danger");
      } else {
        setFeedback('Sorry, something went wrong please try again later.');
        setColorFeedback("alert alert-danger");
      }
      setClaimingNft(false);
    }
  };


  let maxNftMint = CONFIG.MAX_MINT;

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount <= maxNftMint ? mintAmount + 1 : mintAmount;
    setMintAmount(newMintAmount);
  };


  const getData = () => {
    if (blockchain.account !== '' && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch('/config/config.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
    
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);
 
 
  return (
<>  
      <div className="wrapper"> 
        <header>
            <div className="container">
                <nav className="navbar navbar-expand-lg">
                    <a className="navbar-brand" href="https://epicravenofficial.com"> 
                        <img src="config/images/logo.png" alt=""/>
                    </a>
                    {blockchain.account === "" ||
                      blockchain.smartContract === null ? (
                        <>   
                          <a href="#" className="general-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              dispatch(connect());
                              getData();
                            }} >
                              <span className="dashboard-icon">
                                  <img src="config/images/grid-icon.svg" alt=""/>  
                              </span>
                              Connect
                          </a>   
                        </>
                      ) : (
                        <>
                          <a href="#" className="general-btn" >
                              <span className="dashboard-icon">
                                  <img src="config/images/grid-icon.svg" alt=""/> 
                              </span> 
                              {blockchain.account.substring(0, 5)}...{blockchain.account.substring(38, 42)}
                          </a>
                        </>
                      )}
 
                    
                    <a href="#" className="dashboard-btn-moble" >
                        <img src="config/images/grid-green-icon.svg"  id="metamaskClick"
                        onClick={(e) => {
                              e.preventDefault();
                              dispatch(connect());
                              getData(); 
                            }}/> 
                    </a>
                </nav>
            </div>
        </header>
    

        <div className="content" >
            <section className="nft-mint-sec-wrap">
                <div className="container">
                    <div className="nft-mint-sec-row">
                        <div className="nft-mint-img-col" data-aos="fade-right" data-aos-duration="800">
                            <div className="nft-mint-img">
                                <img src="config/images/gif.gif" alt=""/>
                            </div>
                        </div>
                        <div className="nft-mint-content-col" data-aos="fade-left" data-aos-duration="800">
                            <div className="nft-mint-content">
                                <h2>{CONFIG.NFT_MINT_SECTION_NAME}</h2>
                                <span>{data.totalSupply != 0 ? (
                                  <>
                                  {data.totalSupply}
                                  </>
                                ):(
                                  <>
                                  X
                                  </>
                                ) } / {CONFIG.MAX_SUPPLY} MINTED  </span>
                                <p>
                                {" "}{CONFIG.NFT_MINT_SECTION}
                                  {feedback !== '' ?(
                                    <div class={color} role="alert">
                                     {feedback}
                                   </div> 
                                    ):null}
                                </p>
                                
                                {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                                    <>
                                      <h2>SOLD OUT</h2>
                                      <a href={CONFIG.OPENSEA} target="_blank">
                                       <img src="https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.svg" id="opensea"/>
                                      </a>

                                      <a href={CONFIG.DISCORD} target="_blank">
                                       <img src="https://www.svgrepo.com/show/353655/discord-icon.svg" id="discord"/>
                                      </a>

                                      <a href={CONFIG.TWITTER} target="_blank">
                                       <img src="https://www.svgrepo.com/show/448252/twitter.svg" id="twitter"/>
                                      </a>
                                    </>
                                ) : (
                                 <> 

                                    {blockchain.account === "" ||
                                    blockchain.smartContract === null ? (
                                      <> 
                                        <button href="#" className="general-btn-eth" 
                                        style={{zIndex:"9999999999999999999999999999999999999999999999"}}
                                          onClick={(e) => {
                                          e.preventDefault();
                                          dispatch(connect());
                                          getData();
                                        }} >Connect</button>
                                         {/* Alert */}
                                          {blockchain.errorMsg !== "" ? (
                                          <>  
                                            {alert(blockchain.errorMsg)}  
                                          </>
                                        ) : null}
                                      </>
                                    ) : (
                                      <>
                                          <div className="add-to-cart-wrap"> 
                                              {/* Public */}
                                              {CONFIG.PUBLIC_SALE == true && CONFIG.SALE_STARTED == true ? (
                                                <>
                                                <div className="add-to-cart">
                                                    <button type="button" className=""
                                                      onClick={(e) => {
                                                        e.preventDefault();
                                                        decrementMintAmount()
                                                      }} >
                                                        <img src="config/images/minus-icon-black.svg" alt=""/>
                                                    </button>
                                                    <input type="text" value={mintAmount}  />
                                                    <button type="button" className="" 
                                                      onClick={(e) => {
                                                        e.preventDefault();
                                                        incrementMintAmount()
                                                      }} >
                                                        <img src="config/images/plus-icon-black.svg" alt=""/>
                                                    </button>
                                                </div> 
                                                  <a href="#" className="general-btn-eth" style={{marginRight:"30px"}}>{(CONFIG.PUBLIC_COST_ETH*mintAmount).toString().substring(0, 5)} ETH</a> 
                                                  
                                                  <a href="#" className="general-btn" id="mintNow"
                                                    disabled={claimingNft ? 1 : 0}
                                                    onClick={(e) => {
                                                      e.preventDefault();
                                                      claimNFTs();
                                                      getData();
                                                    }} >MINT NOW</a>   
                                                </>
                                              ) : (
                                                <> 
                                                 <a href="#" className="general-btn" 
                                                    onClick={(e) => {
                                                      e.preventDefault();
                                                      dispatch(connect());
                                                      getData();
                                                    }} >Sale Not Open</a>
                                                </>
                                              )}  
                                                    
                                          </div>
                                      </>
                                    )}
                                  </>
                                )}
                                

                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* <section className="nft-card-wrap" >
                
            </section> */}
        </div> 

       
       
    </div>
    </>
  );
}

export default App;
