// src/AchatBillet.js
import React, { useState } from "react";

function AchatBillet({ onAchatSubmit }) {
  const [dureeVol, setDureeVol] = useState("");
  const [prixEur, setPrixEur] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convertir en nombre
    const dureeVolNum = Number(dureeVol);
    const prixEurNum = Number(prixEur);

    // Vérifier que les valeurs sont valides
    if (dureeVolNum <= 0 || prixEurNum <= 0) {
      alert("Veuillez saisir une durée et un prix valides !");
      return;
    }

    // Appeler le parent avec les données converties
    onAchatSubmit({
      dureeVol: dureeVolNum,
      prixEur: prixEurNum,
    });

    // Réinitialiser le formulaire
    setDureeVol("");
    setPrixEur("");
  };

  return (
    <div className="achat-billet">
      <h2>Achat d'un billet avec assurance retard</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Durée du vol (heures) :</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={dureeVol}
            onChange={(e) => setDureeVol(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Prix du billet (EUR) :</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={prixEur}
            onChange={(e) => setPrixEur(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn">
          Souscrire l'assurance
        </button>
      </form>
    </div>
  );
}

export default AchatBillet;
