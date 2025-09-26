// src/contract.js
import { ethers } from "ethers";
import contractJSON from "./contracts/abi/AssuranceVol.json";
export const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // ← adresse affichée au déploiement
export const contractABI = contractJSON.abi;

export function getContract(signerOrProvider) {
  return new ethers.Contract(contractAddress, contractABI, signerOrProvider);
}
