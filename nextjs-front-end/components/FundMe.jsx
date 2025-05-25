"use client"
import { useEffect,useState } from "react"
import { ethers } from "ethers"
import { abi } from "../constants/constants_Sepolia.js" 
import contractAddresses from "../constants/contractAddresses.json"

import { useMoralis,useWeb3Contract } from "react-moralis"
import { useNotification } from "web3uikit"
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import PriceFeedCheck from "./PriceFeedCheck"


export default function FundMe() {
      const [ethAmount, setEthAmount] = useState("")
      const [contractBalance, setContractBalance] = useState("")
      const [priceFeedAddress, setPriceFeedAddress] = useState(null)
      const [ContractMinFundAmount,setContractMinFundAmount] = useState("")
      //const [walletBalance, setWalletBalance] = useState("")
      const [deadlineDuration, setDeadlineDuration] = useState("")
      const [timeLeft, setTimeLeft] = useState(null)


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
        runContractFunction: withdrawFunds,
        data: withdrawTxResponse,
        isLoading_withdraw,
        isFetching_withdraw,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "withdrawFunds",
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
           // console.log(`min funding amount is $ ${ContractMinFundAmount.toString()} USD`)
        } catch (error) {
            console.error("Failed to fetch MINIMUM_USD:", error)
        }
    }

    useEffect(() => {
        if (contractAddress) {
            fetchMinimumUsd()
        }
    }, [contractAddress])

    // const fetchWalletBalance = async () => {
    //     try {
    //         if (window.ethereum) {
    //             const provider = new ethers.providers.Web3Provider(window.ethereum)
    //             const signer = provider.getSigner()
    //             const walletAddress = await signer.getAddress()
    //             const rawWalletBalance = await provider.getBalance(walletAddress)
    //             setWalletBalance(ethers.utils.formatEther(rawWalletBalance))
    //         }
    //     } catch (error) {
    //         console.error("Failed to fetch wallet balance:", error)
    //     }

        
    // }
    
        // // Fetch balance when component mounts
        // useEffect(() => {
        //     fetchWalletBalance()
        //     window.ethereum?.on("accountsChanged", fetchWalletBalance)
        //     window.ethereum?.on("chainChanged", fetchWalletBalance)
    
        //     return () => {
        //         window.ethereum?.removeListener("accountsChanged", fetchWalletBalance)
        //         window.ethereum?.removeListener("chainChanged", fetchWalletBalance)
        //     }
        // }, [])

    // this is the manual way of coding to listen fro txs:
    //   function listenForTransactionMine(transactionResponse, provider) {
    //       console.log(`Mining transaction with hash: ${transactionResponse.hash}`)
    //       return new Promise((resolve, reject) => {
    //           provider.once(transactionResponse.hash, (txReceipt) => {
    //               txReceipt.status === 1 ? resolve(txReceipt) : reject("Failed")
    //           })
    //       })
    //   }
      async function updateUIValues() {
        // Another way we could make a contract call:
        // const options = { abi, contractAddress: raffleAddress }
        // const fee = await Moralis.executeFunction({
        //     functionName: "getEntranceFee",
        //     ...options,
        // })
        //fetchWalletBalance()
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
            handleFailureNotification("Only Owner Accessible Controls");
        } else if (reason?.includes("You need to spend more ETH")) {
            handleFailureNotification("You need to spend more ETH!");
        } else {
            handleFailureNotification(reason || "Unknown error occurred");
        }
    };
    

   

    // const handleNotOwnerNotification = () => {
    //     dispatch({
    //         type: "warning",
    //         message: "You must be the contract owner to withdraw funds!",
    //         title: "Unauthorized Withdraw",
    //         position: "topR",
    //         icon: <img src= "/warning.png" alt="Bell Icon" style={{ width: "20px", height: "20px" }} />,
    //     })
    // }
    
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


      // added in new setdeadline UI:
      const {
        runContractFunction: resetFundingDeadline,
        isLoading: isLoading_resetDeadline,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "resetFundingDeadline",
        params: {
            durationInDays: deadlineDuration || "0", // fallback to "0" if empty
        },
    })

    const handleResetDeadline = async () => {
        try {
            await resetFundingDeadline({
                onSuccess: async (tx) => {
                    await tx.wait(1)
                    handleNewNotification(tx)
                },
                onError: (error) => {
                    const reason = extractRevertReason(error)
                    console.error("Reset Deadline Failed:", reason || error)
                    handleFailure(error) // optional UI feedback
                },
            })
        } catch (err) {
            const reason = extractRevertReason(err)
    console.error("Reset Deadline Failed:", reason || err)
    handleFailure(err)  // optional if you want UI feedback
            //console.error("Reset Deadline Failed:", err)
        }
    }

    //add in ui for viewing time left to closing 
    const {
        runContractFunction: getTimeLeft,
        isLoading: isLoading_getTimeLeft,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "timeLeft",
        params: {},
        
    })
    function formatTime(seconds) {
        const d = Math.floor(seconds / (3600 * 24))
        const h = Math.floor((seconds % (3600 * 24)) / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${d}d ${h}h ${m}m ${s}s`
    }
    useEffect(() => {
        if (!contractAddress || !isWeb3Enabled) return
    
        async function updateCountdown() {
            try {
                const result = await getTimeLeft()
                const seconds = result?.toNumber?.() || 0
                setTimeLeft(seconds)
            } catch (error) {
                console.error("Failed to fetch time left:", error)
            }
        }
    
        updateCountdown()
    
        const interval = setInterval(updateCountdown, 1000)
    
        return () => clearInterval(interval)
    }, [contractAddress, isWeb3Enabled])
    


   
  
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
                await withdrawFunds({
                    // onComplete:
                    // onError:
                    onSuccess: handleSuccess,
                    onError: handleFailure,//handleWithdrawFailure, //(error) => console.log(error),
                })

              } className="bg-red-500 text-white px-4 py-2 rounded mr-2">
                  Withdraw Your Funds
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

<input
        placeholder="Extend deadline (in days)"
        value={deadlineDuration}
        onChange={(e) => setDeadlineDuration(e.target.value)}
        className="border px-4 py-2 rounded mr-2"
        type="number"
        min="1"
    />
    <button
        onClick={handleResetDeadline}
        className="bg-yellow-500 text-white px-4 py-2 rounded"
        disabled={!deadlineDuration || isLoading_resetDeadline}
    >
        Reset Deadline
    </button>
    {timeLeft !== null && (
    <p className="mt-4 text-xl text-blue-700 font-semibold">
        ⏳ Time until deadline: {timeLeft > 0 ? formatTime(timeLeft) : "Funding Closed"}
    </p>
)}
          </div>
          
      )
  }