// ...existing imports and code...
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

function getRoleIcon(role) {
  const fileName = `icon_${normalizeNom(role.nom)}.png`;
  return `icons/${fileName}`;
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
  const [jetonsInfoVisible, setJetonsInfoVisible] = useState(false);
  const [jetonInfoPage, setJetonInfoPage] = useState(null);

  const jetonsInfoButtons = [
    {
      label: "Voici le démon",
      color: "#d46a6a",
      page: "demon",
      content: "Voici le démon",
      textColor: "#900",
    },
    {
      label: "Voici tes acolytes",
      color: "#d46a6a",
      page: "acolytes",
      content: "Voici tes acolytes",
      textColor: "#900",
    },
    {
      label: "Bluffs du démon",
      color: "#7db3e6",
      page: "not-in-game",
      content: "Ces rôles ne sont pas en jeu",
      textColor: "#234",
    },
    {
      label: "Ce rôle t'a sélectionné",
      color: "#6ab46a",
      page: "selected-by",
      content: "Ce rôle t'a sélectionné",
      textColor: "#234",
    },
    {
      label: "Ce joueur est",
      color: "#e67db3",
      page: "player-is",
      content: "Ce joueur est",
      textColor: "#234",
    },
    {
      label: "Tu es",
      color: "#a37de6",
      page: "you-are",
      content: "Tu es",
      textColor: "#234",
    },
    {
      label: "Veux-tu utiliser ton pouvoir ?",
      color: "#b48a3c",
      page: "use-power",
      content: "Veux-tu utiliser ton pouvoir?",
      textColor: "#234",
    },
    {
      label: "Fais un choix",
      color: "#b48a3c",
      page: "make-choice",
      content: "Fais un choix",
      textColor: "#234",
    },
    {
      label: "As-tu voté aujourd'hui ?",
      color: "#e6c07d",
      page: "voted-today",
      content: "As-tu voté aujourd'hui ?",
      textColor: "#234",
    },
    {
      label: "As-tu nominé quelqu'un aujourd'hui ?",
      color: "#e6c07d",
      page: "named-today",
      content: "As-tu nominé quelqu'un aujourd'hui ?",
      textColor: "#234",
    },
  ];

  const [customJetons, setCustomJetons] = useState([]);
  const [addCustomJetonVisible, setAddCustomJetonVisible] = useState(false);
  const [customJetonText, setCustomJetonText] = useState("");
  const [editBluffsModal, setEditBluffsModal] = useState(false);
  const [editBluffsTemp, setEditBluffsTemp] = useState([]);

  // Remove a custom jeton by index
  function removeCustomJeton(index) {
    setCustomJetons((prev) => prev.filter((_, i) => i !== index));
  }

  const [rolesDisponiblesPourRemplacer, setRolesDisponiblesPourRemplacer] =
    useState([]);
  const [rolesRestantsInitial, setRolesRestantsInitial] = useState([]);
  const [nomEditModal, setNomEditModal] = useState(null);
  const [showRemplacerDropdown, setShowRemplacerDropdown] = useState(false);
  const [remplacerRole, setRemplacerRole] = useState(null);
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
  // Add missing state for roles modal
  // State for rappel dropdown and selected rappel role in name edit modal
  const [showRappelModal, setShowRappelModal] = useState(false);
  // Store multiple rappel roles as an array
  const [rappelRolesSelected, setRappelRolesSelected] = useState([]);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
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
  const [customScriptPool, setCustomScriptPool] = useState([]);
  const [customScriptTemp, setCustomScriptTemp] = useState([]);

  // Ensure customScriptTemp is always initialized from validated pool when opening modal
  useEffect(() => {
    if (customScriptVisible) {
      setCustomScriptTemp(customScriptPool);
    }
  }, [customScriptVisible]);
  const [afficherGrimoire, setAfficherGrimoire] = useState(false);

  const urlPDF = {
    "Sombre présage": "docs/minuitsonnerouge-sombrepresage.pdf",
    "Parfums d’hystérie": "docs/minuitsonnerouge-parfumsdhysterie.pdf",
    "Crépuscule funeste": "docs/minuitsonnerouge-crepusculefuneste.pdf",
  };

  useEffect(() => {
    setSelected([]);
    setErreurValidation("");
    if (edition === "Script personnalisé") {
      setCustomScriptVisible(true);
    } else {
      setCustomScriptVisible(false);
      setCustomScriptTemp([]); 
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


  const rolesFiltres =
    edition === "Script personnalisé"
      ? customScriptPool
      : roles.filter((r) => r.edition === edition);

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

  function handleResetRoles() {
    setSelected([]);
    setRolesValides(false);
    setErreurValidation("");
    setAfficherRoles(true);
    setBluffs([]);
    setBluffsValides(false);
    setChoisirBluffsVisible(false);
    setAffectationVisible(false);
    setJoueursAttribues({});
    setAfficherRepartition(false);
    setAfficherOrdreReveil(false);
    setNomEditModal(null);
    setEditBluffsModal(false);
    setEditBluffsTemp([]);
    setCustomScriptVisible(false);
    setCustomScriptTemp([]);
    setCustomJetons([]);
    setNotes("");
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

  function deselectionnerTousLesRoles() {
    if (rolesValides) return;
    setSelected([]);
  }

  function handleChoixNumero(index) {
    if (joueursAttribues[index] || rolesRestants.length === 0) return;

    const assignedRoleNames = Object.values(joueursAttribues).map(
      (j) => j.role.nom
    );
    const availableRoles = rolesRestants.filter(
      (r) => !assignedRoleNames.includes(r.nom)
    );
    if (availableRoles.length === 0) return;
    const indexAleatoire = Math.floor(Math.random() * availableRoles.length);
    const roleTire = availableRoles[indexAleatoire];

    setIndexActif(index);
    setRoleActif(roleTire);
    setNomTemporaire("");
  }

  function validerJoueur() {
    if (indexActif === null || !nomTemporaire.trim() || !roleActif) return;
    // Détermine l'alignement selon le type du rôle
    let alignementAuto = "Maléfique";
    if (roleActif.type === "Habitant" || roleActif.type === "Étranger") {
      alignementAuto = "Bon";
    }
    setJoueursAttribues((prev) => ({
      ...prev,
      [indexActif]: {
        nom: nomTemporaire.trim(),
        role: roleActif,
        alignement: alignementAuto,
        alignementFixe: false,
      },
    }));
    // On first validation, store the selected roles pour remplacement
    if (rolesDisponiblesPourRemplacer.length === 0 && selected.length > 0) {
      setRolesDisponiblesPourRemplacer(selected);
    }
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
  const rolesBonsNonAttribués = (
    edition === "Script personnalisé"
      ? customScriptPool
      : roles.filter((r) => r.edition === edition)
  ).filter(
    (r) => r.alignement === "Bon" && !nomsRolesAttribues.includes(r.nom)
  );

  function handleValiderRoles() {
    if (selected.length < nbJoueurs) {
      setErreurValidation(
        `Il faut sélectionner ${nbJoueurs} rôles (actuellement ${selected.length}).`
      );
      return;
    } else if (selected.length > nbJoueurs) {
      setErreurValidation(
        `Il faut sélectionner ${nbJoueurs} rôles (actuellement ${selected.length}).`
      );
      return;
    }
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
    // Stricter validation: check repartition matches number of players
    const totalRoles = Object.values(repartition).reduce((a, b) => a + b, 0);
    if (totalRoles !== nbJoueurs) {
      setErreurValidation(
        "La répartition des rôles ne correspond pas au nombre de joueurs."
      );
      return;
    }
    // setTableRepartition is disabled to keep the table static
    // setTableRepartition((prev) => ({
    //   ...prev,
    //   [nbJoueurs]: { ...repartition },
    // }));
    setRolesValides(true);
    setErreurValidation("");
    setRolesRestants([...selected]);
    setAfficherRoles(false); // Hide roles section automatically
    
  }

  return (
    
    <div style={{ padding: "2rem" }}>
<style>{`
  /* Unifie les triangles des sections repliables */
  details.collapsible > summary {
    font-family: 'Pirata One', cursive;
    font-weight: bold;
    font-size: 2rem;            /* même taille que Grimoire/Notes */
    cursor: pointer;
    display: flex;
    align-items: center;         /* alignement vertical */
    gap: .5rem;
    line-height: 1.2;
  }
  /* Equal vertical spacing between sections */
  details.collapsible {
    margin-bottom: 2.5rem !important;
  }
  /* Cache le triangle natif */
  details.collapsible > summary::-webkit-details-marker { display: none; }
  details.collapsible > summary::marker { content: ""; }

  /* Ajoute le même caret que Grimoire/Notes */
  details.collapsible > summary::before {
    content: "►";
    display: inline-block;
    width: 1.2em;               /* réserve la même place qu'un caractère */
    text-align: center;
    transform: translateY(1px); /* micro-ajustement baseline */
  }
  details.collapsible[open] > summary::before {
    content: "▼";
  }
  /* Caret span used in H1 toggles to match details summaries */
  .caret { display:inline-block; width:1.2em; text-align:center; transform:translateY(1px); user-select:none; }
`}</style>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "1.5rem",
          marginLeft: "2rem",
        }}
      >
        <span
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "2.5rem",
            color: "#950f13",
            marginRight: "12px",
            fontWeight: "bold",
            letterSpacing: "1px",
            whiteSpace: "nowrap",
          }}
        >
        Minuit sonne rouge
        </span>
        <img
          src={"icons/grimoire.png"}
          alt="Grimoire"
          style={{ height: "48px", marginRight: "12px" }}
        />
        <h1
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "2.5rem",
            margin: 0,
            textAlign: "left",
          }}
        >
          Grimoire de poche
        </h1>
      </div>

{/* === SETUP (collapsible) === */}
<details id="setup" className="collapsible" open style={{ marginBottom: "1.5rem" }}>
  <summary>Paramètres</summary>

  {/* --- Ligne d’options --- */}
  <div
    style={{
      marginTop: "1rem",
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "2rem",
    }}
  >
    <label style={{ display: "inline-flex", alignItems: "center", gap: "1rem" }}>
      Nombre de joueurs :
      <select
        value={nbJoueurs}
        onChange={(e) => setNbJoueurs(Number(e.target.value))}
        disabled={rolesValides}
        style={{ marginLeft: "0.5rem", fontSize: "1rem", fontFamily: "Cardo, serif" }}
      >
        {Array.from({ length: 11 }, (_, i) => i + 5).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </label>

    <label style={{ display: "inline-flex", alignItems: "center", gap: "1rem" }}>
      Édition :
      <select
        value={edition}
        onChange={(e) => setEdition(e.target.value)}
        disabled={rolesValides}
        style={{ marginLeft: "0.5rem" }}
      >
        {[...new Set(roles.map((r) => r.edition))].map((ed) => (
          <option key={ed} value={ed}>{ed}</option>
        ))}
        <option value="Script personnalisé">Script personnalisé</option>
      </select>

      {edition === "Script personnalisé" && (
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
            opacity: rolesValides ? 0.5 : 1,
          }}
        >
          Choisir les rôles
        </button>
      )}
    </label>

    <button
      onClick={() => setQrCodeVisible(true)}
      style={{
        ...buttonStyle,
        cursor:
          customScriptPool.length === 0 && edition === "Script personnalisé"
            ? "not-allowed"
            : "pointer",
        opacity:
          customScriptPool.length === 0 && edition === "Script personnalisé"
            ? 0.5
            : 1,
      }}
      disabled={customScriptPool.length === 0 && edition === "Script personnalisé"}
    >
      Partager le script
    </button>
  </div>

  {/* --- Tableau de répartition --- */}
  <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontFamily: "Cardo, serif" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Joueurs</th>
            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{nbJoueurs}</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map(({ label, color }) => (
            <tr key={label}>
              <td style={{ border: "1px solid #ccc", padding: "0.5rem", color }}>{label}</td>
              <td style={{ border: "1px solid #ccc", padding: "0.25rem" }}>
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

    {/* Bouton reset (croix rouge) si tu veux le conserver ici */}
    <button
      onClick={handleResetRoles}
      style={{ marginLeft: "1em", background: "none", border: "none", cursor: "pointer" }}
      title="Réinitialiser les rôles"
    >
      {/* (ton icône si besoin) */}
    </button>
  </div>
</details>


  <details className="collapsible" style={{ marginBottom: "1.5rem" }} open>
  <summary>Rôles</summary>
        <div style={{ marginTop: "1rem" }}>
          {!rolesValides && (
            <div style={{ display: "flex", flexDirection: "row", gap: "1rem", marginBottom: "1rem" }}>
              <button
                onClick={tirerAuHasard}
                style={{ ...buttonStyle }}
              >
                Sélection aléatoire
              </button>
              <button
                onClick={deselectionnerTousLesRoles}
                disabled={selected.length === 0}
                style={{ ...buttonStyle, opacity: selected.length === 0 ? 0.5 : 1 }}
              >
                Tout désélectionner
              </button>
              <button
                onClick={handleValiderRoles}
                style={{ ...buttonStyle }}
              >
                Valider les rôles
              </button>
            </div>
          )}
          {rolesValides && !affectationVisible && Object.keys(joueursAttribues).length < nbJoueurs && (
            <div style={{ display: "flex", flexDirection: "row", gap: "1rem", marginBottom: "1rem" }}>
              <button
                onClick={() => setAffectationVisible(true)}
                style={{ ...buttonStyle }}
              >
                Attribuer les rôles
              </button>
            </div>
          )}
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
          {/* ROLES DISPLAY BLOCK - restored to main return */}
          {lignes.map(({ type, label }) => {
            const rolesDuType = rolesFiltres.filter((r) => r.type === type);
            if (rolesDuType.length === 0) return null;
            // Count selected for this type
            const selectedCount = selected.filter((r) => r.type === type).length;
            // Get expected count from tableRepartition
            const expectedCount = maxParType[label];
            // Choose color for summary
            let summaryColor = "#222";
            if (type === "Habitant" || type === "Étranger") summaryColor = "#0e74b4";
            if (type === "Acolyte" || type === "Démon") summaryColor = "#950f13";
            return (
              <details key={type} style={{ marginBottom: "1rem" }} open>
                <summary style={{ fontWeight: "bold", fontSize: "1.2rem", cursor: "pointer", color: summaryColor }}>
                  {label} ({selectedCount}/{expectedCount})
                </summary>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {rolesDuType.map((role) => {
                    const isSelected = selected.some((r) => r.nom === role.nom);
                    const greyed = rolesValides && !isSelected;
                    const isDisabled = greyed;
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
              </details>
            );
          })}
        </div>
      </details>

     
      
      {rolesValides && (
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontFamily: "'Pirata One', cursive",
              fontSize: "2rem",
              color: "black",
              margin: 0,
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
              marginBottom: "0.5rem",
            }}
            onClick={() => setAfficherOrdreReveil((prev) => !prev)}
          >
            <span className="caret">{afficherOrdreReveil ? "▼" : "►"}</span><span>Ordre de réveil</span>
          </h1>
          {afficherOrdreReveil && (
            <>
              <div style={{ display: "flex", gap: 0, marginBottom: "1rem" }}>
                <button
                  onClick={() => setOrdreNuitActuelle("premiere")}
                  style={{
                    border: ordreNuitActuelle === "premiere" ? "2px solid #888" : "1px solid #ccc",
                    borderRadius: "8px 0 0 8px",
                    padding: "0.5rem 1.2rem",
                    cursor: "pointer",
                    background: ordreNuitActuelle === "premiere" ? "#e0e0e0" : "#fafafa",
                    color: ordreNuitActuelle === "premiere" ? "#222" : "#333",
                    fontWeight: "bold",
                    outline: "none",
                  }}
                >
                  Première nuit
                </button>
                <button
                  onClick={() => setOrdreNuitActuelle("autres")}
                  style={{
                    border: ordreNuitActuelle === "autres" ? "2px solid #888" : "1px solid #ccc",
                    borderRadius: "0 8px 8px 0",
                    padding: "0.5rem 1.2rem",
                    cursor: "pointer",
                    background: ordreNuitActuelle === "autres" ? "#e0e0e0" : "#fafafa",
                    color: ordreNuitActuelle === "autres" ? "#222" : "#333",
                    fontWeight: "bold",
                    outline: "none",
                  }}
                >
                  Autres nuits
                </button>
              </div>
              <div>
                <div
                  key="crepuscule"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <img
                    src={`icons/crepuscule.png`}
                    alt="crépuscule"
                    style={{
                      height: "36px",
                      width: "36px",
                      objectFit: "contain",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "Cardo, serif",
                      fontSize: "1.2rem",
                      color: "black",
                    }}
                  >
                    Crépuscule
                  </span>
                </div>
                {/* Philosophe (ordrePremiereNuit: 1) */}
                {ordreNuitActuelle === "premiere" &&
                  selected.some(
                    (r) =>
                      r.nom.toLowerCase() === "philosophe" &&
                      r.ordrePremiereNuit === 1
                  ) &&
                  selected
                    .filter(
                      (r) =>
                        r.nom.toLowerCase() === "philosophe" &&
                        r.ordrePremiereNuit === 1
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
                            height: "36px",
                            width: "36px",
                            objectFit: "contain",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "Cardo, serif",
                            fontSize: "1.2rem",
                            color:
                              role.alignement === "Bon" ? "#0e74b4" : "#950f13",
                          }}
                        >
                          {role.nom}
                        </span>
                      </div>
                    ))}
                {/* Réveil des acolytes (ordrePremiereNuit: 2) */}
                {ordreNuitActuelle === "premiere" && (
                  <div
                    key="acolyte"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <img
                      src={`icons/acolyte.png`}
                      alt="Réveil des acolytes"
                      style={{
                        height: "36px",
                        width: "36px",
                        objectFit: "contain",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "Cardo, serif",
                        fontSize: "1.2rem",
                        color: "#950f13",
                      }}
                    >
                      Réveil des acolytes
                    </span>
                  </div>
                )}
                {/* Lunatique (ordrePremiereNuit: 3) */}
                {ordreNuitActuelle === "premiere" &&
                  selected.some(
                    (r) =>
                      r.nom.toLowerCase() === "lunatique" &&
                      r.ordrePremiereNuit === 3
                  ) &&
                  selected
                    .filter(
                      (r) =>
                        r.nom.toLowerCase() === "lunatique" &&
                        r.ordrePremiereNuit === 3
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
                            height: "36px",
                            width: "36px",
                            objectFit: "contain",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "Cardo, serif",
                            fontSize: "1.2rem",
                            color:
                              role.alignement === "Bon" ? "#0e74b4" : "#950f13",
                          }}
                        >
                          {role.nom}
                        </span>
                      </div>
                    ))}
                {/* Réveil du démon et bluffs (ordrePremiereNuit: 4) - only show if no role has ordrePremiereNuit: 4, otherwise handled in roles loop */}
                {ordreNuitActuelle === "premiere" &&
                  !selected.some((r) => r.ordrePremiereNuit === 4) && (
                    <div
                      key="demon-bluffs"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <img
                        src={`icons/demon.png`}
                        alt="Réveil du démon et bluffs"
                        style={{
                          height: "36px",
                          width: "36px",
                          objectFit: "contain",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "Cardo, serif",
                          fontSize: "1.2rem",
                          color: "#950f13",
                        }}
                      >
                        Réveil du démon et bluffs
                      </span>
                    </div>
                  )}
                {/* Other roles, skipping 1-4 in premiere nuit. For autres nuits, do NOT show 'Réveil du démon et bluffs'.
                    If a role has ordrePremiereNuit: 4, render the demon-bluffs block in its place. */}
                {selected
                  .filter((r) =>
                    ordreNuitActuelle === "premiere"
                      ? typeof r.ordrePremiereNuit === "number" &&
                        r.ordrePremiereNuit > 4
                      : typeof r.ordreAutresNuits === "number" &&
                        r.nom.toLowerCase() !== "réveil du démon et bluffs" &&
                        r.nom.toLowerCase() !== "reveil du demon et bluffs"
                  )
                  .concat(
                    ordreNuitActuelle === "premiere"
                      ? selected
                          .filter(
                            (r) =>
                              r.ordrePremiereNuit === 4 &&
                              (r.nom.toLowerCase() ===
                                "réveil du démon et bluffs" ||
                                r.nom.toLowerCase() ===
                                  "reveil du demon et bluffs")
                          )
                          .map((r) => ({ ...r, isDemonBluffs: true }))
                      : []
                  )
                  .sort((a, b) =>
                    ordreNuitActuelle === "premiere"
                      ? a.ordrePremiereNuit - b.ordrePremiereNuit
                      : a.ordreAutresNuits - b.ordreAutresNuits
                  )
                  .map((role) =>
                    role.isDemonBluffs ? (
                      <div
                        key="demon-bluffs"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <img
                          src={`icons/demon.png`}
                          alt="Réveil du démon et bluffs"
                          style={{
                            height: "36px",
                            width: "36px",
                            objectFit: "contain",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "Cardo, serif",
                            fontSize: "1.2rem",
                            color: "#950f13",
                          }}
                        >
                          Réveil du démon et bluffs
                        </span>
                      </div>
                    ) : (
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
                            height: "36px",
                            width: "36px",
                            objectFit: "contain",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "Cardo, serif",
                            fontSize: "1.2rem",
                            color:
                              role.alignement === "Bon" ? "#0e74b4" : "#950f13",
                          }}
                        >
                          {role.nom}
                        </span>
                      </div>
                    )
                  )}
                {/* Always show Aube last */}
                <div
                  key="aube"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <img
                    src={`icons/aube.png`}
                    alt="Aube"
                    style={{
                      height: "36px",
                      width: "36px",
                      objectFit: "contain",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "Cardo, serif",
                      fontSize: "1.2rem",
                      color: "black",
                    }}
                  >
                    Aube
                  </span>
                </div>
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
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.5rem",
              }}
            >
              <button
                onClick={() => {
                  // Automatic attribution: assign all available roles to players named 'player 1', 'player 2', ...
                  const newAttribues = { ...joueursAttribues };
                  const assignedRoleNames = Object.values(newAttribues).map(
                    (j) => j.role.nom
                  );
                  const availableRoles = rolesRestants.filter(
                    (r) => !assignedRoleNames.includes(r.nom)
                  );
                  for (let i = 0; i < nbJoueurs; i++) {
                    if (!newAttribues[i] && availableRoles.length > 0) {
                      const roleAuto = availableRoles[0];
                      let alignementAuto = "Maléfique";
                      if (roleAuto.type === "Habitant" || roleAuto.type === "Étranger") {
                        alignementAuto = "Bon";
                      }
                      newAttribues[i] = {
                        nom: `player ${i + 1}`,
                        role: roleAuto,
                        alignement: alignementAuto,
                        alignementFixe: false,
                      };
                      availableRoles.shift();
                    }
                  }
                  setJoueursAttribues(newAttribues);
                }}
                style={{
                  marginBottom: "1rem",
                  padding: "0.7rem 2rem",
                  fontFamily: "Cardo, serif",
                  fontSize: "1.1rem",
                  background: "#0e74b4",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  opacity: rolesRestants.length === 0 ? 0.5 : 1,
                }}
                disabled={rolesRestants.length === 0}
              >
                Attribution automatique
              </button>
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
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {bluffs.length === 3
              ? rolesBonsNonAttribués
                  .filter(role => bluffs.some(b => b.nom === role.nom))
                  .map((role) => (
                    <img
                      key={role.nom}
                      src={`icons/icon_${normalizeNom(role.nom)}.png`}
                      alt={role.nom}
                      style={{
                        height: "48px",
                        width: "48px",
                        objectFit: "contain",
                        marginRight: "0.5rem",
                      }}
                    />
                  ))
              : null}
          </div>
        </div>
      )}
      {/* Grimoire section comes after bluffs */}
      {Object.keys(joueursAttribues).length === nbJoueurs && (
        <>
          <h1
            style={{
              fontFamily: "'Pirata One', cursive",
              fontSize: "2rem",
              color: "black",
              marginTop: "2rem",
              marginBottom: "0.5rem",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
             
            }}
            onClick={() => setAfficherRepartition((prev) => !prev)}
          >
            <span className="caret">{afficherRepartition ? "▼" : "►"}</span><span>Grimoire</span>
          </h1>

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
      {afficherRepartition && !bluffsValides && (
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            alignItems: "center",
            background: "#f8f8f8",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: "1rem",
            cursor: "pointer",
            border: "2px solid #e0e0e0",
            width: "fit-content",
            transition: "background 0.2s, transform 0.2s",
            opacity: bluffsValides ? 0.5 : 1,
          }}
          onClick={() => {
            setEditBluffsModal(true);
            setEditBluffsTemp(bluffs.length > 0 ? bluffs : []);
            setErreurBluffs("");
          }}
        >
          <div
            style={{
              fontFamily: "Cardo, serif",
              fontWeight: "bold",
              fontSize: "1.3rem",
              marginRight: "1.5rem",
              letterSpacing: "1px",
              color: "#950f13",
              minWidth: "140px",
              textAlign: "left",
            }}
          >
            Bluffs du démon
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {bluffs.length === 3
              ? rolesBonsNonAttribués
                  .filter(role => bluffs.some(b => b.nom === role.nom))
                  .map((role) => (
                    <img
                      key={role.nom}
                      src={`icons/icon_${normalizeNom(role.nom)}.png`}
                      alt={role.nom}
                      style={{
                        height: "48px",
                        width: "48px",
                        objectFit: "contain",
                      }}
                    />
                  ))
              : ([1,2,3].map((i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "2.8rem",
                      color: "#bbb",
                      fontWeight: "bold",
                      lineHeight: 1,
                      margin: "0 0.2rem"
                    }}
                  >
                    ?
                  </span>
                )))}
          </div>
        </div>
      )}
      {afficherRepartition && choisirBluffsVisible && !bluffsValides && (
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
              opacity: bluffs.length === 3 ? 1 : 0.5,
            }}
            disabled={bluffs.length !== 3}
          >
            Valider bluffs
          </button>
        </div>
      )}
              {Object.entries(joueursAttribues).map(
                ([index, joueur], idx) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      ...(idx === 0 ? { marginTop: "1rem" } : {}),
                      marginBottom: "1rem",
                      background: joueur.mort ? "#e0e0e0" : "#f8f8f8",
                      borderRadius: "16px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      padding: "1rem",
                      transition: "background 0.2s, transform 0.2s",
                      cursor: "pointer",
                      position: "relative",
                      border: "2px solid #e0e0e0",
                    }}
                    onClick={() => setNomEditModal({ index, nom: joueur.nom })}
                    onTouchStart={(e) =>
                      (e.currentTarget.style.background = joueur.mort
                        ? "#d0d0d0"
                        : "#e6f0fa")
                    }
                    onTouchEnd={(e) =>
                      (e.currentTarget.style.background = joueur.mort
                        ? "#e0e0e0"
                        : "#f8f8f8")
                    }
                    onMouseDown={(e) =>
                      (e.currentTarget.style.background = joueur.mort
                        ? "#d0d0d0"
                        : "#e6f0fa")
                    }
                    onMouseUp={(e) =>
                      (e.currentTarget.style.background = joueur.mort
                        ? "#e0e0e0"
                        : "#f8f8f8")
                    }
                  >
                    <img
                      src={`icons/icon_${normalizeNom(joueur.role.nom)}.png`}
                      alt={joueur.role.nom}
                      style={{
                        height: "48px",
                        width: "48px",
                        objectFit: "contain",
                        marginRight: "0.5rem",
                       // filter: joueur.mort ? "grayscale(1) brightness(1)" : "none",
                      }}
                    />
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            flex: 1,
                            fontFamily: "Cardo, serif",
                            fontWeight: "bold",
                            fontSize: "1.2rem",
                            color:
                              joueur.alignement === "Bon"
                                ? "#0e74b4"
                                : joueur.alignement === "Maléfique"
                                ? "#950f13"
                                : "#222",
                            padding: "0.5rem 0",
                            borderRadius: "8px",
                            textAlign: "left",
                            userSelect: "none",
                        //    textDecoration: joueur.mort ? "line-through" : "none",
                          }}
                        >
                          {joueur.nom}
                        </span>
                      {joueur.mort && (
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            fontSize: "1.3rem",
                            verticalAlign: "middle",
                          }}
                        >
                          <img
                            src="icons/mort.png"
                            alt="Mort icon"
                            style={{
                              width: 32,
                              height: 32,
                              verticalAlign: "middle",
                            }}
                          />
                        </span>
                      )}
                      {/* Vote icon after mort icon if mort is true */}
                      {joueur.mort && joueur.token && (
                        <span
                          style={{
                            marginLeft: "0.2rem",
                            fontSize: "1.3rem",
                            verticalAlign: "middle",
                          }}
                        >
                          <img
                            src="icons/vote.png"
                            alt="Vote icon"
                            style={{
                              width: 32,
                              height: 32,
                              verticalAlign: "middle",
                            }}
                          />
                        </span>
                      )}
                      {/* Rappel icons after mort and vote icons */}
                      {(Array.isArray(joueur.rappelRoles) ? joueur.rappelRoles : []).map(
                        (r, idx) => (
                          <span
                            key={r.nom}
                            style={{
                              marginLeft: idx === 0 ? "0.5rem" : "0.2rem",
                              fontSize: "1.3rem",
                              verticalAlign: "middle",
                            }}
                          >
                            <img
                              src={`icons/icon_${normalizeNom(r.nom)}.png`}
                              alt={r.nom}
                              style={{
                                width: 36,
                                height: 36,
                                verticalAlign: "middle",
                                objectFit: "contain",
                              }}
                            />
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
              {/* Bluffs du démon section */}
              {bluffsValides && bluffs.length === 3 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#f8f8f8",
                    borderRadius: "16px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    padding: "1rem",
                    cursor: "pointer",
                    border: "2px solid #e0e0e0",
                    width: "fit-content",
                    transition: "background 0.2s, transform 0.2s",
                  }}
                  onClick={() => setEditBluffsModal(true)}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.background = "#e6f0fa")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.background = "#f8f8f8")
                  }
                  onTouchStart={(e) =>
                    (e.currentTarget.style.background = "#e6f0fa")
                  }
                  onTouchEnd={(e) =>
                    (e.currentTarget.style.background = "#f8f8f8")
                  }
                >
                  <div
                    style={{
                      fontFamily: "Cardo, serif",
                      fontWeight: "bold",
                      fontSize: "1.3rem",
                      marginRight: "1.5rem",
                      letterSpacing: "1px",
                      color: "#950f13",
                      minWidth: "140px",
                      textAlign: "left",
                    }}
                  >
                    Bluffs du démon
                  </div>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    {bluffs.length === 3
                      ? rolesBonsNonAttribués
                          .filter(role => bluffs.some(b => b.nom === role.nom))
                          .map((role) => (
                            <img
                              key={role.nom}
                              src={`icons/icon_${normalizeNom(role.nom)}.png`}
                              alt={role.nom}
                              style={{
                                height: "48px",
                                width: "48px",
                                objectFit: "contain",
                              }}
                            />
                          ))
                      : null}
                  </div>
                </div>
              )}
              {/* Modal for editing bluffs */}
              {typeof setEditBluffsModal !== "undefined" && editBluffsModal && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      background: "white",
                      color: "black",
                      borderRadius: "10px",
                      padding: "2rem",
                      minWidth: "300px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      position: "relative",
                      maxWidth: "90vw",
                      width: "100%",
                    }}
                  >
                    <button
                      onClick={() => setEditBluffsModal(false)}
                      style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        fontSize: "1.5rem",
                        color: "#333",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      ✖
                    </button>
                    <div
                      style={{
                        fontFamily: "Cardo, serif",
                        fontWeight: "bold",
                        fontSize: "1.3rem",
                        marginBottom: "1rem",
                      }}
                    >
                      Modifier les bluffs du démon
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "1rem",
                        justifyContent: "center",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {rolesBonsNonAttribués.map((role) => {
                        const isSelected = editBluffsTemp.some(
                          (b) => b.nom === role.nom
                        );
                        const isDisabled =
                          !isSelected && editBluffsTemp.length >= 3;
                        return (
                          <button
                            key={role.nom}
                            style={{
                              border: isSelected
                                ? "2px solid #0e74b4"
                                : "1px solid #bbb",
                              borderRadius: "8px",
                              background: isSelected ? "#e6f0fa" : "#f5f5f5",
                              color: "#222",
                              padding: "0.5rem",
                              cursor: isDisabled ? "not-allowed" : "pointer",
                              opacity: isDisabled ? 0.5 : 1,
                              width: "100px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                            onClick={() => {
                              if (isSelected) {
                                setEditBluffsTemp(
                                  editBluffsTemp.filter(
                                    (b) => b.nom !== role.nom
                                  )
                                );
                              } else if (!isDisabled) {
                                setEditBluffsTemp([...editBluffsTemp, role]);
                              }
                            }}
                          >
                            <img
                              src={`icons/icon_${normalizeNom(role.nom)}.png`}
                              alt={role.nom}
                              style={{
                                height: "32px",
                                width: "32px",
                                objectFit: "contain",
                                marginBottom: "0.3rem",
                              }}
                            />
                            <span
                              style={{
                                fontSize: "0.95rem",
                                fontFamily: "Cardo, serif",
                              }}
                            >
                              {role.nom}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => {
                        if (editBluffsTemp.length === 3) {
                          // Always set bluffs in modal display order
                          const orderedBluffs = rolesBonsNonAttribués.filter(role => editBluffsTemp.some(b => b.nom === role.nom));
                          setBluffs(orderedBluffs);
                          setEditBluffsModal(false);
                        }
                      }}
                      style={{
                        background: "#0e74b4",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.7rem 2rem",
                        fontFamily: "Cardo, serif",
                        fontSize: "1.1rem",
                        cursor:
                          editBluffsTemp.length === 3
                            ? "pointer"
                            : "not-allowed",
                        marginTop: "1rem",
                      }}
                      disabled={editBluffsTemp.length !== 3}
                    >
                      Valider les bluffs
                    </button>
                  </div>
                </div>
              )}
              {/* Modal for editing player name */}
              {nomEditModal &&
                (() => {
                  const joueur = joueursAttribues[nomEditModal.index];
                  const role = joueur?.role;
                  // Get all roles with rappel:true for current edition or custom script, sorted by type
                  const typeOrder = ["Habitant", "Étranger", "Acolyte", "Démon"];
                  const rappelRoles = (edition === "Script personnalisé"
                    ? customScriptPool
                    : roles.filter((r) => r.edition === edition)
                  )
                    .filter((r) => r.rappel)
                    .sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type));
                  // Get rappel icon paths
                  const rappelIcons = rappelRolesSelected.map(
                    (r) => `icons/icon_${normalizeNom(r.nom)}.png`
                  );
                  return (
                    <div
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          background: "white",
                          color: "black",
                          borderRadius: "10px",
                          padding: "2rem",
                          minWidth: "300px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          position: "relative",
                          maxWidth: "90vw",
                          width: "100%",
                        }}
                      >
                        <button
                          onClick={() => setNomEditModal(null)}
                          style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            fontSize: "1.5rem",
                            color: "#333",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          ✖
                        </button>
                        {/* Role info */}
                        {role && (
                          <div
                            style={{
                              textAlign: "center",
                              marginBottom: "1.5rem",
                            }}
                          >
                            <img
                              src={`icons/icon_${normalizeNom(role.nom)}.png`}
                              alt={role.nom}
                              style={{
                                width: "48px",
                                height: "48px",
                                objectFit: "contain",
                                marginBottom: "0.5rem",
                              }}
                            />
                            <div
                              style={{
                                fontFamily: "Cardo, serif",
                                fontWeight: "bold",
                                fontSize: "1.3rem",
                                marginBottom: "0.5rem",
                              }}
                            >
                              {role.nom}
                            </div>
                            <div
                              style={{
                                fontFamily: "Cardo, serif",
                                fontSize: "1rem",
                                color: "#444",
                                marginBottom: "0.5rem",
                                maxWidth: "90vw",
                                wordBreak: "break-word",
                              }}
                            >
                              {role.pouvoir}
                            </div>
                          </div>
                        )}
                        <input
                          type="text"
                          value={nomEditModal.nom}
                          onChange={(e) => {
                            const newNom = e.target.value;
                            setNomEditModal({
                              ...nomEditModal,
                              nom: newNom,
                            });
                            setJoueursAttribues((prev) => {
                              const updated = { ...prev };
                              updated[nomEditModal.index] = {
                                ...updated[nomEditModal.index],
                                nom: newNom,
                              };
                              return updated;
                            });
                          }}
                          style={{
                            width: "100%",
                            fontSize: "1.2rem",
                            padding: "0.5rem",
                            marginBottom: "1rem",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            fontFamily: "Cardo, serif",
                          }}
                        />
                        {/* Alignment switch */}
                        {role && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "1rem",
                              marginBottom: "1rem",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "Cardo, serif",
                                fontSize: "1.1rem",
                              }}
                            >
                              Alignement :
                            </span>
                            <label
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={joueur?.alignement === "Bon"}
                                onChange={() => {
                                  setJoueursAttribues((prev) => {
                                    const updated = { ...prev };
                                    updated[nomEditModal.index] = {
                                      ...updated[nomEditModal.index],
                                      alignement:
                                        updated[nomEditModal.index].alignement === "Bon"
                                          ? "Maléfique"
                                          : "Bon",
                                      alignementFixe: true,
                                    };
                                    return updated;
                                  });
                                }}
                                style={{ display: "none" }}
                              />
                              <span
                                style={{
                                  width: "40px",
                                  height: "24px",
                                  background:
                                    joueur?.alignement === "Bon"
                                      ? "#0e74b4"
                                      : "#950f13",
                                  borderRadius: "12px",
                                  position: "relative",
                                  transition: "background 0.2s",
                                  display: "inline-block",
                                }}
                              >
                                <span
                                  style={{
                                    position: "absolute",
                                    left:
                                      joueur?.alignement === "Bon"
                                        ? "20px"
                                        : "2px",
                                    top: "2px",
                                    width: "20px",
                                    height: "20px",
                                    background: "#fff",
                                    borderRadius: "50%",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                    transition: "left 0.2s",
                                  }}
                                />
                              </span>
                            </label>
                            <span
                              style={{
                                fontFamily: "Cardo, serif",
                                fontSize: "1.1rem",
                                color:
                                  joueur?.alignement === "Bon"
                                    ? "#0e74b4"
                                    : "#950f13",
                              }}
                            >
                              {joueur?.alignement === "Bon" ? "Bon" : "Maléfique"}
                            </span>
                            {/* Rappel icons next to alignment */}
                            {joueur?.rappelRoles &&
                              joueur.rappelRoles.length > 0 &&
                              joueur.rappelRoles.map((r, idx) => (
                                <span
                                  key={r.nom}
                                  style={{
                                    marginLeft: "0.2rem",
                                    fontSize: "1.3rem",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  <img
                                    src={`icons/icon_${normalizeNom(
                                      r.nom
                                    )}.png`}
                                    alt={r.nom}
                                    style={{
                                      width: 32,
                                      height: 32,
                                      verticalAlign: "middle",
                                      objectFit: "contain",
                                    }}
                                  />
                                </span>
                              ))}
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            marginBottom: "1rem",
                          }}
                        >
                          {/* Save button removed, changes are now live */}
                          {/* Rappel button and dropdown */}
                          <div style={{ position: "relative" }}>
                            <button
                              style={{
                                padding: "0.5rem 1.5rem",
                                fontFamily: "Cardo, serif",
                                fontSize: "1.1rem",
                                cursor: "pointer",
                                background: "#bdbdbdff",
                                color: "#222",
                                borderRadius: 8,
                                border: "none",
                              }}
                              onClick={() => setShowRappelModal(true)}
                            >
                              Rappels
                            </button>
                            {/* Rappel selection modal */}
                            {showRappelModal && (
                              <div
                                style={{
                                  position: "fixed",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: "rgba(0,0,0,0.5)",
                                  zIndex: 100,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <div
                                  style={{
                                    position: "relative",
                                    background: "white",
                                    borderRadius: "10px",
                                    padding: "2rem",
                                    minWidth: "300px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                    maxWidth: "90vw",
                                    width: "100%",
                                  }}
                                >
                                  <button
                                    onClick={() => setShowRappelModal(false)}
                                    style={{
                                      position: "absolute",
                                      top: "1rem",
                                      right: "1rem",
                                      background: "none",
                                      border: "none",
                                      fontSize: "2rem",
                                      color: "#000",
                                      cursor: "pointer",
                                      lineHeight: 1,
                                      zIndex: 101,
                                    }}
                                    aria-label="Fermer"
                                  >
                                    ×
                                  </button>
                                  <h3
                                    style={{
                                      fontFamily: "Cardo, serif",
                                      marginBottom: "1rem",
                                    }}
                                  >
                                    Sélectionner les rappels
                                  </h3>
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns:
                                        "repeat(auto-fit, minmax(120px, 1fr))",
                                      gap: "0.5rem",
                                    }}
                                  >
                                    {rappelRoles.map((r) => (
                                      <button
                                        key={r.nom}
                                        style={{
                                          padding: "0.5rem",
                                          borderRadius: 8,
                                          border: "1px solid #bbb",
                                          background:
                                            (joueursAttribues[nomEditModal.index]?.rappelRoles || []).some(
                                              (selected) => selected.nom === r.nom
                                            )
                                              ? "#bdbdbdff"
                                              : "#f5f5f5",
                                          color: "#222",
                                          fontFamily: "Cardo, serif",
                                          fontSize: "1rem",
                                          cursor: "pointer",
                                          boxShadow:
                                            (joueursAttribues[nomEditModal.index]?.rappelRoles || []).some(
                                              (selected) => selected.nom === r.nom
                                            )
                                              ? "0 2px 8px rgba(230,192,125,0.15)"
                                              : "none",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          gap: "0.25rem",
                                        }}
                                        onClick={() => {
                                          // Toggle role selection and update joueursAttribues immediately
                                          setJoueursAttribues((attribues) => {
                                            const current = attribues[nomEditModal.index]?.rappelRoles || [];
                                            let newRoles;
                                            if (
                                              current.some(
                                                (selected) => selected.nom === r.nom
                                              )
                                            ) {
                                              newRoles = current.filter(
                                                (selected) => selected.nom !== r.nom
                                              );
                                            } else {
                                              newRoles = [...current, r];
                                            }
                                            const updated = { ...attribues };
                                            updated[nomEditModal.index] = {
                                              ...updated[nomEditModal.index],
                                              rappelRoles: newRoles,
                                            };
                                            return updated;
                                          });
                                          setShowRappelModal(false);
                                        }}
                                      >
                                        <img
                                          src={`icons/icon_${normalizeNom(
                                            r.nom
                                          )}.png`}
                                          alt={r.nom}
                                          style={{
                                            width: "24px",
                                            height: "24px",
                                            marginBottom: "0.25rem",
                                          }}
                                          onError={(e) => {
                                            e.target.style.display = "none";
                                          }}
                                        />
                                        <span
                                          style={{
                                            color:
                                              r.alignement === "Bon"
                                                ? "#0e74b4"
                                                : r.alignement === "Maléfique"
                                                ? "#950f13"
                                                : "#222",
                                            fontWeight: 500,
                                          }}
                                        >
                                          {r.nom}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Remplacer button and dropdown */}
                          <div style={{ position: "relative" }}>
                            <button
                              style={{
                                padding: "0.5rem 1.5rem",
                                fontFamily: "Cardo, serif",
                                fontSize: "1.1rem",
                                cursor: "pointer",
                                background: "#0e74b4",
                                color: "#fff",
                                borderRadius: 8,
                                border: "none",
                              }}
                              onClick={() => setShowRemplacerDropdown(true)}
                            >
                              Changer de rôle
                            </button>
                            {showRemplacerDropdown && (
                              <div
                                style={{
                                  position: "fixed",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: "rgba(0,0,0,0.5)",
                                  zIndex: 100,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <div
                                  style={{
                                    position: "relative",
                                    background: "white",
                                    borderRadius: "10px",
                                    padding: "2rem",
                                    minWidth: "300px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                    maxWidth: "90vw",
                                    width: "100%",
                                  }}
                                >
                                  <button
                                    onClick={() =>
                                      setShowRemplacerDropdown(false)
                                    }
                                    style={{
                                      position: "absolute",
                                      top: "1rem",
                                      right: "1rem",
                                      background: "none",
                                      border: "none",
                                      fontSize: "2rem",
                                      color: "#000",
                                      cursor: "pointer",
                                      lineHeight: 1,
                                      zIndex: 101,
                                    }}
                                    aria-label="Fermer"
                                  >
                                    ×
                                  </button>
                                  <h3
                                    style={{
                                      fontFamily: "Cardo, serif",
                                      marginBottom: "1rem",
                                    }}
                                  >
                                    Sélectionner le nouveau rôle
                                  </h3>
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns:
                                        "repeat(auto-fit, minmax(120px, 1fr))",
                                      gap: "0.5rem",
                                    }}
                                  >
                                    {[
                                      joueur?.role,
                                      ...((edition === "Script personnalisé"
                                        ? customScriptPool
                                        : roles.filter((r) => r.edition === edition)
                                      )
                                        .filter((r) => r.nom !== joueur?.role?.nom)
                                        .sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)))
                                    ]
                                      .filter(Boolean)
                                      .map((r) => (
                                        <button
                                          key={r.nom}
                                          style={{
                                            padding: "0.5rem",
                                            borderRadius: 8,
                                            border: "1px solid #bbb",
                                            background:
                                              joueur?.role?.nom === r.nom
                                                ? "#bdbdbdff"
                                                : "#f5f5f5",
                                            color:
                                              joueur?.role?.nom === r.nom
                                                ? "#fff"
                                                : "#222",
                                            fontFamily: "Cardo, serif",
                                            fontSize: "1rem",
                                            cursor: "pointer",
                                            boxShadow:
                                              joueur?.role?.nom === r.nom
                                                ? "0 2px 8px rgba(14,116,180,0.15)"
                                                : "none",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "0.25rem",
                                          }}
                                          onClick={() => {
                                            if (r.nom !== joueur?.role?.nom) {
                                              setJoueursAttribues((prev) => {
                                                const updated = { ...prev };
                                                updated[nomEditModal.index] = {
                                                  ...updated[nomEditModal.index],
                                                  role: r,
                                                };
                                                return updated;
                                              });
                                              // Update selected roles for ordre de réveil
                                              setSelected((prevSelected) => {
                                                // Remove the old role and add the new one
                                                const withoutOld =
                                                  prevSelected.filter(
                                                    (role) =>
                                                      role.nom !==
                                                      joueur?.role?.nom
                                                  );
                                                return [...withoutOld, r];
                                              });
                                            }
                                            setShowRemplacerDropdown(false);
                                            setRemplacerRole(null);
                                          }}
                                        >
                                          <img
                                            src={`icons/icon_${normalizeNom(
                                              r.nom
                                            )}.png`}
                                            alt={r.nom}
                                            style={{
                                              width: "24px",
                                              height: "24px",
                                              marginBottom: "0.25rem",
                                            }}
                                            onError={(e) => {
                                              e.target.style.display = "none";
                                            }}
                                          />
                                          <span
                                            style={{
                                              color:
                                                r.alignement === "Bon"
                                                  ? "#0e74b4"
                                                  : r.alignement === "Maléfique"
                                                  ? "#950f13"
                                                  : "#222",
                                              fontWeight: 500,
                                            }}
                                          >
                                            {r.nom}
                                          </span>
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* Confirm role change */}
                            {showRemplacerDropdown && remplacerRole && (
                              <button
                                style={{
                                  marginTop: "2.5rem",
                                  padding: "0.3rem 1rem",
                                  fontFamily: "Cardo, serif",
                                  fontSize: "1rem",
                                  borderRadius: 8,
                                  border: "none",
                                  background: "#222",
                                  color: "#fff",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  const newRole = roles.find(
                                    (r) => r.nom === remplacerRole
                                  );
                                  setJoueursAttribues((prev) => {
                                    const updated = { ...prev };
                                    // Si alignementFixe est déjà true, on ne touche pas à l'alignement
                                    updated[nomEditModal.index] = {
                                      ...updated[nomEditModal.index],
                                      role: newRole,
                                      alignementFixe: true,
                                      alignement:
                                        updated[nomEditModal.index].alignementFixe
                                          ? updated[nomEditModal.index].alignement
                                          : updated[nomEditModal.index].alignement,
                                    };
                                    return updated;
                                  });
                                  setShowRemplacerDropdown(false);
                                  setRemplacerRole(null);
                                }}
                              >
                                Confirmer
                              </button>
                            )}
                          </div>
                          <button
                            style={{
                              padding: "0.5rem 1.5rem",
                              fontFamily: "Cardo, serif",
                              fontSize: "1.1rem",
                              cursor: "pointer",
                              background: joueur?.mort ? "#888" : "#eee",
                              color: joueur?.mort ? "#fff" : "#222",
                              borderRadius: 8,
                              border: "none",
                            }}
                            onClick={() => {
                              setJoueursAttribues((prev) => {
                                const updated = { ...prev };
                                updated[nomEditModal.index] = {
                                  ...updated[nomEditModal.index],
                                  mort: !updated[nomEditModal.index]?.mort,
                                  token: !updated[nomEditModal.index]?.mort
                                    ? true
                                    : updated[nomEditModal.index]?.token,
                                };
                                return updated;
                              });
                            }}
                          >
                            Mort
                          </button>
                          {/* Vote button appears only if mort is enabled */}
                          {joueur?.mort && (
                            <button
                              style={{
                                padding: "0.5rem 1.5rem",
                                fontFamily: "Cardo, serif",
                                fontSize: "1.1rem",
                                cursor: "pointer",
                                background: joueur?.token ? "#E9AA12" : "#eee",
                                color: joueur?.token ? "#fff" : "#222",
                                borderRadius: 8,
                                border: "none",
                                marginLeft: "0.5rem",
                                display: "inline-block",
                              }}
                              onClick={() => {
                                setJoueursAttribues((prev) => {
                                  const updated = { ...prev };
                                  updated[nomEditModal.index] = {
                                    ...updated[nomEditModal.index],
                                    token: !updated[nomEditModal.index]?.token,
                                  };
                                  return updated;
                                });
                              }}
                            >
                              Vote
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
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
              textAlign: "center",
            }}
          >
            Liste des rôles pour :
            <br />
            {edition}
          </h2>

          <QRCode
            value={
              edition === "Script personnalisé"
                ? customScriptPool.length > 0
                  ? `${
                      window.location.origin
                    }/minuit-sonne-rouge/QRCodePage.html?custom=${encodeURIComponent(
                      customScriptPool.map((r) => r.nom).join(",")
                    )}`
                  : window.location.origin + "/minuit-sonne-rouge/"
                : urlPDF[edition]
                ? window.location.origin +
                  "/minuit-sonne-rouge/" +
                  urlPDF[edition]
                : window.location.origin + "/minuit-sonne-rouge/"
            }
            size={256}
            bgColor="#ffffff"
            fgColor="#000000"
          />
          {/* Show 'Afficher le script' for custom script, 'Voir PDF' for standard editions */}
          {edition === "Script personnalisé" && customScriptPool.length > 0 && (
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
                  `${
                    window.location.origin
                  }/minuit-sonne-rouge/QRCodePage.html?custom=${encodeURIComponent(
                    customScriptPool.map((r) => r.nom).join(",")
                  )}`,
                  "_blank"
                )
              }
            >
              Afficher
            </button>
          )}
          {edition !== "Script personnalisé" && urlPDF[edition] && (
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
              Afficher
            </button>
          )}
        </div>
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
            {bluffs.length === 3
              ? rolesBonsNonAttribués
                  .filter(role => bluffs.some(b => b.nom === role.nom))
                  .map((role) => (
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
                  ))
              : null}
          </div>
        </div>
      )}
      {/* Jetons info section (above notes) */}
      <div
        style={{
          marginBottom: "2rem",
          marginTop: "2rem",
          fontFamily: "Cardo, serif",
          color: "#222",
          maxWidth: "1200px",
          marginLeft: 0,
          marginRight: "auto",
        }}
      >
        <h1
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "2rem",
            color: "black",
            margin: 0,
            marginBottom: "0.5rem",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => setJetonsInfoVisible((v) => !v)}
        >
          <span className="caret">{jetonsInfoVisible ? "▼" : "►"}</span><span>Communication</span>
        </h1>
        {jetonsInfoVisible && (
          <>
            {/* Rôles button for communication */}
            <div
              style={{
                width: "100%",
                marginBottom: "1rem",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                style={{
                  ...buttonStyle,
                  background: "#222",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  minWidth: "180px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
                onClick={() => setRolesModalOpen(true)}
              >
                Rôles
              </button>
            </div>
            {/* Modal for roles selection */}
            {rolesModalOpen && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.7)",
                  zIndex: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    color: "#222",
                    borderRadius: "10px",
                    padding: "2rem",
                    minWidth: "320px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    position: "relative",
                  }}
                >
                  <button
                    onClick={() => setRolesModalOpen(false)}
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      fontSize: "1.5rem",
                      color: "#333",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                  <h2 style={{ marginBottom: "1rem" }}>Choisir un rôle</h2>
                  {/* Group roles by type */}
                  {(() => {
                    const types = {};
                    rolesFiltres.forEach((role) => {
                      if (!types[role.type]) types[role.type] = [];
                      types[role.type].push(role);
                    });
                    const typeOrder = [
                      "Habitant",
                      "Étranger",
                      "Acolyte",
                      "Démon",
                    ];
                    return typeOrder
                      .filter((type) => types[type])
                      .map((type) => (
                        <div key={type} style={{ marginBottom: "1.2rem" }}>
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: "1.1rem",
                              marginBottom: "0.5rem",
                              color: "#222",
                            }}
                          >
                            {type}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "0.5rem",
                            }}
                          >
                            {types[type].map((role) => (
                              <button
                                key={role.nom}
                                style={{
                                  background: "#eee",
                                  color: "#222",
                                  border: "1px solid #bbb",
                                  borderRadius: "6px",
                                  fontWeight: "bold",
                                  fontSize: "1rem",
                                  padding: "0.4rem 0.8rem",
                                  marginBottom: "0.3rem",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                                onClick={() => {
                                  setSelectedRole(role);
                                  setRolesModalOpen(false);
                                }}
                              >
                                <img
                                  src={getRoleIcon(role)}
                                  alt={role.nom}
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "4px",
                                    background: "#fff",
                                    border: "1px solid #ccc",
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                                {role.nom}
                              </button>
                            ))}
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              </div>
            )}
            {/* Modal for displaying selected role */}
            {selectedRole && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "#000",
                  zIndex: 401,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    background: "#111",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "2.5rem 2rem",
                    minWidth: "320px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                    position: "relative",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => setSelectedRole(null)}
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      fontSize: "1.5rem",
                      color: "#fff",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                  <img
                    src={getRoleIcon(selectedRole)}
                    alt={selectedRole.nom}
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "8px",
                      background: "#fff",
                      border: "2px solid #fff",
                      marginBottom: "1rem",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <h2 style={{ marginBottom: "1.2rem", fontSize: "2rem" }}>
                    {selectedRole.nom}
                  </h2>
                  <div style={{ fontSize: "1rem" }}>
                    {selectedRole.description}
                  </div>
                </div>
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem 2rem",
                marginBottom: "1.2rem",
              }}
            >
              {/* First row */}
              <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
                {jetonsInfoButtons.slice(0, 3).map((btn) => (
                  <button
                    key={btn.page}
                    onClick={() => setJetonInfoPage(btn.page)}
                    style={{
                      background: btn.color,
                      color: btn.textColor,
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      padding: "0.5rem 0.8rem",
                      flex: 1,
                      minWidth: "180px",
                      marginBottom: "0.5rem",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      cursor: "pointer",
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              {/* Second row */}
              <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
                {jetonsInfoButtons.slice(3, 6).map((btn) => (
                  <button
                    key={btn.page}
                    onClick={() => setJetonInfoPage(btn.page)}
                    style={{
                      background: btn.color,
                      color: btn.textColor,
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      padding: "0.5rem 0.8rem",
                      flex: 1,
                      minWidth: "180px",
                      marginBottom: "0.5rem",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      cursor: "pointer",
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              {/* Third row */}
              <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
                {jetonsInfoButtons.slice(6, 10).map((btn) => (
                  <button
                    key={btn.page}
                    onClick={() => setJetonInfoPage(btn.page)}
                    style={{
                      background: btn.color,
                      color: btn.textColor,
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      padding: "0.5rem 0.8rem",
                      flex: 1,
                      minWidth: "180px",
                      marginBottom: "0.5rem",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      cursor: "pointer",
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{
                fontWeight: "bold",
                fontSize: "1.1rem",
                marginTop: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              Messages personnalisés
            </div>
            <button
              style={{
                background: "#7db3e6",
                color: "#234",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "1.1rem",
                padding: "0.5rem 0.8rem",
                minWidth: "220px",
                marginBottom: "0.5rem",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                cursor: "pointer",
              }}
              onClick={() => setAddCustomJetonVisible(true)}
            >
              Ajouter un message
            </button>
            {/* Modal for custom jeton info */}
            {addCustomJetonVisible && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.7)",
                  zIndex: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    color: "#222",
                    borderRadius: "10px",
                    padding: "2rem",
                    minWidth: "320px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    position: "relative",
                  }}
                >
                  <button
                    onClick={() => setAddCustomJetonVisible(false)}
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      fontSize: "1.5rem",
                      color: "#333",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ✖
                  </button>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      marginBottom: "1rem",
                    }}
                  >
                    Ajouter un message personnalisé
                  </div>
                  <input
                    type="text"
                    value={customJetonText}
                    onChange={(e) => setCustomJetonText(e.target.value)}
                    style={{
                      width: "100%",
                      fontSize: "1.1rem",
                      padding: "0.5rem",
                      marginBottom: "1rem",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontFamily: "Cardo, serif",
                    }}
                    placeholder="Texte du message"
                  />
                  <button
                    style={{
                      background: "#7db3e6",
                      color: "#234",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      padding: "0.5rem 1.2rem",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (customJetonText.trim()) {
                        setCustomJetons([
                          ...customJetons,
                          customJetonText.trim(),
                        ]);
                        setCustomJetonText("");
                        setAddCustomJetonVisible(false);
                      }
                    }}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            )}
            {/* Render custom jetons as buttons */}
            {customJetons.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1rem",
                  marginTop: "0.5rem",
                }}
              >
                {customJetons.map((txt, idx) => (
                  <button
                    key={idx}
                    style={{
                      background: "#7db3e6",
                      color: "#234",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      padding: "0.5rem 0.8rem",
                      minWidth: "180px",
                      marginBottom: "0.5rem",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      cursor: "pointer",
                    }}
                    onClick={() => setJetonInfoPage(`custom-${idx}`)}
                  >
                    {txt}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Jeton info modal/page */}
      {jetonInfoPage !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#888",
            zIndex: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "none",
              color: "#fff",
              borderRadius: "16px",
              padding: "0",
              minWidth: "0",
              minHeight: "0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Cardo, serif",
              fontSize: "2rem",
              boxShadow: "none",
              position: "relative",
              width: "100vw",
              height: "100vh",
            }}
          >
            {/* Bin icon for custom messages, top left */}
            {jetonInfoPage && jetonInfoPage.startsWith("custom-") && (
              <button
                onClick={() => {
                  const idx = parseInt(jetonInfoPage.split("-")[1]);
                  removeCustomJeton(idx);
                  setJetonInfoPage(null);
                }}
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  left: "2rem",
                  fontSize: "2rem",
                  color: "#fff",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  zIndex: 401,
                }}
                title="Supprimer ce message"
              >
                🗑️
              </button>
            )}
            {/* Close icon, top right */}
            <button
              onClick={() => setJetonInfoPage(null)}
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "2rem",
                fontSize: "2rem",
                color: "#fff",
                background: "none",
                border: "none",
                cursor: "pointer",
                zIndex: 401,
              }}
            >
              ✖
            </button>
            <div style={{ textAlign: "center", marginTop: "18vh" }}>
              <div
                style={{
                  fontFamily: "Cardo, serif",
                  fontSize: "2.2rem",
                  marginBottom: "2.5rem",
                  color: "#fff",
                }}
              >
                {jetonInfoPage === "not-in-game"
                  ? "Ces rôles ne sont pas en jeu"
                  : jetonInfoPage.startsWith("custom-")
                  ? customJetons[parseInt(jetonInfoPage.split("-")[1])]
                  : jetonsInfoButtons.find((btn) => btn.page === jetonInfoPage)?.content}
              </div>
              {/* If the message is 'Ces rôles ne sont pas en jeu', show the roles icons and names below, otherwise just the message */}
              {jetonInfoPage === "not-in-game" &&
                (bluffs && bluffs.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      gap: "3rem",
                      justifyContent: "center",
                      marginTop: "1.5rem",
                    }}
                  >
                    {bluffs.map((role) => (
                      <div key={role.nom} style={{ textAlign: "center" }}>
                        <img
                          src={`icons/icon_${normalizeNom(role.nom)}.png`}
                          alt={role.nom}
                          style={{
                            width: 64,
                            height: 64,
                            objectFit: "contain",
                            marginBottom: "0.5rem",
                          }}
                        />
                        <div
                          style={{
                            fontFamily: "Cardo, serif",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            color: "#fff",
                          }}
                        >
                          {role.nom}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null)}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          marginBottom: "2rem",
          marginTop: "2rem",
          fontFamily: "Cardo, serif",
        }}
      >
        <div
          style={{
            fontFamily: "Cardo, serif",
            color: "black",
            display: "block",
          }}
        >
          <h1
            style={{
              fontFamily: "'Pirata One', cursive",
              fontSize: "2rem",
              color: "black",
              margin: 0,
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={() => setAfficherNotes((v) => !v)}
          >
            <span className="caret">{afficherNotes ? "▼" : "►"}</span><span>Notes</span>
          </h1>
        </div>

        {afficherNotes && (
          <div
            style={{
              marginTop: "1rem",
              color: "black",
              display: "block",
              flexDirection: "column",
            }}
          >
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              style={{
                width: "600px",
                fontFamily: "Cardo, serif",
                fontSize: "1.2rem",
                borderRadius: 0,
                border: "1px solid #ccc",
                padding: "0.5rem",
                resize: "vertical",
                background: "#ffe9a7ff",
                color: "#222",
                marginBottom: "1rem",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
