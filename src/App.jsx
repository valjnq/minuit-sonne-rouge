import React, { useState, useEffect, useRef } from "react";
import roles from "./roles-fr.json";
import QRCode from "react-qr-code";

function normalizeNom(nom) {
  return nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

const buttonStyle = {
  padding: "0.5rem 1.2rem",
  fontFamily: "Cardo, serif",
  fontSize: "1rem",
  borderRadius: 8,
  border: "1px solid #bbb",
  background: "#f5f5f5",
  color: "#222",
  cursor: "pointer",
  transition: "background 0.2s, color 0.2s, border 0.2s",
};

export default function App() {
  const base = {
    5: { Habitants: 3, Étrangers: 0, Acolytes: 1, Demons: 1 },
    6: { Habitants: 3, Étrangers: 1, Acolytes: 1, Demons: 1 },
    7: { Habitants: 5, Étrangers: 0, Acolytes: 1, Demons: 1 },
    8: { Habitants: 5, Étrangers: 1, Acolytes: 1, Demons: 1 },
    9: { Habitants: 5, Étrangers: 2, Acolytes: 1, Demons: 1 },
    10: { Habitants: 7, Étrangers: 0, Acolytes: 2, Demons: 1 },
    11: { Habitants: 7, Étrangers: 1, Acolytes: 2, Demons: 1 },
    12: { Habitants: 7, Étrangers: 2, Acolytes: 2, Demons: 1 },
    13: { Habitants: 9, Étrangers: 0, Acolytes: 3, Demons: 1 },
    14: { Habitants: 9, Étrangers: 1, Acolytes: 3, Demons: 1 },
    15: { Habitants: 9, Étrangers: 2, Acolytes: 3, Demons: 1 },
  };

  // --- STATE ---
  const [selected, setSelected] = useState([]);
  const [nbJoueurs, setNbJoueurs] = useState(10);
  const [edition, setEdition] = useState("Sombre présage");
  const [tableRepartition, setTableRepartition] = useState(base);
  const [rolesValides, setRolesValides] = useState(false);
  const [afficherRoles, setAfficherRoles] = useState(true);
  const [erreurValidation, setErreurValidation] = useState("");
  const [afficherOrdreReveil, setAfficherOrdreReveil] = useState(false);
  const [ordreNuitActuelle, setOrdreNuitActuelle] = useState("premiere");
  const [affectationVisible, setAffectationVisible] = useState(false);
  const [joueursAttribues, setJoueursAttribues] = useState({});
  const [indexActif, setIndexActif] = useState(null);
  const [nomTemporaire, setNomTemporaire] = useState("");
  const [roleActif, setRoleActif] = useState(null);
  const [rolesRestants, setRolesRestants] = useState([]);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [afficherRepartition, setAfficherRepartition] = useState(false);
  const [afficherBluffs, setAfficherBluffs] = useState(false);
  const [choisirBluffsVisible, setChoisirBluffsVisible] = useState(false);
  const [bluffs, setBluffs] = useState([]);
  const [erreurBluffs, setErreurBluffs] = useState("");
  const [bluffsValides, setBluffsValides] = useState(false);
  const [afficherNotes, setAfficherNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [customScriptVisible, setCustomScriptVisible] = useState(false);
  const [customScriptPool, setCustomScriptPool] = useState([]); // pool of available roles for custom script
  const [customScriptTemp, setCustomScriptTemp] = useState([]); // temp selection in modal

  const urlPDF = {
    "Sombre présage": "docs/minuitsonnerouge-sombrepresage.pdf",
    "Parfums d’hystérie": "docs/minuitsonnerouge-parfumsdhysterie.pdf",
    "Crépuscule funeste": "docs/minuitsonnerouge-crepusculefuneste.pdf",
  };

  useEffect(() => {
    setSelected([]);
    setErreurValidation("");
    if (edition === "script personnalisé") {
      setCustomScriptVisible(true);
      // Only clear temp if edition changes from something else
      // (do not clear if just opening/closing modal)
      // No action here: keep customScriptTemp as is
    } else {
      setCustomScriptVisible(false);
      setCustomScriptTemp([]); // clear temp if leaving custom script
    }
  }, [edition]);

  const colonnes = Array.from({ length: 11 }, (_, i) => i + 5);

  const lignes = [
    { label: "Habitants", color: "#0e74b4", type: "Habitant" },
    { label: "Étrangers", color: "#0e74b4", type: "Étranger" },
    { label: "Acolytes", color: "#950f13", type: "Acolyte" },
    { label: "Demons", color: "#950f13", type: "Démon" },
  ];

  const maxParType = tableRepartition[nbJoueurs];

  // For custom script, show only the custom pool as available roles; otherwise, filter by edition
  const rolesFiltres =
    edition === "script personnalisé"
      ? customScriptPool
      : roles.filter(
          (r) =>
            r.edition === edition &&
            (!rolesValides || selected.some((sel) => sel.nom === r.nom))
        );

  const rolesEdition = roles.filter((r) => r.edition === edition);

  const compteParType = selected.reduce((acc, role) => {
    acc[role.type] = (acc[role.type] || 0) + 1;
    return acc;
  }, {});

  function toggleRole(role) {
    if (rolesValides) return;
    const estDejaSelectionne = selected.find((r) => r.nom === role.nom);
    if (estDejaSelectionne) {
      setSelected((prev) => prev.filter((r) => r.nom !== role.nom));
    } else {
      // Only enforce the Demon cap
      if (role.type === "Démon") {
        const max = maxParType.Demons;
        const dejaPris = selected.filter((r) => r.type === "Démon").length;
        if (dejaPris < max) {
          setSelected((prev) => [...prev, role]);
        }
      } else {
        // No cap for other types, just add if total < nbJoueurs
        if (selected.length < nbJoueurs) {
          setSelected((prev) => [...prev, role]);
        }
      }
    }
  }

  function tirerAuHasard() {
    if (rolesValides) return;
    const nouvelleSelection = [];

    lignes.forEach(({ type }) => {
      const max =
        type === "Habitant"
          ? maxParType.Habitants
          : type === "Étranger"
          ? maxParType.Étrangers
          : type === "Acolyte"
          ? maxParType.Acolytes
          : maxParType.Demons;

      const rolesDuType = rolesFiltres.filter((r) => r.type === type);
      const rolesMelanges = [...rolesDuType].sort(() => Math.random() - 0.5);
      nouvelleSelection.push(...rolesMelanges.slice(0, max));
    });

    setSelected(nouvelleSelection);
  }

  // reinitialiserTableau removed
  function deselectionnerTousLesRoles() {
    if (rolesValides) return;
    setSelected([]);
  }

  function handleChoixNumero(index) {
    if (joueursAttribues[index] || rolesRestants.length === 0) return;

    const indexAleatoire = Math.floor(Math.random() * rolesRestants.length);
    const roleTire = rolesRestants[indexAleatoire];

    const nouveauxRestants = [...rolesRestants];
    nouveauxRestants.splice(indexAleatoire, 1);
    setRolesRestants(nouveauxRestants);

    setIndexActif(index);
    setRoleActif(roleTire);
    setNomTemporaire("");
  }

  function validerJoueur() {
    if (indexActif === null || !nomTemporaire.trim() || !roleActif) return;
    setJoueursAttribues((prev) => ({
      ...prev,
      [indexActif]: { nom: nomTemporaire.trim(), role: roleActif },
    }));
    setIndexActif(null);
    setNomTemporaire("");
    setRoleActif(null);
  }

  function quitterAffectation() {
    setIndexActif(null);
    setNomTemporaire("");
    setAffectationVisible(false);
  }

  const nomsRolesAttribues = Object.values(joueursAttribues).map(
    (j) => j.role.nom
  );

  // Show all 'Bon' roles from the edition or script that are NOT attributed to players (not in joueursAttribues)
  const rolesBonsNonAttribués = (edition === "script personnalisé" ? customScriptPool : roles.filter(r => r.edition === edition))
    .filter((r) => r.alignement === "Bon" && !nomsRolesAttribues.includes(r.nom));

  return (
    <div style={{ padding: "2rem" }}>
      <h1
        style={{
          fontFamily: "'Pirata One', cursive",
          fontSize: "2.5rem",
          marginBottom: "1.5rem",
          textAlign: "left",
          marginLeft: "2rem",
        }}
      >
        Grimoire de poche
      </h1>

      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <label
          style={{ display: "inline-flex", alignItems: "center", gap: "1rem" }}
        >
          Nombre de joueurs :
          <select
            value={nbJoueurs}
            onChange={(e) => setNbJoueurs(Number(e.target.value))}
            disabled={rolesValides}
            style={{
              marginLeft: "0.5rem",
              fontSize: "1rem",
              fontFamily: "Cardo, serif",
            }}
          >
            {Array.from({ length: 11 }, (_, i) => i + 5).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label
          style={{ display: "inline-flex", alignItems: "center", gap: "1rem" }}
        >
          Édition :
          <select
            value={edition}
            onChange={(e) => setEdition(e.target.value)}
            disabled={rolesValides}
            style={{ marginLeft: "0.5rem" }}
          >
            {[...new Set(roles.map((r) => r.edition))].map((ed) => (
              <option key={ed} value={ed}>
                {ed}
              </option>
            ))}
            <option value="script personnalisé">Script personnalisé</option>
          </select>
          {edition === "script personnalisé" && (
            <button
              type="button"
              onClick={() => {
                setCustomScriptVisible(true);
                if (customScriptPool.length > 0 && customScriptTemp.length === 0) {
                  setCustomScriptTemp(customScriptPool);
                }
              }}
              disabled={rolesValides}
              style={{
                ...buttonStyle,
                marginLeft: "1rem",
                cursor: rolesValides ? "not-allowed" : "pointer",
                opacity: rolesValides ? 0.5 : 1
              }}
            >
              Choisir les rôles
            </button>
          )}
        </label>
      {customScriptVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(60,60,60,0.95)",
            color: "white",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => {
              setCustomScriptVisible(false);
              // Do not clear customScriptTemp here, so selection is preserved
            }}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              fontSize: "2rem",
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✖
          </button>
          <h2 style={{ fontFamily: "Cardo, serif", fontSize: "2rem", marginBottom: "1.5rem" }}>
            Script personnalisé : Choisissez les rôles
          </h2>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%"
          }}>
            <button
              onClick={() => setCustomScriptTemp([])}
              style={{
                ...buttonStyle,
                marginBottom: "1rem"
              }}
            >
              Tout effacer
            </button>
            <div style={{
              maxWidth: "90vw",
              maxHeight: "60vh",
              overflowY: "auto",
              background: "#222",
              borderRadius: 8,
              padding: "1rem"
            }}>
              {['Habitant', 'Étranger', 'Acolyte', 'Démon'].map((type) => {
                const rolesOfType = roles.filter((r) => r.type === type);
                const selectedOfType = customScriptTemp.filter((r) => r.type === type).length;
                if (rolesOfType.length === 0) return null;
                return (
                  <div key={type} style={{ marginBottom: '2rem' }}>
                    <div style={{
                      fontFamily: "Cardo, serif",
                      fontSize: "1.2rem",
                      color: type === 'Démon' || type === 'Acolyte' ? '#950f13' : '#0e74b4',
                      marginBottom: '0.5rem',
                      marginTop: '1rem',
                    }}>{type + (type === 'Habitant' ? 's' : type === 'Étranger' ? 's' : type === 'Acolyte' ? 's' : 's')} {selectedOfType > 0 ? `(${selectedOfType})` : ''}</div>
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}>
                      {rolesOfType.map((role) => {
                        const isSelected = customScriptTemp.some((r) => r.nom === role.nom);
                        return (
                          <div
                            key={role.nom}
                            onClick={() => {
                              if (isSelected) {
                                setCustomScriptTemp(customScriptTemp.filter((r) => r.nom !== role.nom));
                              } else {
                                setCustomScriptTemp([...customScriptTemp, role]);
                              }
                            }}
                            style={{
                              border: isSelected ? "2px solid #0e74b4" : "1px solid #ccc",
                              borderRadius: 8,
                              padding: "0.5rem",
                              cursor: "pointer",
                              opacity: isSelected ? 1 : 0.8,
                              background: isSelected ? "#e6f0fa" : "#333",
                              width: 180,
                              textAlign: "center",
                            }}
                          >
                            <img
                              src={`icons/icon_${normalizeNom(role.nom)}.png`}
                              alt={role.nom}
                              style={{ width: 48, height: 48, objectFit: "contain" }}
                            />
                            <div
                              style={{
                                fontFamily: "Cardo, serif",
                                fontWeight: "bold",
                                marginTop: 8,
                                color: isSelected ? "#0e74b4" : "#fff"
                              }}
                            >
                              {role.nom}
                            </div>
                            <div style={{ fontSize: "0.9rem", color: "#ccc" }}>{role.edition}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => {
              setCustomScriptPool(customScriptTemp);
              setCustomScriptVisible(false);
              setCustomScriptTemp([]);
              setSelected([]); // clear current selection for new pool
              setRolesValides(false);
              setEdition("script personnalisé");
            }}
            style={{
              ...buttonStyle,
              marginTop: "2rem",
              fontSize: "1.1rem"
            }}
          >
            Valider la sélection ({customScriptTemp.length} rôles)
          </button>
        </div>
      )}

        <button
          onClick={() => setQrCodeVisible(true)}
          style={{
            ...buttonStyle,
            cursor: customScriptPool.length === 0 && edition === "script personnalisé" ? "not-allowed" : "pointer",
            opacity: customScriptPool.length === 0 && edition === "script personnalisé" ? 0.5 : 1
          }}
          disabled={customScriptPool.length === 0 && edition === "script personnalisé"}
        >
          Partager le script
        </button>
      </div>
      <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
        <table
          style={{ borderCollapse: "collapse", fontFamily: "Cardo, serif" }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Joueurs
              </th>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "0.5rem",
                }}
              >
                {nbJoueurs}
              </th>
            </tr>
          </thead>
          <tbody>
            {lignes.map(({ label, color, type }) => (
              <tr key={label}>
                <td
                  style={{ border: "1px solid #ccc", padding: "0.5rem", color }}
                >
                  {label}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "0.25rem",
                  }}
                >
                  <span
                    style={{
                      width: "3rem",
                      textAlign: "center",
                      display: "inline-block",
                      color,
                      fontWeight: "bold",
                      fontFamily: "Cardo, serif",
                      fontSize: "1rem",
                    }}
                  >
                    {tableRepartition[nbJoueurs]?.[label] ?? 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => setAfficherRoles((prev) => !prev)}
        style={{
          ...buttonStyle,
          marginBottom: "1rem"
        }}
      >
        {afficherRoles ? "Masquer les rôles" : "Afficher les rôles"}
      </button>
      <button
        onClick={tirerAuHasard}
        disabled={rolesValides}
        style={{
          ...buttonStyle,
          marginBottom: "1rem",
          cursor: rolesValides ? "not-allowed" : "pointer",
          opacity: rolesValides ? 0.5 : 1
        }}
      >
        Sélection aléatoire
      </button>
      <button
        onClick={deselectionnerTousLesRoles}
        disabled={rolesValides || selected.length === 0}
        style={{
          ...buttonStyle,
          marginBottom: "1rem",
          cursor: rolesValides ? "not-allowed" : "pointer",
          opacity: rolesValides || selected.length === 0 ? 0.5 : 1
        }}
      >
        Désélectionner tous les rôles
      </button>

      <button
        onClick={() => {
          if (selected.length < nbJoueurs) {
            setErreurValidation(
              `Il faut sélectionner ${nbJoueurs} rôles (actuellement ${selected.length}).`
            );
          } else if (selected.length > nbJoueurs) {
            setErreurValidation(
              `Il faut sélectionner ${nbJoueurs} rôles (actuellement ${selected.length}).`
            );
          } else {
            // Compute repartition from selected roles
            const repartition = {
              Habitants: 0,
              Étrangers: 0,
              Acolytes: 0,
              Demons: 0,
            };
            selected.forEach((r) => {
              if (r.type === "Habitant") repartition.Habitants++;
              else if (r.type === "Étranger") repartition["Étrangers"]++;
              else if (r.type === "Acolyte") repartition.Acolytes++;
              else if (r.type === "Démon") repartition.Demons++;
            });
            setTableRepartition((prev) => ({
              ...prev,
              [nbJoueurs]: { ...repartition },
            }));
            setRolesValides(true);
            setErreurValidation("");
            setRolesRestants([...selected]);
          }
        }}
        disabled={rolesValides}
        style={{
          ...buttonStyle,
          marginBottom: "1rem",
          cursor: rolesValides ? "default" : "pointer",
          opacity: rolesValides ? 0.5 : 1
        }}
      >
        Valider les rôles
      </button>
      {erreurValidation && (
        <div
          style={{
            color: "#950f13",
            marginBottom: "1rem",
            fontFamily: "Cardo, serif",
          }}
        >
          {erreurValidation}
        </div>
      )}

      {afficherRoles &&
        lignes.map(({ type, label }) => {
          // After validation, only show roles that are in play (selected)
          const sourceRoles = rolesValides ? selected : rolesFiltres;
          const rolesDuType = sourceRoles.filter((r) => r.type === type);
          if (rolesDuType.length === 0) return null;

          const count = compteParType[type] || 0;
          const max =
            type === "Habitant"
              ? maxParType.Habitants
              : type === "Étranger"
              ? maxParType.Étrangers
              : type === "Acolyte"
              ? maxParType.Acolytes
              : maxParType.Demons;

          return (
            <div key={type} style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontFamily: "Cardo, serif", fontSize: "1.5rem" }}>
                {label} ({count}/{max})
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                {rolesDuType.map((role) => {
                  const isSelected = selected.some((r) => r.nom === role.nom);
                  const isDemon = role.type === "Démon";
                  const demonCount = selected.filter(
                    (r) => r.type === "Démon"
                  ).length;
                  const isDisabled = isSelected
                    ? false
                    : isDemon
                    ? demonCount >= maxParType.Demons ||
                      selected.length >= nbJoueurs
                    : selected.length >= nbJoueurs;

                  return (
                    <div
                      key={role.nom}
                      onClick={() => {
                        if (rolesValides || isDisabled) return;
                        toggleRole(role);
                      }}
                      style={{
                        border: isSelected
                          ? role.alignement === "Bon"
                            ? "2px solid #0e74b4"
                            : "2px solid #950f13"
                          : "1px solid #ccc",
                        borderRadius: 8,
                        padding: "0.5rem",
                        cursor:
                          isDisabled || rolesValides
                            ? "not-allowed"
                            : "pointer",
                        opacity: isDisabled ? 0.5 : 1,
                        background: isSelected
                          ? role.alignement === "Bon"
                            ? "#e6f0fa"
                            : "#fae6e6"
                          : "#fafafa",
                        width: 220,
                        minHeight: 90,
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={`icons/icon_${normalizeNom(role.nom)}.png`}
                        alt={role.nom}
                        style={{ height: 48, width: 48, objectFit: "contain" }}
                      />
                      <div
                        style={{
                          fontFamily: "'IM Fell English SC', serif",
                          fontSize: "1.1rem",
                          color:
                            role.alignement === "Bon" ? "#0e74b4" : "#950f13",
                          fontWeight: "bold",
                          marginTop: 8,
                        }}
                      >
                        {role.nom}
                      </div>
                      <div
                        style={{
                          fontFamily: "Cardo, serif",
                          fontSize: "0.95rem",
                          maxWidth: "30ch",
                          marginTop: 4,
                        }}
                      >
                        {role.pouvoir}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      {rolesValides && !affectationVisible && (
        <button
          onClick={() => setAffectationVisible(true)}
          disabled={Object.keys(joueursAttribues).length === nbJoueurs}
          style={{
            ...buttonStyle,
            cursor: Object.keys(joueursAttribues).length === nbJoueurs ? "not-allowed" : "pointer",
            opacity: Object.keys(joueursAttribues).length === nbJoueurs ? 0.5 : 1
          }}
        >
          Attribuer les rôles
        </button>
      )}
      {rolesValides && (
        <div style={{ marginBottom: "2rem" }}>
          <button
            onClick={() => setAfficherOrdreReveil((prev) => !prev)}
            style={{
              ...buttonStyle,
              marginBottom: "1rem"
            }}
          >
            {afficherOrdreReveil
              ? "Masquer l'ordre de réveil"
              : "Afficher l'ordre de réveil"}
          </button>

          {afficherOrdreReveil && (
            <>
              <button
                onClick={() =>
                  setOrdreNuitActuelle((prev) =>
                    prev === "premiere" ? "autres" : "premiere"
                  )
                }
                style={{
                  ...buttonStyle,
                  marginBottom: "1rem"
                }}
              >
                {ordreNuitActuelle === "premiere"
                  ? "Voir l'ordre des autres nuits"
                  : "Voir l'ordre de la première nuit"}
              </button>

              <div>
                <h2 style={{ fontFamily: "Cardo, serif", fontSize: "1.5rem" }}>
                  Ordre de réveil –{" "}
                  {ordreNuitActuelle === "premiere"
                    ? "Première nuit"
                    : "Autres nuits"}
                </h2>
                {selected
                  .filter((r) =>
                    ordreNuitActuelle === "premiere"
                      ? typeof r.ordrePremiereNuit === "number"
                      : typeof r.ordreAutresNuits === "number"
                  )
                  .sort((a, b) =>
                    ordreNuitActuelle === "premiere"
                      ? a.ordrePremiereNuit - b.ordrePremiereNuit
                      : a.ordreAutresNuits - b.ordreAutresNuits
                  )
                  .map((role) => (
                    <div
                      key={role.nom}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <img
                        src={`icons/icon_${normalizeNom(role.nom)}.png`}
                        alt={role.nom}
                        style={{
                          height: "32px",
                          width: "32px",
                          objectFit: "contain",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "Cardo, serif",
                          fontSize: "1.2rem",
                        }}
                      >
                        {role.nom}
                      </span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}
      {affectationVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "grey",
            color: "white",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={quitterAffectation}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              fontSize: "1.5rem",
            }}
          >
            ✖
          </button>

          {indexActif === null && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 80px)",
                gap: "1rem",
              }}
            >
              {Array.from({ length: nbJoueurs }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleChoixNumero(i)}
                  disabled={joueursAttribues[i] || rolesRestants.length === 0}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    fontSize: "1.5rem",
                    backgroundColor: joueursAttribues[i] ? "#aaa" : "#f5f0e6",
                    border: "1px solid #ccc",
                    cursor: joueursAttribues[i] ? "default" : "pointer",
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {indexActif !== null && roleActif && (
            <div style={{ textAlign: "center" }}>
              <img
                src={`icons/icon_${normalizeNom(roleActif.nom)}.png`}
                alt={roleActif.nom}
                style={{ width: "100px", marginBottom: "1rem" }}
              />
              <div style={{ fontSize: "1.5rem", fontFamily: "Cardo" }}>
                {roleActif.nom}
              </div>
              <div
                style={{
                  fontSize: "1rem",
                  fontFamily: "Cardo",
                  maxWidth: "50ch",
                  margin: "1rem auto",
                }}
              >
                {roleActif.pouvoir}
              </div>
              <input
                type="text"
                placeholder="Nom du joueur"
                value={nomTemporaire}
                onChange={(e) => setNomTemporaire(e.target.value)}
                style={{ padding: "0.5rem", fontSize: "1rem" }}
              />
              <div>
                <button
                  onClick={validerJoueur}
                  style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    fontFamily: "Cardo",
                  }}
                >
                  Valider
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {Object.keys(joueursAttribues).length === nbJoueurs && (
        <>
          <button
            onClick={() => setAfficherRepartition((prev) => !prev)}
            style={{
              ...buttonStyle,
              marginTop: "2rem"
            }}
          >
            {afficherRepartition
              ? "Masquer la répartition"
              : "Voir la répartition"}
          </button>

          {afficherRepartition && (
            <div
              style={{
                marginTop: "1rem",
                backgroundColor: "white",
                color: "black",
                padding: "1rem",
                borderRadius: "8px",
              }}
            >
              {Object.entries(joueursAttribues).map(
                ([index, { nom, role }]) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        minWidth: "100px",
                        fontFamily: "Cardo, serif",
                        fontWeight: "bold",
                      }}
                    >
                      {nom}
                    </div>
                    <img
                      src={`icons/icon_${normalizeNom(role.nom)}.png`}
                      alt={role.nom}
                      style={{
                        height: "32px",
                        width: "32px",
                        objectFit: "contain",
                      }}
                    />
                    <div style={{ fontFamily: "Cardo, serif" }}>{role.nom}</div>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}

      {qrCodeVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "grey",
            color: "white",
            zIndex: 15,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setQrCodeVisible(false)}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              fontSize: "1.5rem",
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✖
          </button>

          <h2
            style={{
              fontFamily: "Cardo",
              fontSize: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            Liste des rôles pour : {edition}
          </h2>

          <QRCode
            value={
              edition === "script personnalisé"
                ? (customScriptPool.length > 0
                    ? `${window.location.origin}/minuit-sonne-rouge/QRCodePage.html?custom=${encodeURIComponent(customScriptPool.map(r => r.nom).join(","))}`
                    : window.location.origin + "/minuit-sonne-rouge/")
                : urlPDF[edition]
                  ? window.location.origin + "/minuit-sonne-rouge/" + urlPDF[edition]
                  : window.location.origin + "/minuit-sonne-rouge/"
            }
            size={256}
            bgColor="#ffffff"
            fgColor="#000000"
          />
          {/* Show 'Afficher le script' for custom script, 'Voir PDF' for standard editions */}
          {edition === "script personnalisé" && customScriptPool.length > 0 && (
            <button
              style={{
                marginTop: "1.5rem",
                padding: "0.5rem 1.5rem",
                fontFamily: "Cardo, serif",
                fontSize: "1.1rem",
                cursor: "pointer",
                background: "#fff",
                color: "#222",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
              onClick={() =>
                window.open(
                  `${window.location.origin}/minuit-sonne-rouge/QRCodePage.html?custom=${encodeURIComponent(customScriptPool.map(r => r.nom).join(","))}`,
                  "_blank"
                )
              }
            >
              Afficher la liste
            </button>
          )}
          {edition !== "script personnalisé" && urlPDF[edition] && (
            <button
              style={{
                marginTop: "1.5rem",
                padding: "0.5rem 1.5rem",
                fontFamily: "Cardo, serif",
                fontSize: "1.1rem",
                cursor: "pointer",
                background: "#fff",
                color: "#222",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
              onClick={() =>
                window.open(
                  window.location.origin +
                    "/minuit-sonne-rouge/" +
                    urlPDF[edition],
                  "_blank"
                )
              }
            >
              Afficher la liste
            </button>
          )}
        </div>
      )}
      {Object.keys(joueursAttribues).length === nbJoueurs && !bluffsValides && (
        <button
          onClick={() => {
            setChoisirBluffsVisible((prev) => !prev);
            setErreurBluffs("");
          }}
          style={{
            ...buttonStyle,
            marginTop: "1rem"
          }}
          disabled={bluffsValides}
        >
          {choisirBluffsVisible ? "Masquer les bluffs" : "Choisir bluffs"}
        </button>
      )}
      {choisirBluffsVisible && !bluffsValides && (
        <div
          style={{
            margin: "1rem 0",
            background: "#fff",
            borderRadius: 8,
            padding: "1rem",
          }}
        >
          <h2 style={{ fontFamily: "Cardo, serif" }}>
            Sélectionne 3 rôles de bluff :
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {rolesBonsNonAttribués.map((role) => {
              const isSelected = bluffs.some((r) => r.nom === role.nom);
              const isDisabled = !isSelected && bluffs.length >= 3;
              return (
                <div
                  key={role.nom}
                  onClick={() => {
                    if (isSelected) {
                      setBluffs(bluffs.filter((r) => r.nom !== role.nom));
                    } else if (!isDisabled) {
                      setBluffs([...bluffs, role]);
                    }
                    setErreurBluffs("");
                  }}
                  style={{
                    border: isSelected ? "2px solid #0e74b4" : "1px solid #ccc",
                    borderRadius: 8,
                    padding: "0.5rem",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.5 : 1,
                    background: isSelected ? "#e6f0fa" : "#fafafa",
                    width: 180,
                    textAlign: "center",
                  }}
                >
                  <img
                    src={`icons/icon_${normalizeNom(role.nom)}.png`}
                    alt={role.nom}
                    style={{ width: 48, height: 48, objectFit: "contain" }}
                  />
                  <div
                    style={{
                      fontFamily: "Cardo, serif",
                      fontWeight: "bold",
                      marginTop: 8,
                    }}
                  >
                    {role.nom}
                  </div>
                </div>
              );
            })}
          </div>
          {erreurBluffs && (
            <div
              style={{
                color: "#950f13",
                margin: "1rem 0",
                fontFamily: "Cardo, serif",
              }}
            >
              {erreurBluffs}
            </div>
          )}
          <button
            onClick={() => {
              if (bluffs.length !== 3) {
                setErreurBluffs(
                  "Il faut sélectionner exactement 3 rôles de bluff."
                );
              } else {
                setBluffsValides(true);
                setChoisirBluffsVisible(false);
              }
            }}
            style={{
              ...buttonStyle,
              marginTop: "1rem",
              cursor: bluffs.length === 3 ? "pointer" : "not-allowed",
              opacity: bluffs.length === 3 ? 1 : 0.5
            }}
            disabled={bluffs.length !== 3}
          >
            Valider bluffs
          </button>
        </div>
      )}
      {bluffsValides && (
        <button
          onClick={() => setAfficherBluffs(true)}
          style={{
            ...buttonStyle,
            marginTop: "1rem"
          }}
        >
          Montrer les bluffs
        </button>
      )}
      {afficherBluffs && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "grey",
            color: "white",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setAfficherBluffs(false)}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              fontSize: "2rem",
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✖
          </button>
          <h2
            style={{
              fontFamily: "Cardo, serif",
              fontSize: "2rem",
              marginBottom: "2rem",
            }}
          >
            Ces rôles ne sont pas en jeu
          </h2>
          <div style={{ display: "flex", gap: "2rem" }}>
            {bluffs.map((role) => (
              <div key={role.nom} style={{ textAlign: "center" }}>
                <img
                  src={`icons/icon_${normalizeNom(role.nom)}.png`}
                  alt={role.nom}
                  style={{ width: 80, height: 80, objectFit: "contain" }}
                />
                <div
                  style={{
                    fontFamily: "Cardo, serif",
                    fontWeight: "bold",
                    marginTop: 8,
                  }}
                >
                  {role.nom}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {afficherNotes && (
        <div style={{ margin: "1rem 0" }}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            style={{
              width: "100%",
              fontFamily: "Cardo, serif",
              fontSize: "1rem",
              borderRadius: 8,
              border: "1px solid #ccc",
              padding: "1rem",
              resize: "vertical",
              background: "#fffbe6",
            }}
          />
        </div>
      )}
      <button
        onClick={() => setAfficherNotes((prev) => !prev)}
        style={{
          ...buttonStyle,
          marginTop: "2rem"
        }}
      >
        {afficherNotes ? "Masquer les notes" : "Afficher les notes"}
      </button>
    </div>
  );
}
