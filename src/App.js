// src/App.js
import React, { useState } from "react";
import { ethers } from "ethers";

import AchatBillet from "./AchatBillet";
import Paiement from "./Paiement";
import SimulationRetard from "./SimulationRetard";
import Historique from "./Historique";

import { getContract, contractAddress } from "./contract";
import "./App.css";

function App() {
  const [vueActuelle, setVueActuelle] = useState("achat");
  const [vuePrecedente, setVuePrecedente] = useState("achat");
  const [billetActif, setBilletActif] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  // ==========================
  // Connexion Wallet Client
  // ==========================
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Installez MetaMask !");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const clientAccount = accounts[0]; // Compte client
      setAccount(clientAccount);
      console.log("Compte connecté :", clientAccount);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const c = getContract(signer);
      setContract(c);
      console.log("Contract chargé :", contractAddress);
    } catch (err) {
      console.error("Erreur connexion wallet :", err);
      alert("Connexion échouée");
    }
  };

  // ==========================
  // Achat billet
  // ==========================
  const handleAchat = async ({ dureeVol, prixEur }) => {
    if (!contract) {
      alert("Connectez votre wallet avant d'acheter !");
      return;
    }

    try {
      console.log("Souscription pour :", dureeVol, "heures,", prixEur, "EUR");

      // ⚠️ Aucune valeur ETH envoyée ici, juste la création du billet
      const tx = await contract.souscrireAssurance(dureeVol, prixEur);
      await tx.wait();

      const compteur = await contract.compteurBillets();
      const id = compteur.toString();

      const billet = await contract.getBillet(id);
      console.log("Billet créé :", billet);

      setBilletActif({ id, ...billet });
      setVueActuelle("paiement");
    } catch (err) {
      console.error("Erreur souscription :", err);
      alert(
        "Erreur lors de la souscription : " +
          (err?.reason || err?.data?.message || err.message)
      );
    }
  };

  // ==========================
  // Paiement billet
  // ==========================
  const handlePaiement = async () => {
    if (!contract || !billetActif) return;

    try {
      console.log("Paiement billet ID :", billetActif.id);

      const tx = await contract.payerBillet(billetActif.id, {
        value: billetActif.prixEnWei,
      });
      await tx.wait();

      const billetPaye = { ...billetActif, statut: "Payé" };
      setBilletActif(billetPaye);
      setHistorique([...historique, billetPaye]);
      setVueActuelle("simulation");

      console.log("Paiement réussi !");
    } catch (err) {
      console.error("Erreur paiement :", err);
      alert(
        "Erreur lors du paiement : " +
          (err?.reason || err?.data?.message || err.message)
      );
    }
  };

  // ==========================
  // Simulation depuis historique
  // ==========================
  const simulerDepuisHistorique = (billet) => {
    setBilletActif(billet);
    setVuePrecedente("historique");
    setVueActuelle("simulation");
  };

  // ==========================
  // Fin de simulation
  // ==========================
  const handleSimulationTerminee = () => {
    setBilletActif(null);
    setVueActuelle(vuePrecedente);
    setVuePrecedente("achat");
  };

  // ==========================
  // Navigation
  // ==========================
  const naviguerVers = (vue) => {
    setBilletActif(null);
    setVueActuelle(vue);
    setVuePrecedente(vue);
  };

  // ==========================
  // Rendu
  // ==========================
  return (
    <div className="App">
      <header className="App-header">
        <h1>Assurance Retard de Vol</h1>

        {/* Bouton pour connecter le compte client */}
        <button onClick={connectWallet}>
          {account
            ? `Connecté: ${account.slice(0, 6)}...`
            : "Connecter Wallet (Client)"}
        </button>

        <nav>
          <button onClick={() => naviguerVers("achat")}>Acheter un Billet</button>
          <button onClick={() => naviguerVers("historique")}>Voir l'Historique</button>
        </nav>
      </header>

      <main className="container">
        {vueActuelle === "achat" && <AchatBillet onAchatSubmit={handleAchat} />}

        {vueActuelle === "paiement" && (
          <Paiement
            detailsBillet={billetActif}
            onPaiementReussi={handlePaiement}
            onRetour={() => naviguerVers("achat")}
          />
        )}

        {vueActuelle === "simulation" && (
          <SimulationRetard
            detailsBillet={billetActif}
            onTermine={handleSimulationTerminee}
            contract={contract}
          />
        )}

        {vueActuelle === "historique" && (
          <Historique
            billets={historique}
            onSimuler={simulerDepuisHistorique}
          />
        )}
      </main>
    </div>
  );
}

export default App;
