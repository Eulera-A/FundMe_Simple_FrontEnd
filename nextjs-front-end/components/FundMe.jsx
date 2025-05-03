"use client"
import { useEffect,useState } from "react"
import { ethers } from "ethers"
import { abi } from "../constants/constants_Sepolia.js" 
import {contractAddresses_js} from "../constants/contractAddresses.js"
import contractAddresses from "../constants/contractAddresses.json"

import { useMoralis,useWeb3Contract } from "react-moralis"
import { useNotification } from "web3uikit"
import {ButtonColored} from "web3uikit"
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import PriceFeedCheck from "./PriceFeedCheck"

// youtube: 18:04:25 tailwindcss
export default function FundMe() {
      const [ethAmount, setEthAmount] = useState("")
      const [contractBalance, setContractBalance] = useState("")
      const [priceFeedAddress, setPriceFeedAddress] = useState(null)
      const [ContractMinFundAmount,setContractMinFundAmount] = useState("")
      
      const dispatch = useNotification()
      const [errorMessage, setErrorMessage] = useState(null);
      const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()

      const chainId = parseInt(chainIdHex)
      console.log(`ChainId is ${chainId}`)
      const contractAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

      async function getProviderAndSigner() {
          if (typeof window.ethereum !== "undefined") {
              const provider = new ethers.providers.Web3Provider(window.ethereum)
              await provider.send("eth_requestAccounts", [])
              const signer = provider.getSigner()
              return { provider, signer }
          } else {
              alert("Please install MetaMask, no wallet detected")
          }
      }

      const {
        runContractFunction: fund,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "fund",
        msgValue: ethers.utils.parseEther(ethAmount || "0"),
        params: {},
    })

  
      //async function fund() {
        //  const { signer, provider } = await getProviderAndSigner()
         // const fundMeContract = new ethers.Contract(contractAddress, abi, signer)
          //try {
    //         //  const txResponse = await fundMeContract.fund({
    //               value: ethers.utils.parseEther(ethAmount),
    //           })
    //           await listenForTransactionMine(txResponse, provider)
    //       } catch (e) {
    //           console.error(e)
    //       }
    //   }

    const {
        runContractFunction: withdraw,
        data: withdrawTxResponse,
        isLoading_withdraw,
        isFetching_withdraw,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "withdraw",
        //msgValue: {},
        params: {},
    })

    const {
        runContractFunction: getPriceFeed,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getPriceFeed",
        //msgValue: {},
        params: {},
    })

    useEffect(() => {
        async function fetchPriceFeed() {
            const result = await getPriceFeed()
            setPriceFeedAddress(result)
        }

        fetchPriceFeed()
    }, [contractAddress])

  
    //   async function withdraw() {
    //       const { signer, provider } = await getProviderAndSigner()
    //       const fundMeContract = new ethers.Contract(contractAddress, abi, signer)
    //       try {
    //           const txResponse = await fundMeContract.withdraw()
    //           await listenForTransactionMine(txResponse, provider)
    //       } catch (e) {
    //           console.error(e)
    //       }
    //   }
  
      async function getBalance() {
          const { provider } = await getProviderAndSigner()
          const balance = await provider.getBalance(contractAddress)
          setContractBalance(ethers.utils.formatEther(balance))
      }

      
      async function fetchMinimumUsd() {
        try {
            const { provider } = await getProviderAndSigner()
            const signer = provider.getSigner()
            const fundMeContract = new ethers.Contract(contractAddress, abi, signer)
    
            const minimumUsd = await fundMeContract.MINIMUM_USD()
            setContractMinFundAmount(ethers.utils.formatEther(minimumUsd))
            console.log(`min funding amount is $ ${ContractMinFundAmount} USD`)
        } catch (error) {
            console.error("Failed to fetch MINIMUM_USD:", error)
        }
    }

    useEffect(() => {
        if (contractAddress) {
            fetchMinimumUsd()
        }
    }, [contractAddress])

    

  
      function listenForTransactionMine(transactionResponse, provider) {
          console.log(`Mining transaction with hash: ${transactionResponse.hash}`)
          return new Promise((resolve, reject) => {
              provider.once(transactionResponse.hash, (txReceipt) => {
                  txReceipt.status === 1 ? resolve(txReceipt) : reject("Failed")
              })
          })
      }
      async function updateUIValues() {
        // Another way we could make a contract call:
        // const options = { abi, contractAddress: raffleAddress }
        // const fee = await Moralis.executeFunction({
        //     functionName: "getEntranceFee",
        //     ...options,
        // })
        await getBalance()
        //setContractBalance(fundMeBalanceFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

   // functions showing notifications on funding transactions
      const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: <img src= "/bell.png" alt="Bell Icon" style={{ width: "20px", height: "20px" }} />,
        })
    }

    const handleFailureNotification = (reason) => {
        dispatch({
            type: "warning",
            message: reason,
            title: "Incomplete Transaction Notification",
            position: "topR",
            icon: <img src= "/warning.png" alt="Bell Icon" style={{ width: "20px", height: "20px" }} />,
        })
    }



    function extractRevertReason(error) {
        if (error?.code === 4001) {
            return "User Declined"
        }

            // Check for insufficient funds error (Metamask style)
    const lowFundsMsg = error?.data?.message || error?.message
    if (lowFundsMsg?.toLowerCase().includes("insufficient funds")) {
        return "Insufficient Wallet Balance"
    }
    
        const hexData = error?.data?.data?.data || error?.data?.data || error?.data
    
        if (!hexData || typeof hexData !== "string") {
            console.warn("No hex data found in error:", error)
            return null
        }
    
        try { // this detects the errors defined in Solidity contracts: such as the FundMe__NotOwner error type that shows up in the ABI!

            // Try decoding as Solidity custom error
            const iface = new ethers.utils.Interface(abi)
            const decoded = iface.parseError(hexData)
            return decoded?.name // e.g., "FundMe__NotOwner"
        } catch {
            // Try decoding as standard Error(string)
            if (hexData.startsWith("0x08c379a0")) {
                const reasonHex = "0x" + hexData.slice(10)
                try {
                    const [reason] = ethers.utils.defaultAbiCoder.decode(["string"], reasonHex)
                    return reason
                } catch {
                    return null
                }
            }
            return null
        }}
    
    

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            handleFailure(error)
            }  
    }

    const handleFailure = (error) => {
        let reason = "Transaction failed";
    
        try {
            reason = extractRevertReason(error);
        } catch (e1) {
            const errorMsg = error?.message || error?.data?.message || "";
    
            if (errorMsg.includes("insufficient funds")) {
                reason = "Insufficient funds in wallet.";
            } else if (errorMsg.includes("User denied transaction signature")) {
                reason = "Transaction was rejected in wallet.";
            } else {
                reason = errorMsg || "Unknown error occurred.";
            }
        }
    
        console.log("Revert reason:", reason);
    
        if (reason?.includes("FundMe__NotOwner")) {
            handleFailureNotification("Only the contract owner can withdraw funds.");
        } else if (reason?.includes("You need to spend more ETH")) {
            handleFailureNotification("You need to spend more ETH!");
        } else {
            handleFailureNotification(reason || "Unknown error occurred");
        }
    };
    

   

    const handleNotOwnerNotification = () => {
        dispatch({
            type: "warning",
            message: "You must be the contract owner to withdraw funds!",
            title: "Unauthorized Withdraw",
            position: "topR",
            icon: <img src= "/warning.png" alt="Bell Icon" style={{ width: "20px", height: "20px" }} />,
        })
    }
    
    const handleWithdrawFailure = (error) => {
        if (error.message.includes('FundMe__NotOwner')) {
            console.log('You must be the owner to withdraw funds!')
            //toast.error('You must be the owner to withdraw funds!');
        } else {
            console.log("You must be the owner to withdraw funds!")
            //handleNotOwnerNotification()
            //toast.error('An error occurred during withdrawal. Please try again.');
          }
      };

   
  
      return (
          <div className="p-5">
              <h2 className="text-2xl font-semibold mb-4">FundMe Contract : {contractAddress}</h2>
  
              <input
                  placeholder="Amount in ETH"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  className="border px-4 py-2 rounded mr-2"
              />
              <button
               onClick={async () =>
                await fund({
                    // onComplete:
                    // onError:
                    onSuccess: handleSuccess,
                    onError: handleFailure,
                })} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                  Fund
              </button>
              <button onClick={async () =>
                await withdraw({
                    // onComplete:
                    // onError:
                    onSuccess: handleSuccess,
                    onError: handleFailure,//handleWithdrawFailure, //(error) => console.log(error),
                })

              } className="bg-red-500 text-white px-4 py-2 rounded mr-2">
                  Withdraw
              </button>
              <button onClick={getBalance} className="bg-blue-500 text-white px-4 py-2 rounded">
                  Get Balance
              </button>

              {contractBalance && <p className="mt-4"> Current FundMe Balance: {contractBalance} ETH</p>}
              
              {ContractMinFundAmount && <p className="mt-5"> Minium Funding Amount: ${ContractMinFundAmount} USD </p>}


            {priceFeedAddress && (
                <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50">
                <PriceFeedCheck priceFeedAddress={priceFeedAddress} />
            </div>
            )}
          </div>
          
      )
  }