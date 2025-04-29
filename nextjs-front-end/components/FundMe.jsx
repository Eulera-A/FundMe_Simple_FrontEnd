"use client"
import { useEffect,useState } from "react"
import { ethers } from "ethers"
import { abi, contractAddress } from "../constants/constants_Sepolia.js" 
import { useMoralis,useWeb3Contract } from "react-moralis"
import { useNotification } from "web3uikit"
import {ButtonColored} from "web3uikit"
import bellIcon from "../img/bell.png" // local image

export default function FundMe() {
      const [ethAmount, setEthAmount] = useState("")
      const [contractBalance, setContractBalance] = useState("")
      const dispatch = useNotification()
      const [errorMessage, setErrorMessage] = useState(null);
      const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()

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
  
      async function withdraw() {
          const { signer, provider } = await getProviderAndSigner()
          const fundMeContract = new ethers.Contract(contractAddress, abi, signer)
          try {
              const txResponse = await fundMeContract.withdraw()
              await listenForTransactionMine(txResponse, provider)
          } catch (e) {
              console.error(e)
          }
      }
  
      async function getBalance() {
          const { provider } = await getProviderAndSigner()
          const balance = await provider.getBalance(contractAddress)
          setContractBalance(ethers.utils.formatEther(balance))
      }
  
      function listenForTransactionMine(transactionResponse, provider) {
          console.log(`Mining transaction with hash: ${transactionResponse.hash}`)
          return new Promise((resolve, reject) => {
              provider.once(transactionResponse.hash, (txReceipt) => {
                  txReceipt.status === 1 ? resolve(txReceipt) : reject("Failed")
              })
          })
      }
    //   async function updateUIValues() {
    //     // Another way we could make a contract call:
    //     // const options = { abi, contractAddress: raffleAddress }
    //     // const fee = await Moralis.executeFunction({
    //     //     functionName: "getEntranceFee",
    //     //     ...options,
    //     // })
    //     const fundMeBalanceFromCall = (await getBalance()).toString()
    //     setContractBalance(fundMeBalanceFromCall)
    // }

    // useEffect(() => {
    //     if (isWeb3Enabled) {
    //         updateUIValues()
    //     }
    // }, [isWeb3Enabled])
   // functions showing notifications on funding transactions
      const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: <img src={bellIcon} alt="Bell Icon" style={{ width: "20px", height: "20px" }} />,
        })
    }
    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            //updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }
  
      return (
          <div className="p-5">
              <h2 className="text-2xl font-semibold mb-4">FundMe Contract</h2>
  
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
                    onError: (error) => console.log(error),
                })} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                  Fund
              </button>
              <button onClick={withdraw} className="bg-red-500 text-white px-4 py-2 rounded mr-2">
                  Withdraw
              </button>
              <button onClick={getBalance} className="bg-blue-500 text-white px-4 py-2 rounded">
                  Get Balance
              </button>
  
              {contractBalance && <p className="mt-4">Contract Balance: {contractBalance} ETH</p>}
          </div>
      )
  }