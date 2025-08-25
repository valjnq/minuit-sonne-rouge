import React, { useState, useEffect, useRef } from "react";
import roles from "./roles-fr.json";
import QRCode from "react-qr-code";
import "./mobile.css";
import pkg from "../package.json";

// Fonction utilitaire pour mettre en gras le texte entre crochets
function renderBoldBrackets(text) {
  if (!text) return null;
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) => {
    if (part.startsWith("[") && part.endsWith("]")) {
      return <strong key={i}>{part}</strong>;
    }
    return part;
  });
}

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
  // Style pour aligner les icônes des boutons rôles en haut
  const roleButtonStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: "90px",
    padding: "0.5rem",
    gap: "0.3rem",
  };
  const [jetonsInfoVisible, setJetonsInfoVisible] = useState(false);
  const [jetonInfoPage, setJetonInfoPage] = useState(null);

  const jetonsInfoButtons = [
    {
      label: "Voici le démon",
      color: "#950f13",
      page: "demon",
      content: "Voici le démon",
      textColor: "white",
      fontWeight: "bold",
    },
    {
      label: "Voici tes acolytes",
      color: "#950f13",
      page: "acolytes",
      content: "Voici tes acolytes",
      textColor: "white",
    },
    {
      label: "Bluffs du démon",
      color: "#950f13",
      page: "not-in-game",
      content: "Ces rôles ne sont pas en jeu",
      textColor: "white",
    },
    {
      label: "Tu es",
      color: "#0e74b4",
      page: "you-are",
      content: "Tu es",
      textColor: "white",
    },
    {
      label: "Ce joueur est",
      color: "#0e74b4",
      page: "player-is",
      content: "Ce joueur est",
      textColor: "white",
    },
    {
      label: "Utiliser ton pouvoir ?",
      color: "#0e74b4",
      page: "use-power",
      content: "Utiliser ton pouvoir?",
      textColor: "white",
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
    5: { Habitants: 3, Étrangers: 0, Acolytes: 1, Démons: 1 },
    6: { Habitants: 3, Étrangers: 1, Acolytes: 1, Démons: 1 },
    7: { Habitants: 5, Étrangers: 0, Acolytes: 1, Démons: 1 },
    8: { Habitants: 5, Étrangers: 1, Acolytes: 1, Démons: 1 },
    9: { Habitants: 5, Étrangers: 2, Acolytes: 1, Démons: 1 },
    10: { Habitants: 7, Étrangers: 0, Acolytes: 2, Démons: 1 },
    11: { Habitants: 7, Étrangers: 1, Acolytes: 2, Démons: 1 },
    12: { Habitants: 7, Étrangers: 2, Acolytes: 2, Démons: 1 },
    13: { Habitants: 9, Étrangers: 0, Acolytes: 3, Démons: 1 },
    14: { Habitants: 9, Étrangers: 1, Acolytes: 3, Démons: 1 },
    15: { Habitants: 9, Étrangers: 2, Acolytes: 3, Démons: 1 },
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
  const [afficherRepartition, setAfficherRepartition] = useState(true);
  const [afficherBluffs, setAfficherBluffs] = useState(false);
  const [choisirBluffsVisible, setChoisirBluffsVisible] = useState(false);
  const [bluffs, setBluffs] = useState([]);
  const [erreurBluffs, setErreurBluffs] = useState("");
  const [bluffsValides, setBluffsValides] = useState(false);
  const [afficherNotes, setAfficherNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [afficherMentions, setAfficherMentions] = useState(false);
  const tousAttribues =
    nbJoueurs > 0 && Object.keys(joueursAttribues).length === nbJoueurs;
  function clearNotes() {
    setNotes("");
  }
  const [customScriptVisible, setCustomScriptVisible] = useState(false);
  const [customScriptPool, setCustomScriptPool] = useState([]);
  const [customScriptTemp, setCustomScriptTemp] = useState([]);

  // Préchargement des icônes de rôles pour éviter la latence
  useEffect(() => {
    // Récupère tous les rôles possibles (édition courante et script personnalisé)
    const allRoles =
      edition === "Script personnalisé"
        ? customScriptPool
        : roles.filter((r) => r.edition === edition);
    allRoles.forEach((role) => {
      const img = new window.Image();
      img.src = getRoleIcon(role);
    });
    // Précharge explicitement les icônes utilitaires
    [
      "icons/mort.png",
      "icons/vote.png",
      "icons/crepuscule.png",
      "icons/aube.png",
      "icons/acolyte.png",
      "icons/demon.png",
    ].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [edition, customScriptPool, roles]);
  // Ensure customScriptTemp is always initialized from validated pool when opening modal
  useEffect(() => {
    if (
      customScriptVisible &&
      customScriptTemp.length === 0 &&
      customScriptPool.length > 0
    ) {
      setCustomScriptTemp(customScriptPool);
    }
  }, [customScriptVisible, customScriptTemp.length, customScriptPool]);
  const [afficherGrimoire, setAfficherGrimoire] = useState(false);
  // Control open/close of Paramètres and Rôles sections
  const [openSetup, setOpenSetup] = useState(true);
  const [openRolesDetails, setOpenRolesDetails] = useState(true);
  const grimoireRef = useRef(null);
  // util pour composer un chemin correct (Vite/GH Pages)
  const withBase = (p) => `${import.meta.env.BASE_URL || "/"}${p}`;

  function preloadImages(urls) {
    return Promise.all(
      urls.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = () => resolve();
            img.src = src;
            // Safari 15+ : tente le décodage anticipé
            if (img.decode) img.decode().catch(() => {});
          })
      )
    );
  }

  function roleIconsForEdition(ed) {
    const pool =
      ed === "Script personnalisé"
        ? customScriptPool
        : roles.filter((r) => r.edition === ed);
    return pool.map(getRoleIcon);
  }

  const UTILS = [
    "icons/mort.png",
    "icons/vote.png",
    "icons/crepuscule.png",
    "icons/aube.png",
    "icons/acolyte.png",
    "icons/demon.png",
  ].map(withBase);

  // 1) Chauffer les autres éditions en idle, juste après le montage
  useEffect(() => {
    const ALL = ["Sombre présage", "Parfum d'hystérie", "Crépuscule funeste"];
    const others = ALL.filter((e) => e !== edition);
    const warmUp = async () => {
      for (const e of others) {
        const urls = [...roleIconsForEdition(e), ...UTILS];
        await preloadImages(urls);
      }
    };
    if ("requestIdleCallback" in window) requestIdleCallback(warmUp);
    else setTimeout(warmUp, 500);
    // pas de dépendances -> une seule fois
  }, []);

  const urlPDF = {
    "Sombre présage": "docs/minuitsonnerouge-sombrepresage.pdf",
    "Parfum d’hystérie": "docs/minuitsonnerouge-parfumdhysterie.pdf",
    "Crépuscule funeste": "docs/minuitsonnerouge-crepusculefuneste.pdf",
  };
  // Quand on passe de "pas tous attribués" -> "tous attribués"
  useEffect(() => {
    if (!tousAttribues) return;
    setOpenSetup(false);
    setOpenRolesDetails(false);
    setAfficherRepartition(true); // ouvre Grimoire à l’apparition
  }, [tousAttribues]);

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
    { label: "Démons", color: "#950f13", type: "Démon" },
  ];

  const maxParType = tableRepartition[nbJoueurs];
  const typeToPlural = {
    Habitant: "Habitants",
    Étranger: "Étrangers",
    Acolyte: "Acolytes",
    Démon: "Démons",
  };
  const colorForType = (type) =>
    lignes.find((l) => l.label === typeToPlural[type])?.color || "#222";
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
        const max = maxParType.Démons;
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
    setAfficherOrdreReveil(false);
    setNomEditModal(null);
    setEditBluffsModal(false);
    setEditBluffsTemp([]);
    setCustomScriptVisible(false);
    setCustomScriptTemp([]);
    setCustomJetons([]);
    setNotes("");
    setOpenSetup(true);
    setOpenRolesDetails(true);
    setAfficherRepartition(false);
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
          : maxParType.Démons;

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
  // tirage aléatoire pour le script personnalisé
  function tirageAleatoireScript() {
    const shufflePick = (arr, n) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a.slice(0, Math.min(n, a.length));
    };

    const habitants = shufflePick(
      roles.filter((r) => r.type === "Habitant"),
      13
    );
    const etrangers = shufflePick(
      roles.filter((r) => r.type === "Étranger"),
      4
    );
    const acolytes = shufflePick(
      roles.filter((r) => r.type === "Acolyte"),
      4
    );
    const demons = shufflePick(
      roles.filter((r) => r.type === "Démon"),
      4
    );

    setCustomScriptTemp([...habitants, ...etrangers, ...acolytes, ...demons]);
  }

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
      Démons: 0,
    };
    selected.forEach((r) => {
      if (r.type === "Habitant") repartition.Habitants++;
      else if (r.type === "Étranger") repartition["Étrangers"]++;
      else if (r.type === "Acolyte") repartition.Acolytes++;
      else if (r.type === "Démon") repartition.Démons++;
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
  }

  return (
    <div className="fullscreen">
      {/* Header (défile avec la page, non sticky) */}
      <div className="safe-pads">
        <div className="container" style={{ paddingTop: "1rem" }}>
          <style>{`
          /* Grille responsive pour les cartes de rôles */
.roles-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* 2 colonnes par défaut */
  gap: 0.5rem;
  margin-top: 0.5rem;

}

/* Sur petits écrans, passe en 1 colonne pour éviter le débordement */
@media (max-width: 420px) {
  .roles-grid {
    grid-template-columns: 1fr;
  }
}
  /* Unifie les triangles des sections repliables */
  details.collapsible > summary {
    font-family: 'Pirata One', cursive;
    font-weight: bold;
   font-size: var(--h2-size);
    cursor: pointer;
    display: flex;
    align-items: center;         /* alignement vertical */
    gap: .5rem;
    line-height: 1.2;
  }
  /* Equal vertical spacing between sections */
  details.collapsible {
    margin-bottom: 1rem !important;
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

          {/* Titre */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "0rem",
            }}
          >
            <img
              src={withBase("icons/grimoire.png")}
              alt="Grimoire"
              style={{ width: "72px", height: "72px", objectFit: "contain" }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontFamily: "Pirata One, cursive",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#950f13",
                  lineHeight: "1.1", // ← ajouté
                }}
              >
                Minuit Sonne Rouge
              </span>
              <span
                style={{
                  fontFamily: "Pirata One, cursive",
                  fontSize: "1.6rem",
                  fontWeight: "bold",
                  color: "black",
                  lineHeight: "1.1", // ← ajouté
                }}
              >
                Grimoire virtuel
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* === CONTENU PRINCIPAL === */}
      <main className="safe-pads page">
        <div className="container">
          {/* === SETUP (collapsible) === */}
          <details
            id="setup"
            className="collapsible"
            open={openSetup}
            onToggle={(e) => setOpenSetup(e.currentTarget.open)}
            style={{ marginBottom: "1.5rem" }}
          >
            <summary>Paramètres</summary>

            {/* --- Ligne d’options --- */}
            <div
              style={{
                marginTop: "0.5rem",
                //marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexBasis: "100%",
                  fontSize: "1rem",
                  fontFamily: "Cardo, serif",
                }}
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

              {/* --- Tableau de répartition --- */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    overflowX: "auto",
                    flexBasis: "100%",
                    marginBottom: "0.5rem",
                  }}
                >
                  <table
                    style={{
                      borderCollapse: "collapse",
                      fontFamily: "Cardo, serif",
                      width: "100%",
                      tableLayout: "fixed",
                      border: "1px solid black",
                    }}
                  >
                    <tbody>
                      <tr>
                        {/* Habitant */}
                        <td
                          style={{
                            padding: "0.5rem",
                            textAlign: "center",
                            fontWeight: "bold",
                            color:
                              lignes.find((l) => l.label === "Habitants")
                                ?.color || "#222",
                            border: "1px solid black",
                          }}
                        >
                          Habitants
                        </td>
                        <td
                          style={{
                            padding: "0.5rem 0.75rem",
                            textAlign: "center",
                            fontWeight: "bold",
                            color:
                              lignes.find((l) => l.label === "Habitants")
                                ?.color || "#222",
                            border: "1px solid black",
                          }}
                        >
                          {tableRepartition[nbJoueurs]?.["Habitants"] ?? 0}
                        </td>

                        {/* Séparateur vertical + Acolytes */}
                        <td
                          style={{
                            borderLeft: "1px solid #000",
                            padding: "0.5rem 0.75rem",
                            textAlign: "center",
                            fontWeight: "bold",
                            color:
                              lignes.find((l) => l.label === "Acolytes")
                                ?.color || "#222",
                            border: "1px solid black",
                          }}
                        >
                          Acolytes
                        </td>
                        <td
                          style={{
                            padding: "0.5rem 0.75rem",
                            textAlign: "center",
                            fontWeight: "bold",
                            color:
                              lignes.find((l) => l.label === "Acolytes")
                                ?.color || "#222",
                            border: "1px solid black",
                          }}
                        >
                          {tableRepartition[nbJoueurs]?.["Acolytes"] ?? 0}
                        </td>
                      </tr>

                      <tr>
                        {/* Étrangers */}
                        <td
                          style={{
                            padding: "0.5rem",
                            textAlign: "center",
                            fontWeight: "bold",
                            color:
                              lignes.find((l) => l.label === "Étrangers")
                                ?.color || "#222",
                            border: "1px solid black",
                          }}
                        >
                          Étrangers
                        </td>
                        <td
                          style={{
                            padding: "0.5rem 0.75rem",
                            textAlign: "center",
                            fontWeight: "bold",
                            color:
                              lignes.find((l) => l.label === "Étrangers")
                                ?.color || "#222",
                            border: "1px solid black",
                          }}
                        >
                          {tableRepartition[nbJoueurs]?.["Étrangers"] ?? 0}
                        </td>

                        {/* Séparateur vertical + Démons */}
                        <td
                          style={{
                            borderLeft: "1px solid #000",
                            padding: "0.5rem 0.75rem",
                            textAlign: "center",
                            fontWeight: "bold",
                            color:
                              lignes.find((l) => l.label === "Démons")?.color ||
                              "#222",
                            border: "1px solid black",
                          }}
                        >
                          Démons
                        </td>
                        <td
                          style={{
                            padding: "0.5rem 0.75rem",
                            textAlign: "center",
                            fontWeight: "bold",
                            color:
                              lignes.find((l) => l.label === "Démons")?.color ||
                              "#222",
                            border: "1px solid black",
                          }}
                        >
                          {tableRepartition[nbJoueurs]?.["Démons"] ?? 0}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                    fontSize: "1rem",
                    fontFamily: "Cardo, serif",
                    flexBasis: "100%", // ← le label + select prennent leur propre ligne
                  }}
                >
                  <div style={{ marginBottom: 0 }}>
                    Sélectionner l'édition :
                  </div>
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
                    <option value="Script personnalisé">
                      Script personnalisé
                    </option>
                  </select>
                </label>

                {/* Ligne des boutons sous le select */}
                <div
                  style={{
                    flexBasis: "100%", // ← force retour à la ligne
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "0.5rem",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {" "}
                  <button
                    onClick={() => setQrCodeVisible(true)}
                    style={{
                      ...buttonStyle,
                      cursor:
                        customScriptPool.length === 0 &&
                        edition === "Script personnalisé"
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        customScriptPool.length === 0 &&
                        edition === "Script personnalisé"
                          ? 0.5
                          : 1,
                    }}
                    disabled={
                      customScriptPool.length === 0 &&
                      edition === "Script personnalisé"
                    }
                  >
                    Partager le script
                  </button>
                  {edition === "Script personnalisé" && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomScriptVisible(true);
                        if (
                          customScriptPool.length > 0 &&
                          customScriptTemp.length === 0
                        ) {
                          setCustomScriptTemp(customScriptPool);
                        }
                      }}
                      disabled={rolesValides}
                      style={{
                        ...buttonStyle,
                        cursor: rolesValides ? "not-allowed" : "pointer",
                        opacity: rolesValides ? 0.5 : 1,
                      }}
                    >
                      Éditer le script
                    </button>
                  )}
                </div>
              </div>
            </div>
          </details>
          {customScriptVisible && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* BOÎTE BLANCHE */}
              <div
                style={{
                  background: "#fff",
                  color: "#222",
                  position: "fixed", // ← plein écran réel
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0, // ← évite 100vh
                  width: "auto",
                  height: "auto",
                  borderRadius: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden", // le corps scrolle, pas l'en-tête

                  /* Hauteur iOS correcte + fallback anciens Safari */
                  minHeight: "-webkit-fill-available",
                  /* si tu préfères garder une hauteur explicite en plus :
       height: "100dvh",  // iOS 16.4+ ; enlève si tu veux juste inset:0
    */

                  /* Safe-areas (notch + home indicator) */
                  paddingTop: "calc(1rem + env(safe-area-inset-top))",
                  paddingRight: "calc(1rem + env(safe-area-inset-right))",
                  paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
                  paddingLeft: "calc(1rem + env(safe-area-inset-left))",

                  /* Améliore le scroll/bounce sur iOS */
                  WebkitOverflowScrolling: "touch",
                  overscrollBehavior: "contain",
                  fontFamily: "Cardo, serif",
                  zIndex: 501, // au-dessus de l’overlay
                }}
                role="dialog"
                aria-modal="true"
              >
                {/* CROIX TOUJOURS VISIBLE */}
                <button
                  onClick={() => setCustomScriptVisible(false)}
                  style={{
                    position: "absolute",
                    top: "0.75rem",
                    right: "0.75rem",
                    border: "none",
                    background: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                  aria-label="Fermer"
                >
                  ×
                </button>

                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: "1rem",
                    paddingRight: "2rem",
                    fontFamily: "Pirata One, cursive",
                  }}
                >
                  Choisir les rôles du script
                </h3>

                {/* CORPS SCROLLABLE */}
                <div
                  style={{
                    flex: 1,
                    overflow: "auto",
                    paddingBottom: "env(safe-area-inset-bottom)",
                  }}
                >
                  {" "}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {["Habitant", "Étranger", "Acolyte", "Démon"].map(
                      (type) => (
                        <details
                          key={type}
                          className="collapsible"
                          open
                          style={{ marginBottom: ".5rem" }}
                        >
                          <summary
                            style={{
                              color: colorForType(type), // couleur selon l’alignement
                              fontWeight: "bold",
                              fontSize: "calc(var(--h2-size) * 1)",
                              fontFamily: "Cardo, serif",
                            }}
                          >
                            {typeToPlural[type]}{" "}
                            <span style={{ opacity: 1 }}>
                              (
                              {
                                customScriptTemp.filter((x) => x.type === type)
                                  .length
                              }
                              )
                            </span>
                          </summary>

                          {/* grille 2 colonnes de boutons (icône + nom coloré) */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                              gap: ".5rem",
                              marginTop: ".5rem",
                            }}
                          >
                            {roles
                              .filter((r) => r.type === type)
                              .map((role) => {
                                const checked = customScriptTemp.some(
                                  (x) => x.nom === role.nom
                                );
                                const color = colorForType(type);
                                return (
                                  <button
                                    key={role.nom}
                                    type="button"
                                    aria-pressed={checked}
                                    onClick={() =>
                                      setCustomScriptTemp((prev) =>
                                        checked
                                          ? prev.filter(
                                              (x) => x.nom !== role.nom
                                            )
                                          : [...prev, role]
                                      )
                                    }
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: ".5rem",
                                      padding: ".5rem .6rem",
                                      borderRadius: 10,
                                      border: checked
                                        ? `2px solid ${color}`
                                        : "1px solid #ccc",
                                      background: checked
                                        ? "rgba(0,0,0,0.03)"
                                        : "#fff",
                                      cursor: "pointer",
                                      textAlign: "left",
                                      width: "100%",
                                    }}
                                  >
                                    <img
                                      src={getRoleIcon(role)}
                                      alt=""
                                      style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 4,
                                        border: "1px solid #ddd",
                                        flex: "0 0 auto",
                                      }}
                                      onError={(ev) =>
                                        (ev.currentTarget.style.display =
                                          "none")
                                      }
                                    />
                                    <span style={{ color, fontWeight: "bold" }}>
                                      {role.nom}
                                    </span>
                                  </button>
                                );
                              })}
                          </div>
                        </details>
                      )
                    )}
                  </div>
                </div>

                {/* PIED DE MODAL (reste visible) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "1rem",
                  }}
                >
                  <button
                    onClick={() => setCustomScriptTemp([])}
                    style={{
                      padding: ".5rem 1rem",
                      borderRadius: 8,
                      border: "1px solid #bbb",
                      background: "#f5f5f5",
                    }}
                  >
                    Vider
                  </button>
                  <div style={{ display: "flex", gap: ".5rem" }}>
                    <button
                      onClick={tirageAleatoireScript}
                      style={{
                        padding: ".5rem 1rem",
                        borderRadius: 8,
                        border: "1px solid #bbb",
                        background: "#f5f5f5",
                      }}
                    >
                      Sélection aléatoire
                    </button>
                    <button
                      onClick={() => {
                        setCustomScriptPool(customScriptTemp);
                        setCustomScriptVisible(false);
                      }}
                      style={{
                        padding: ".5rem 1rem",
                        borderRadius: 8,
                        border: "1px solid #0e74b4",
                        background: "#0e74b4",
                        color: "#fff",
                      }}
                    >
                      Valider ({customScriptTemp.length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <details
            className="collapsible"
            style={{ marginBottom: "1.5rem" }}
            open={openRolesDetails}
            onToggle={(e) => setOpenRolesDetails(e.currentTarget.open)}
          >
            <summary>Rôles</summary>
            <div style={{ marginTop: "1rem" }}>
              {!rolesValides && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "0.5rem",
                    //marginBottom: "1rem",
                  }}
                >
                  <button onClick={tirerAuHasard} style={{ ...buttonStyle }}>
                    Sélection aléatoire
                  </button>
                  <button
                    onClick={deselectionnerTousLesRoles}
                    disabled={selected.length === 0}
                    style={{
                      ...buttonStyle,
                      opacity: selected.length === 0 ? 0.5 : 1,
                    }}
                  >
                    Vider
                  </button>
                  <button
                    onClick={handleValiderRoles}
                    style={{ ...buttonStyle }}
                  >
                    Valider les rôles
                  </button>
                </div>
              )}
              {rolesValides &&
                !affectationVisible &&
                Object.keys(joueursAttribues).length < nbJoueurs && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "0.5rem",
                      marginBottom: "1rem",
                    }}
                  >
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
                const selectedCount = compteParType[type] || 0;
                const expectedCount = maxParType[typeToPlural[type]];
                return (
                  <details key={type} style={{ marginBottom: "1rem" }} open>
                    <summary
                      style={{
                        fontFamily: "Cardo, serif",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        color: colorForType(type),
                        marginBottom: "2rem",
                      }}
                    >
                      {label} ({selectedCount}/{expectedCount})
                    </summary>
                    <div style={{ marginTop: "1rem", width: "100%" }}>
                      {rolesDuType.map((role) => {
                        const isSelected = selected.some(
                          (r) => r.nom === role.nom
                        );
                        const greyed = rolesValides && !isSelected;
                        const isDisabled = greyed;
                        return (
                          <button
                            key={role.nom}
                            onClick={() => {
                              if (!isDisabled && !rolesValides)
                                toggleRole(role);
                            }}
                            className="card-compact"
                            style={{
                              border: isSelected
                                ? role.alignement === "Bon"
                                  ? "2px solid #0e74b4"
                                  : "2px solid #950f13"
                                : "1px solid #ccc",
                              background: isSelected
                                ? role.alignement === "Bon"
                                  ? "#e6f0fa"
                                  : "#fae6e6"
                                : "#fafafa",
                              cursor:
                                isDisabled || rolesValides
                                  ? "not-allowed"
                                  : "pointer",
                              opacity: isDisabled ? 0.5 : 1,
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              borderRadius: 8,
                              textAlign: "left",
                              width: "100%",
                              minHeight: "70px",
                              padding: "0.7rem 1rem",
                              gap: "1rem",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <img
                              src={`icons/icon_${normalizeNom(role.nom)}.png`}
                              alt={role.nom}
                              style={{
                                width: "48px",
                                height: "48px",
                                objectFit: "contain",
                                flexShrink: 0,
                              }}
                            />
                            <div
                              style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                              }}
                            >
                              <div
                                style={{
                                  fontFamily: "'IM Fell English SC', serif",
                                  fontSize: "1.1rem",
                                  color:
                                    role.alignement === "Bon"
                                      ? "#0e74b4"
                                      : "#950f13",
                                  fontWeight: "bold",
                                }}
                              >
                                {role.nom}
                              </div>
                              <div
                                style={{
                                  fontFamily: "Cardo, serif",
                                  fontSize: "0.95rem",
                                  color: "#222",
                                  marginTop: "0.2rem",
                                }}
                              >
                                {renderBoldBrackets(
                                  role.description ||
                                    role.pouvoir ||
                                    "Pouvoir du rôle..."
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          </details>

          {rolesValides && (
            <details
              className="collapsible"
              open={afficherOrdreReveil}
              onToggle={(e) => setAfficherOrdreReveil(e.currentTarget.open)}
            >
              <summary>Ordre de réveil</summary>
              <>
                {/* Toggle Première nuit / Autres nuits – style alignement */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    width: "100%",
                    borderRadius: 8,
                    gap: "0.5rem",
                    overflow: "hidden",
                    margin: "0.5rem 0 1rem 0",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOrdreNuitActuelle("premiere")}
                    style={{
                      padding: "0.75rem",
                      fontFamily: "Cardo, serif",
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      border: "none",
                      color: "white",
                      background:
                        ordreNuitActuelle === "premiere"
                          ? "#0e74b4" // actif
                          : "rgba(143, 143, 143, 0.89)", // inactif (gris)
                      transition: "background 0.2s",
                    }}
                  >
                    Première nuit
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrdreNuitActuelle("autres")}
                    style={{
                      padding: "0.75rem",
                      fontFamily: "Cardo, serif",
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      border: "none",
                      color: "white",
                      background:
                        ordreNuitActuelle === "autres"
                          ? "#0e74b4" // actif
                          : "rgba(143, 143, 143, 0.89)", // inactif (gris)
                      transition: "background 0.2s",
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
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <img
                      src={`icons/crepuscule.png`}
                      alt="crépuscule"
                      className="icon-md"
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
                            gap: "0.5rem",
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
                                role.alignement === "Bon"
                                  ? "#0e74b4"
                                  : "#950f13",
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
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <img
                        src={`icons/acolyte.png`}
                        alt="Réveil des acolytes"
                        className="icon-md"
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
                            gap: "0.5rem",
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
                                role.alignement === "Bon"
                                  ? "#0e74b4"
                                  : "#950f13",
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
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <img
                          src={`icons/demon.png`}
                          alt="Réveil du démon et bluffs"
                          className="icon-md"
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
                            gap: "0.5rem",
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
                            gap: "0.5rem",
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
                                role.alignement === "Bon"
                                  ? "#0e74b4"
                                  : "#950f13",
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
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <img
                      src={`icons/aube.png`}
                      alt="Aube"
                      className="icon-md"
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
            </details>
          )}
          {affectationVisible && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "#888", // gris
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
                          const indexAleatoire = Math.floor(
                            Math.random() * availableRoles.length
                          );
                          const roleAuto = availableRoles[indexAleatoire];
                          let alignementAuto = "Maléfique";
                          if (
                            roleAuto.type === "Habitant" ||
                            roleAuto.type === "Étranger"
                          ) {
                            alignementAuto = "Bon";
                          }
                          newAttribues[i] = {
                            nom: `Joueur ${i + 1}`,
                            role: roleAuto,
                            alignement: alignementAuto,
                            alignementFixe: false,
                          };
                          availableRoles.splice(indexAleatoire, 1);
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
                      gap: "0.5rem",
                    }}
                  >
                    {Array.from({ length: nbJoueurs }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handleChoixNumero(i)}
                        disabled={
                          joueursAttribues[i] || rolesRestants.length === 0
                        }
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          fontSize: "1.5rem",
                          backgroundColor: joueursAttribues[i]
                            ? "#aaa"
                            : "#e4e4e4ff",
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingLeft: "1.5rem",
                    paddingRight: "1.5rem",
                  }}
                >
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
                    {renderBoldBrackets(
                      roleActif.description ||
                        roleActif.pouvoir ||
                        "Pouvoir du rôle..."
                    )}
                  </div>
                  <input
                    className="important-field"
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
              <div style={{ display: "flex", gap: "2rem" }}>
                {bluffs.length === 3
                  ? rolesBonsNonAttribués
                      .filter((role) => bluffs.some((b) => b.nom === role.nom))
                      .map((role) => (
                        <div key={role.nom} style={{ textAlign: "center" }}>
                          <img
                            src={`icons/icon_${normalizeNom(role.nom)}.png`}
                            alt={role.nom}
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: "contain",
                            }}
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
          {/* Grimoire section comes after bluffs */}
          {tousAttribues && (
            <details
              className="collapsible"
              ref={grimoireRef}
              open={afficherRepartition}
              onToggle={(e) => setAfficherRepartition(e.currentTarget.open)}
            >
              <summary>Grimoire</summary>

              <div
                style={{
                  marginTop: "1rem",
                  backgroundColor: "white",
                  color: "black",
                  //padding: "1rem",
                  borderRadius: "8px",
                }}
              >
                <h4>Bluffs du démon</h4>

                {afficherRepartition && !bluffsValides && (
                  <>
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
                      <div style={{ display: "flex", gap: "1.5rem" }}>
                        {bluffs.length === 3
                          ? rolesBonsNonAttribués
                              .filter((role) =>
                                bluffs.some((b) => b.nom === role.nom)
                              )
                              .map((role) => (
                                <img
                                  key={role.nom}
                                  src={`icons/icon_${normalizeNom(
                                    role.nom
                                  )}.png`}
                                  alt={role.nom}
                                  style={{
                                    height: "48px",
                                    width: "48px",
                                    objectFit: "contain",
                                  }}
                                />
                              ))
                          : [1, 2, 3].map((i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: "2.8rem",
                                  color: "#bbb",
                                  fontWeight: "bold",
                                  lineHeight: 1,
                                  margin: "0 0.2rem",
                                }}
                              >
                                ?
                              </span>
                            ))}
                      </div>
                    </div>
                  </>
                )}
                {afficherRepartition &&
                  choisirBluffsVisible &&
                  !bluffsValides && (
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
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                        }}
                      >
                        {rolesBonsNonAttribués.map((role) => {
                          const isSelected = bluffs.some(
                            (r) => r.nom === role.nom
                          );
                          const isDisabled = !isSelected && bluffs.length >= 3;
                          return (
                            <div
                              key={role.nom}
                              onClick={() => {
                                if (isSelected) {
                                  setBluffs(
                                    bluffs.filter((r) => r.nom !== role.nom)
                                  );
                                } else if (!isDisabled) {
                                  setBluffs([...bluffs, role]);
                                }
                                setErreurBluffs("");
                              }}
                              style={{
                                border: isSelected
                                  ? "2px solid #0e74b4"
                                  : "1px solid #ccc",
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
                                style={{
                                  width: 48,
                                  height: 48,
                                  objectFit: "contain",
                                }}
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
                          cursor:
                            bluffs.length === 3 ? "pointer" : "not-allowed",
                          opacity: bluffs.length === 3 ? 1 : 0.5,
                        }}
                        disabled={bluffs.length !== 3}
                      >
                        Valider bluffs
                      </button>
                    </div>
                  )}

                <h4>Joueurs</h4>

                {Object.entries(joueursAttribues).map(
                  ([index, joueur], idx) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
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
                      onClick={() =>
                        setNomEditModal({ index, nom: joueur.nom })
                      }
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
                        className="icon-lg"
                        style={{ marginRight: "0.5rem" }}
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

                        {(Array.isArray(joueur.anciensRoles)
                          ? joueur.anciensRoles
                          : []
                        ).map((r, idx) => (
                          <span
                            key={`${r.nom}-${idx}`}
                            title={`Ancien rôle : ${r.nom}`}
                            style={{
                              marginLeft: idx === 0 ? "0.5rem" : "0.2rem",
                              verticalAlign: "middle",
                            }}
                          >
                            <img
                              src={`icons/icon_${normalizeNom(r.nom)}.png`}
                              alt={r.nom}
                              className="icon-md"
                              style={{
                                width: 32,
                                height: 32,
                                verticalAlign: "middle",
                                objectFit: "contain",
                                filter:
                                  "grayscale(1) brightness(0.9) contrast(0.9)",
                                opacity: 0.85,
                              }}
                            />
                          </span>
                        ))}

                        {(Array.isArray(joueur.rappelRoles)
                          ? joueur.rappelRoles
                          : []
                        ).map((r, idx) => (
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
                              className="icon-md"
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* Bluffs du démon section */}
                {bluffsValides && bluffs.length === 3 ? (
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
                            .filter((role) =>
                              bluffs.some((b) => b.nom === role.nom)
                            )
                            .map((role) => (
                              <img
                                src={`icons/icon_${normalizeNom(role.nom)}.png`}
                                alt={role.nom}
                                className="icon-lg"
                              />
                            ))
                        : null}
                    </div>
                  </div>
                ) : null}
                {/* Modal pour éditer les bluffs — style identique à la modale "Script personnalisé" */}
                {editBluffsModal && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      background: "rgba(0,0,0,0.6)",
                      zIndex: 500,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* BOÎTE PLEIN ÉCRAN */}
                    <div
                      style={{
                        background: "#fff",
                        color: "#222",
                        position: "fixed",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        width: "auto",
                        height: "auto",
                        borderRadius: 0,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden", // le corps scrolle, pas l’en-tête
                        minHeight: "-webkit-fill-available",
                        paddingTop: "calc(1rem + env(safe-area-inset-top))",
                        paddingRight: "calc(1rem + env(safe-area-inset-right))",
                        paddingBottom:
                          "calc(1rem + env(safe-area-inset-bottom))",
                        paddingLeft: "calc(1rem + env(safe-area-inset-left))",
                        WebkitOverflowScrolling: "touch",
                        overscrollBehavior: "contain",
                        fontFamily: "Cardo, serif",
                        zIndex: 501,
                      }}
                      role="dialog"
                      aria-modal="true"
                    >
                      {/* CROIX FERMER */}
                      <button
                        onClick={() => setEditBluffsModal(false)}
                        style={{
                          position: "absolute",
                          top: "0.75rem",
                          right: "0.75rem",
                          border: "none",
                          background: "none",
                          fontSize: "1.5rem",
                          cursor: "pointer",
                          lineHeight: 1,
                        }}
                        aria-label="Fermer"
                      >
                        ×
                      </button>

                      <h3
                        style={{
                          marginTop: 0,
                          marginBottom: "1rem",
                          paddingRight: "2rem",
                          fontFamily: "Pirata One, cursive",
                        }}
                      >
                        Choisir les bluffs du démon
                      </h3>

                      {/* CORPS SCROLLABLE */}
                      <div
                        style={{
                          flex: 1,
                          overflow: "auto",
                          paddingBottom: "env(safe-area-inset-bottom)",
                        }}
                      >
                        {/* Grille responsive de sections par type */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "1rem",
                          }}
                        >
                          {["Habitant", "Étranger"].map((type) =>
                            rolesBonsNonAttribués.some(
                              (r) => r.type === type
                            ) ? (
                              <details
                                key={type}
                                className="collapsible"
                                open
                                style={{ marginBottom: ".5rem" }}
                              >
                                <summary
                                  style={{
                                    color: colorForType(type),
                                    fontWeight: "bold",
                                    fontSize: "calc(var(--h2-size) * 1)",
                                    fontFamily: "Cardo, serif",
                                  }}
                                >
                                  {typeToPlural[type]}{" "}
                                  <span style={{ opacity: 1 }}>
                                    (
                                    {
                                      editBluffsTemp.filter(
                                        (x) => x.type === type
                                      ).length
                                    }
                                    )
                                  </span>
                                </summary>

                                {/* Grille 2 colonnes de boutons (icône + nom coloré) */}
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                      "repeat(2, minmax(0, 1fr))",
                                    gap: ".5rem",
                                    marginTop: ".5rem",
                                  }}
                                >
                                  {rolesBonsNonAttribués
                                    .filter((r) => r.type === type)
                                    .map((role) => {
                                      const checked = editBluffsTemp.some(
                                        (x) => x.nom === role.nom
                                      );
                                      const disabled =
                                        !checked && editBluffsTemp.length >= 3;
                                      const color = colorForType(type);
                                      return (
                                        <button
                                          key={role.nom}
                                          type="button"
                                          aria-pressed={checked}
                                          disabled={disabled}
                                          onClick={() =>
                                            setEditBluffsTemp((prev) =>
                                              checked
                                                ? prev.filter(
                                                    (x) => x.nom !== role.nom
                                                  )
                                                : prev.length < 3
                                                ? [...prev, role]
                                                : prev
                                            )
                                          }
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: ".5rem",
                                            padding: ".45rem .6rem",
                                            borderRadius: 8,
                                            border: checked
                                              ? `2px solid ${color}`
                                              : "1px solid #ccc",
                                            background: checked
                                              ? "rgba(0,0,0,0.03)"
                                              : "#fff",
                                            cursor: disabled
                                              ? "not-allowed"
                                              : "pointer",
                                            textAlign: "left",
                                            width: "100%",
                                            opacity: disabled ? 0.5 : 1,
                                          }}
                                        >
                                          <img
                                            src={getRoleIcon(role)}
                                            alt=""
                                            style={{
                                              width: 24,
                                              height: 24,
                                              borderRadius: 4,
                                              border: "1px solid #ddd",
                                              flex: "0 0 auto",
                                            }}
                                            onError={(ev) =>
                                              (ev.currentTarget.style.display =
                                                "none")
                                            }
                                          />
                                          <span
                                            style={{
                                              color,
                                              fontWeight: "bold",
                                            }}
                                          >
                                            {role.nom}
                                          </span>
                                        </button>
                                      );
                                    })}
                                </div>
                              </details>
                            ) : null
                          )}
                        </div>
                      </div>

                      {/* PIED (visible en bas) */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "1rem",
                        }}
                      >
                        <button
                          onClick={() => setEditBluffsTemp([])}
                          style={{
                            padding: ".5rem 1rem",
                            borderRadius: 8,
                            border: "1px solid #bbb",
                            background: "#f5f5f5",
                          }}
                        >
                          Vider
                        </button>
                        <div style={{ display: "flex", gap: ".5rem" }}>
                          <button
                            onClick={() => {
                              const pool = [...rolesBonsNonAttribués];
                              for (let i = pool.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [pool[i], pool[j]] = [pool[j], pool[i]];
                              }
                              setEditBluffsTemp(
                                pool.slice(0, Math.min(3, pool.length))
                              );
                            }}
                            style={{
                              padding: ".5rem 1rem",
                              borderRadius: 8,
                              border: "1px solid #bbb",
                              background: "#f5f5f5",
                            }}
                          >
                            Sélection aléatoire
                          </button>
                          <button
                            onClick={() => {
                              if (editBluffsTemp.length === 3) {
                                // Respecte l’ordre d’affichage de la liste filtrée
                                const ordered = rolesBonsNonAttribués.filter(
                                  (r) =>
                                    editBluffsTemp.some((b) => b.nom === r.nom)
                                );
                                setBluffs(ordered);
                                setEditBluffsModal(false);
                              }
                            }}
                            disabled={editBluffsTemp.length !== 3}
                            style={{
                              padding: ".5rem 1rem",
                              borderRadius: 8,
                              border: "1px solid #0e74b4",
                              background: "#0e74b4",
                              color: "#fff",
                              opacity: editBluffsTemp.length === 3 ? 1 : 0.6,
                              cursor:
                                editBluffsTemp.length === 3
                                  ? "pointer"
                                  : "not-allowed",
                            }}
                          >
                            Valider ({editBluffsTemp.length}/3)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal for editing player name - FULLSCREEN */}
                {nomEditModal &&
                  (() => {
                    const joueur = joueursAttribues[nomEditModal.index];
                    const role = joueur?.role;

                    const typeOrder = [
                      "Habitant",
                      "Étranger",
                      "Acolyte",
                      "Démon",
                    ];
                    const rappelRoles = (
                      edition === "Script personnalisé"
                        ? customScriptPool
                        : roles.filter((r) => r.edition === edition)
                    )
                      .filter((r) => r.rappel)
                      .sort(
                        (a, b) =>
                          typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
                      );

                    return (
                      <div
                        style={{
                          position: "fixed",
                          inset: 0,
                          background: "grey",
                          color: "white",
                          zIndex: 9999,
                          display: "flex",
                          flexDirection: "column",

                          // safe-areas iOS
                          paddingTop: "env(safe-area-inset-top)",
                          paddingRight: "env(safe-area-inset-right)",
                          paddingBottom: "env(safe-area-inset-bottom)",
                          paddingLeft: "env(safe-area-inset-left)",
                        }}
                        role="dialog"
                        aria-modal="true"
                      >
                        {/* HEADER sticky */}
                        <div
                          style={{
                            position: "sticky",
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.75rem 1rem",
                            background: "rgba(0,0,0,0.2)",
                            backdropFilter: "blur(2px)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: ".5rem",
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "Pirata One, cursive",
                                fontSize: "1.25rem",
                                lineHeight: 1.1,
                              }}
                            >
                              Modifier le joueur
                            </div>
                          </div>

                          <button
                            onClick={() => setNomEditModal(null)}
                            style={{
                              border: "none",
                              background: "none",
                              color: "white",
                              fontSize: "1.8rem",
                              cursor: "pointer",
                              lineHeight: 1,
                            }}
                            aria-label="Fermer"
                          >
                            ×
                          </button>
                        </div>

                        {/* BODY scrollable */}
                        <div
                          style={{
                            flex: 1,
                            overflow: "auto",
                            padding: "1rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                          }}
                        >
                          {/* Rôle (titre + pouvoir) */}
                          {role && (
                            <div style={{ textAlign: "left" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: ".5rem",
                                  marginBottom: ".25rem",
                                }}
                              >
                                <img
                                  src={`icons/icon_${normalizeNom(
                                    role.nom
                                  )}.png`}
                                  alt={role.nom}
                                  style={{
                                    width: 36,
                                    height: 36,
                                    objectFit: "contain",
                                  }}
                                />
                                <div
                                  style={{
                                    fontFamily: "Cardo, serif",
                                    fontWeight: "bold",
                                    fontSize: "1.2rem",
                                  }}
                                >
                                  {role.nom}
                                </div>
                              </div>
                              <div
                                style={{
                                  fontFamily: "Cardo, serif",
                                  fontSize: "1rem",
                                  color: "white",
                                  opacity: 0.95,
                                  maxWidth: "70ch",
                                  wordBreak: "break-word",
                                }}
                              >
                                {renderBoldBrackets(
                                  role.description ||
                                    role.pouvoir ||
                                    "Pouvoir du rôle..."
                                )}
                              </div>
                            </div>
                          )}

                          {/* Champ nom (maj en direct) */}
                          <div>
                            <input
                              className="important-field"
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
                              placeholder="Nom du joueur"
                              readOnly
                              onFocus={(e) =>
                                e.target.removeAttribute("readOnly")
                              }
                              style={{
                                width: "100%",
                                fontSize: "1.2rem",
                                padding: "0.7rem 0.9rem",
                                borderRadius: 10,
                                border: "1px solid rgba(255,255,255,0.6)",
                                background: "rgba(255,255,255,0.15)",
                                color: "white",
                                outline: "none",
                                backdropFilter: "blur(2px)",
                              }}
                            />
                          </div>

                          {/* Switch alignement + icônes historiques & rappels */}
                          {role && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: ".5rem",
                              }}
                            >
                              {/* Switch Bon/Maléfique */}
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr", // 2 colonnes égales
                                  width: "100%",
                                  borderRadius: 8,
                                  gap: "0.5rem",
                                  overflow: "hidden", // arrondi net
                                  margin: "0.5rem 0",
                                }}
                              >
                                {/* Bouton Bon */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setJoueursAttribues((prev) => {
                                      const updated = { ...prev };
                                      updated[nomEditModal.index] = {
                                        ...updated[nomEditModal.index],
                                        alignement: "Bon",
                                        alignementFixe: true,
                                      };
                                      return updated;
                                    });
                                  }}
                                  style={{
                                    padding: "0.75rem",
                                    fontFamily: "Cardo, serif",
                                    fontSize: "1.1rem",
                                    cursor: "pointer",
                                    border: "none",
                                    color: "white",
                                    background:
                                      joueur?.alignement === "Bon"
                                        ? "#0e74b4"
                                        : "rgba(200,200,200,0.3)",
                                    transition: "background 0.2s",
                                  }}
                                >
                                  Bon
                                </button>

                                {/* Bouton Maléfique */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setJoueursAttribues((prev) => {
                                      const updated = { ...prev };
                                      updated[nomEditModal.index] = {
                                        ...updated[nomEditModal.index],
                                        alignement: "Maléfique",
                                        alignementFixe: true,
                                      };
                                      return updated;
                                    });
                                  }}
                                  style={{
                                    padding: "0.75rem",
                                    fontFamily: "Cardo, serif",
                                    fontSize: "1.1rem",
                                    cursor: "pointer",
                                    border: "none",
                                    color: "white",
                                    background:
                                      joueur?.alignement === "Maléfique"
                                        ? "#950f13"
                                        : "rgba(200,200,200,0.3)",
                                    transition: "background 0.2s",
                                  }}
                                >
                                  Maléfique
                                </button>
                              </div>

                              {/* Icônes des anciens rôles (grisées) */}
                              {(Array.isArray(joueur?.anciensRoles)
                                ? joueur.anciensRoles
                                : []
                              ).map((r, idx) => (
                                <span
                                  key={`ancien-${r.nom}-${idx}`}
                                  title={`Ancien rôle : ${r.nom}`}
                                  style={{
                                    marginLeft: idx === 0 ? "0.5rem" : "0.2rem",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  <img
                                    src={`icons/icon_${normalizeNom(
                                      r.nom
                                    )}.png`}
                                    alt={r.nom}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      verticalAlign: "middle",
                                      objectFit: "contain",
                                      filter:
                                        "grayscale(1) brightness(0.9) contrast(0.9)",
                                      opacity: 0.85,
                                    }}
                                  />
                                </span>
                              ))}

                              {/* Icônes de rappels (actuels) */}
                              {joueur?.rappelRoles &&
                                joueur.rappelRoles.length > 0 &&
                                joueur.rappelRoles.map((r) => (
                                  <span
                                    key={`rappel-${r.nom}`}
                                    style={{ marginLeft: "0.2rem" }}
                                  >
                                    <img
                                      src={`icons/icon_${normalizeNom(
                                        r.nom
                                      )}.png`}
                                      alt={r.nom}
                                      style={{
                                        width: 28,
                                        height: 28,
                                        verticalAlign: "middle",
                                        objectFit: "contain",
                                      }}
                                    />
                                  </span>
                                ))}
                            </div>
                          )}

                          {/* Actions principales (Rappels / Changer de rôle / Mort / Vote etc.) */}
                          {/* Rappels */}
                          <div style={{ position: "relative" }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRappelModal(true);
                              }}
                              style={{
                                padding: "0.5rem 1.2rem",
                                width: "100%",
                                fontFamily: "Cardo, serif",
                                fontSize: "1.05rem",
                                cursor: "pointer",
                                background: "#bdbdbdff",
                                color: "#222",
                                borderRadius: 8,
                                border: "none",
                              }}
                            >
                              Rappels
                            </button>

                            {showRappelModal &&
                              (() => {
                                const joueur =
                                  joueursAttribues[nomEditModal.index];
                                const typeOrder = [
                                  "Habitant",
                                  "Étranger",
                                  "Acolyte",
                                  "Démon",
                                ];
                                const pool =
                                  edition === "Script personnalisé"
                                    ? customScriptPool
                                    : roles.filter(
                                        (r) => r.edition === edition
                                      );
                                const rappelRoles = pool
                                  .filter((r) => r.rappel !== false)
                                  .sort(
                                    (a, b) =>
                                      typeOrder.indexOf(a.type) -
                                      typeOrder.indexOf(b.type)
                                  );

                                const current = Array.isArray(
                                  joueur?.rappelRoles
                                )
                                  ? joueur.rappelRoles
                                  : [];

                                return (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: "fixed",
                                      inset: 0,
                                      background: "grey",
                                      color: "white",
                                      zIndex: 100000,
                                      display: "flex",
                                      flexDirection: "column",
                                      paddingTop: "env(safe-area-inset-top)",
                                      paddingBottom:
                                        "env(safe-area-inset-bottom)",
                                      paddingLeft: "env(safe-area-inset-left)",
                                      paddingRight:
                                        "env(safe-area-inset-right)",
                                    }}
                                    role="dialog"
                                    aria-modal="true"
                                  >
                                    {/* HEADER sticky */}
                                    <div
                                      style={{
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "0.75rem 1rem",
                                        background: "rgba(0,0,0,0.2)",
                                        backdropFilter: "blur(2px)",
                                      }}
                                    >
                                      <h3
                                        style={{
                                          margin: 0,
                                          fontFamily: "Pirata One, cursive",
                                          fontSize: "1.4rem",
                                        }}
                                      >
                                        Sélectionner les rappels
                                      </h3>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setShowRappelModal(false)
                                        }
                                        aria-label="Fermer"
                                        style={{
                                          border: "none",
                                          background: "none",
                                          color: "white",
                                          fontSize: "1.8rem",
                                          cursor: "pointer",
                                          lineHeight: 1,
                                        }}
                                      >
                                        ×
                                      </button>
                                    </div>

                                    {/* BODY scrollable */}
                                    <div
                                      style={{
                                        flex: 1,
                                        overflow: "auto",
                                        padding: "1rem",
                                        display: "grid",
                                        gridTemplateColumns: "1fr",
                                        gap: "0.6rem",
                                      }}
                                    >
                                      {rappelRoles.map((r) => {
                                        const isOn = current.some(
                                          (x) => x.nom === r.nom
                                        );
                                        const onToggle = () => {
                                          setJoueursAttribues((attribues) => {
                                            const updated = { ...attribues };
                                            const cur =
                                              updated[nomEditModal.index] || {};
                                            const curList = Array.isArray(
                                              cur.rappelRoles
                                            )
                                              ? cur.rappelRoles
                                              : [];
                                            updated[nomEditModal.index] = {
                                              ...cur,
                                              rappelRoles: isOn
                                                ? curList.filter(
                                                    (x) => x.nom !== r.nom
                                                  )
                                                : [...curList, r],
                                            };
                                            return updated;
                                          });
                                        };

                                        return (
                                          <button
                                            key={r.nom}
                                            type="button"
                                            onClick={onToggle}
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: ".5rem",
                                              padding: ".55rem .65rem",
                                              borderRadius: 10,
                                              border: isOn
                                                ? "2px solid #0e74b4"
                                                : "1px solid #ccc",
                                              background: isOn
                                                ? "rgba(14,116,180,0.25)"
                                                : "rgba(255,255,255,0.1)",
                                              cursor: "pointer",
                                              textAlign: "left",
                                              width: "100%",
                                              color: "white",
                                            }}
                                          >
                                            <img
                                              src={`icons/icon_${normalizeNom(
                                                r.nom
                                              )}.png`}
                                              alt={r.nom}
                                              style={{
                                                width: 24,
                                                height: 24,
                                                objectFit: "contain",
                                              }}
                                              onError={(e) =>
                                                (e.currentTarget.style.display =
                                                  "none")
                                              }
                                            />
                                            <div
                                              style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                lineHeight: 1.15,
                                              }}
                                            >
                                              <span
                                                style={{
                                                  fontFamily:
                                                    "'IM Fell English SC', serif",
                                                  fontSize: "1.2rem",
                                                  color:
                                                    r.alignement === "Bon"
                                                      ? "#0e74b4"
                                                      : r.alignement ===
                                                        "Maléfique"
                                                      ? "#950f13"
                                                      : "white",
                                                }}
                                              >
                                                {r.nom}
                                              </span>
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })()}
                          </div>

                          {/* Changer de rôle */}
                          <div style={{ position: "relative" }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRemplacerDropdown(true);
                              }}
                              style={{
                                padding: "0.5rem 1.2rem",
                                fontFamily: "Cardo, serif",
                                fontSize: "1.05rem",
                                width: "100%",
                                cursor: "pointer",
                                background: "#0e74b4",
                                color: "#fff",
                                borderRadius: 8,
                                border: "none",
                              }}
                            >
                              Changer de rôle
                            </button>

                            {showRemplacerDropdown &&
                              (() => {
                                const joueur =
                                  joueursAttribues?.[nomEditModal.index];
                                const currentRole = joueur?.role || null;

                                const pool =
                                  edition === "Script personnalisé"
                                    ? customScriptPool
                                    : roles.filter(
                                        (r) => r.edition === edition
                                      );

                                const typeOrder = [
                                  "Habitant",
                                  "Étranger",
                                  "Acolyte",
                                  "Démon",
                                ];
                                const candidats = pool
                                  .filter((r) => r.nom !== currentRole?.nom) // pas le même rôle
                                  .sort((a, b) => {
                                    const t =
                                      typeOrder.indexOf(a.type) -
                                      typeOrder.indexOf(b.type);
                                    if (t !== 0) return t;
                                    return a.nom.localeCompare(b.nom, "fr");
                                  });

                                return (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    role="dialog"
                                    aria-modal="true"
                                    style={{
                                      position: "fixed",
                                      inset: 0,
                                      background: "grey",
                                      color: "white",
                                      zIndex: 100000,
                                      display: "flex",
                                      flexDirection: "column",
                                      paddingTop: "env(safe-area-inset-top)",
                                      paddingBottom:
                                        "env(safe-area-inset-bottom)",
                                      paddingLeft: "env(safe-area-inset-left)",
                                      paddingRight:
                                        "env(safe-area-inset-right)",
                                    }}
                                  >
                                    {/* HEADER sticky */}
                                    <div
                                      style={{
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "0.75rem 1rem",
                                        background: "rgba(0,0,0,0.2)",
                                        backdropFilter: "blur(2px)",
                                      }}
                                    >
                                      <h3
                                        style={{
                                          margin: 0,
                                          fontFamily: "Pirata One, cursive",
                                          fontSize: "1.4rem",
                                        }}
                                      >
                                        Sélectionner le nouveau rôle
                                      </h3>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setShowRemplacerDropdown(false)
                                        }
                                        aria-label="Fermer"
                                        style={{
                                          border: "none",
                                          background: "none",
                                          color: "white",
                                          fontSize: "1.8rem",
                                          cursor: "pointer",
                                          lineHeight: 1,
                                        }}
                                      >
                                        ×
                                      </button>
                                    </div>

                                    {/* BODY scrollable : 1 rôle par ligne, icône à gauche, texte à droite */}
                                    <div
                                      style={{
                                        flex: 1,
                                        overflow: "auto",
                                        padding: "1rem",
                                        display: "grid",
                                        gridTemplateColumns: "1fr",
                                        gap: "0.6rem",
                                      }}
                                    >
                                      {candidats.map((r) => (
                                        <button
                                          key={r.nom}
                                          type="button"
                                          onClick={() => {
                                            // 1) Remplacer le rôle + historiser l'ancien si différent
                                            setJoueursAttribues((prev) => {
                                              const updated = { ...prev };
                                              const idx = nomEditModal.index;
                                              const cur = updated[idx] || {};
                                              const oldRole = cur.role;
                                              const history = Array.isArray(
                                                cur.anciensRoles
                                              )
                                                ? cur.anciensRoles
                                                : [];
                                              const newHistory =
                                                oldRole && oldRole.nom !== r.nom
                                                  ? [...history, oldRole]
                                                  : history;

                                              updated[idx] = {
                                                ...cur,
                                                role: r,
                                                anciensRoles: newHistory,
                                                // alignement inchangé (attaché au joueur)
                                              };
                                              return updated;
                                            });

                                            // 2) Mettre à jour la liste "selected" (ordre de réveil)
                                            setSelected((prev) => {
                                              const withoutOld = prev.filter(
                                                (x) =>
                                                  x.nom !== currentRole?.nom
                                              );
                                              const withoutDup =
                                                withoutOld.filter(
                                                  (x) => x.nom !== r.nom
                                                );
                                              return [...withoutDup, r];
                                            });

                                            // 3) Fermer la modale
                                            setShowRemplacerDropdown(false);
                                          }}
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: ".6rem",
                                            padding: ".8rem 1rem",
                                            borderRadius: 10,
                                            border:
                                              r.alignement === "Bon"
                                                ? "2px solid #0e74b4"
                                                : "2px solid #950f13",
                                            background:
                                              r.alignement === "Bon"
                                                ? "rgba(14,116,180,0.25)"
                                                : "rgba(149,15,19,0.25)",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            width: "100%",
                                            color: "white",
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
                                              objectFit: "contain",
                                            }}
                                            onError={(e) =>
                                              (e.currentTarget.style.display =
                                                "none")
                                            }
                                          />
                                          <span
                                            style={{
                                              fontFamily:
                                                "'IM Fell English SC', serif",
                                              fontSize: "1.1rem",
                                              color:
                                                r.alignement === "Bon"
                                                  ? "#9dd7ff"
                                                  : r.alignement === "Maléfique"
                                                  ? "#ff9999"
                                                  : "white",
                                            }}
                                          >
                                            {r.nom}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                          </div>

                          {/* Mort (toggle) — donne par défaut un jeton au décès */}
                          <button
                            onClick={() =>
                              setJoueursAttribues((prev) => {
                                const updated = { ...prev };
                                const cur = updated[nomEditModal.index] || {};
                                const nextMort = !cur.mort;
                                updated[nomEditModal.index] = {
                                  ...cur,
                                  mort: nextMort,
                                  // Inversé : s’il meurt → jeton disponible (true), sinon → false
                                  token: nextMort ? true : false,
                                };
                                return updated;
                              })
                            }
                            style={{
                              padding: "0.5rem 1.2rem",
                              fontFamily: "Cardo, serif",
                              fontSize: "1.05rem",
                              cursor: "pointer",
                              borderRadius: 8,
                              border: "none",
                              background: joueur?.mort ? "#0e74b4" : "#950f13",
                              color: joueur?.mort ? "#fff" : "#fff",
                            }}
                            title={joueur?.mort ? "Ressusciter" : "Mort"}
                          >
                            {joueur?.mort ? "Ressusciter" : "Mort"}
                          </button>

                          {/* Jeton (toggle) — affiché uniquement si mort */}
                          {joueur?.mort && (
                            <button
                              onClick={() =>
                                setJoueursAttribues((prev) => {
                                  const updated = { ...prev };
                                  const cur = updated[nomEditModal.index] || {};
                                  updated[nomEditModal.index] = {
                                    ...cur,
                                    token: !cur.token,
                                  };
                                  return updated;
                                })
                              }
                              style={{
                                padding: "0.5rem 1.2rem",
                                fontFamily: "Cardo, serif",
                                fontSize: "1.05rem",
                                cursor: "pointer",
                                borderRadius: 8,
                                border: "none",
                                background: joueur?.token
                                  ? "#E5A614"
                                  : "#950f13",
                                color: "#fff",
                              }}
                              title={
                                joueur?.token
                                  ? "Le joueur a encore son vote"
                                  : "Le joueur a déjà utilisé son vote"
                              }
                            >
                              {joueur?.token ? "Vote fantôme" : "Vote utilisé"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
              </div>
            </details>
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
              {edition === "Script personnalisé" &&
                customScriptPool.length > 0 && (
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
                      .filter((role) => bluffs.some((b) => b.nom === role.nom))
                      .map((role) => (
                        <div key={role.nom} style={{ textAlign: "center" }}>
                          <img
                            src={`icons/icon_${normalizeNom(role.nom)}.png`}
                            alt={role.nom}
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: "contain",
                            }}
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
            <details
              className="collapsible"
              open={jetonsInfoVisible}
              onToggle={(e) => setJetonsInfoVisible(e.currentTarget.open)}
            >
              <summary>Communication</summary>
              {/* Rôles button for communication */}
              <div
                style={{
                  width: "100%",
                  marginBottom: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7rem",
                }}
              >
                {jetonsInfoButtons.map((btn, idx) =>
                  idx === 2 ? (
                    <React.Fragment key={btn.label + "-roles"}>
                      <button
                        key={btn.label}
                        style={{
                          ...buttonStyle,
                          background: btn.color,
                          color: "#fff",
                          //fontWeight: "bold",
                          fontSize: "1.1rem",
                          fontFamily: "Cardo, serif",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                          margin: 0,
                          width: "100%",
                          alignSelf: "stretch",
                        }}
                        onClick={() => setJetonInfoPage(btn.page)}
                      >
                        {btn.label}
                      </button>
                      <button
                        key="roles-btn"
                        style={{
                          ...buttonStyle,
                          background: "#222",
                          color: "#fff",
                          // fontWeight: "bold",
                          fontSize: "1.1rem",
                          fontFamily: "Cardo, serif",
                          minWidth: "180px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        }}
                        onClick={() => setRolesModalOpen(true)}
                      >
                        Rôles
                      </button>
                    </React.Fragment>
                  ) : (
                    <button
                      key={btn.label}
                      style={{
                        ...buttonStyle,
                        background: btn.color,
                        color: "#fff",
                        //fontWeight: "bold",
                        fontSize: "1.1rem",
                        fontFamily: "Cardo, serif",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        margin: 0,
                        width: "100%",
                        alignSelf: "stretch",
                      }}
                      onClick={() => setJetonInfoPage(btn.page)}
                    >
                      {btn.label}
                    </button>
                  )
                )}
                {/* Ajout des messages personnalisés juste après le dernier bouton Communication */}
                {customJetons.length > 0 && (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {customJetons.map((txt, idx) => (
                      <button
                        key={"custom-" + idx}
                        style={{
                          ...buttonStyle,
                          background: "#f5e3c3", // beige
                          color: "#222",
                          width: "100%",
                          alignSelf: "stretch",
                          //fontWeight: "bold",
                          fontSize: "1.1rem",
                          border: "1px solid #bbb",
                        }}
                        onClick={() => setJetonInfoPage(`custom-${idx}`)}
                      >
                        {txt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Modal for roles selection */}
              {rolesModalOpen && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "#fff",
                    zIndex: 400,
                    display: "flex",
                    alignItems: "stretch",
                    justifyContent: "stretch",
                  }}
                >
                  <div
                    style={{
                      width: "100vw",
                      height: "100vh",
                      background: "#fff",
                      color: "#222",
                      borderRadius: 0,
                      boxShadow: "none",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Sticky header */}
                    <div
                      style={{
                        position: "sticky",
                        top: 0,
                        left: 0,
                        width: "100%",
                        background: "#fff",
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "2rem 2rem 0 2rem",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <h2
                        style={{
                          marginBottom: 0,
                          fontWeight: "bold",
                          fontFamily: "Pirata One, cursive",
                          fontSize: "1.35rem",
                        }}
                      >
                        Afficher un rôle
                      </h2>
                      <button
                        onClick={() => setRolesModalOpen(false)}
                        style={{
                          fontSize: "1.5rem",
                          color: "#333",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          marginLeft: "1rem",
                        }}
                      >
                        ×
                      </button>
                    </div>
                    {/* Scrollable content below sticky header */}
                    <div
                      style={{
                        width: "100%",
                        flex: 1,
                        overflowY: "auto",
                        padding: "1.2rem 2rem 1.2rem 2rem",
                      }}
                    >
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
                                  fontFamily: "IM Fell English SC, serif",
                                  marginBottom: "0.5rem",
                                  color: "black",
                                }}
                              >
                                {type}
                              </div>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr",
                                  gap: "0.5rem",
                                }}
                              >
                                {types[type].map((role) => (
                                  <button
                                    key={role.nom}
                                    style={{
                                      background: "#f7f7fa",
                                      color: "#156",
                                      border: "1px solid #cdd",
                                      borderRadius: "8px",
                                      fontWeight: "bold",
                                      fontSize: "1rem",
                                      padding: "0.4rem 0.7rem 0.4rem 0.5rem",
                                      marginBottom: "0.2rem",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.7rem",
                                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                                      transition:
                                        "background 0.2s, color 0.2s, border 0.2s",
                                      minHeight: "40px",
                                    }}
                                    onClick={() => {
                                      setSelectedRole(role);
                                      setRolesModalOpen(false);
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "32px",
                                        width: "32px",
                                      }}
                                    >
                                      <img
                                        src={getRoleIcon(role)}
                                        alt={role.nom}
                                        style={{
                                          width: "28px",
                                          height: "28px",
                                          borderRadius: "4px",
                                          border: "none",
                                          objectFit: "contain",
                                          display: "block",
                                        }}
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                    </div>
                                    <span
                                      style={{
                                        flex: 1,
                                        textAlign: "left",
                                        display: "block",
                                      }}
                                    >
                                      {role.nom}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ));
                      })()}
                    </div>
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
                    background: "#fff",
                    zIndex: 401,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={() => setSelectedRole(null)}
                    style={{
                      position: "absolute",
                      top: "1.2rem",
                      right: "1.2rem",
                      fontSize: "2.2rem",
                      color: "black",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      zIndex: 2,
                    }}
                  >
                    ×
                  </button>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "420px",
                      margin: "0 auto",
                      textAlign: "center",
                      padding: "3.5rem 1.5rem 2.5rem 1.5rem",
                      color:
                        selectedRole.alignement === "Bon"
                          ? "#0e74b4"
                          : selectedRole.alignement === "Maléfique"
                          ? "#950f13"
                          : "#222",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        marginBottom: "2rem",
                      }}
                    >
                      <img
                        src={getRoleIcon(selectedRole)}
                        alt={selectedRole.nom}
                        style={{
                          width: "150px",
                          height: "150px",
                          background: "none",
                          borderRadius: 0,
                          border: "none",
                          display: "block",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <h2
                      style={{
                        marginBottom: "1.2rem",
                        fontSize: "3rem",
                        fontFamily: "IM Fell English SC, serif",
                        fontWeight: 700,
                      }}
                    >
                      {selectedRole.nom}
                    </h2>
                    <div
                      style={{
                        fontSize: "1.15rem",
                        fontFamily: "Cardo, serif",
                      }}
                    >
                      {renderBoldBrackets(selectedRole.pouvoir)}
                    </div>
                  </div>
                </div>
              )}
              <button
                style={{ ...buttonStyle, width: "100%" }}
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
                        color: "black",
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
            </details>
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
                      : jetonsInfoButtons.find(
                          (btn) => btn.page === jetonInfoPage
                        )?.content}
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
            ></div>
            <details
              className="collapsible"
              open={afficherNotes}
              onToggle={(e) => setAfficherNotes(e.currentTarget.open)}
            >
              <summary>Notes</summary>
              {/* ⬇️ Contenu toujours rendu ; c'est <details> qui l'affiche/masque */}
              <div
                style={{
                  marginTop: "1rem",
                  color: "black",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={10}
                  style={{
                    width: "100%", // responsive
                    maxWidth: "600px", // limite comme avant
                    fontFamily: "Cardo, serif",
                    fontSize: "1.2rem",
                    borderRadius: 0,
                    border: "1px solid #ccc",
                    padding: "0.5rem",
                    resize: "vertical",
                    background: "#ffe9a7ff",
                    color: "#222",
                    marginBottom: "0rem",
                  }}
                />
                <div style={{ marginTop: "1rem" }}>
                  <button
                    className="btn"
                    style={{ ...buttonStyle, width: "100%" }}
                    onClick={clearNotes}
                  >
                    Effacer les notes
                  </button>
                </div>
              </div>{" "}
              {/* ← ferme le conteneur des notes */}
            </details>{" "}
            {/* ← ferme le collapsible */}
            <details
              className="collapsible"
              open={afficherMentions}
              onToggle={(e) => setAfficherMentions(e.currentTarget.open)}
            >
              <summary>Mentions légales</summary>
              <div
                style={{
                  marginTop: "1rem",
                  color: "black",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0rem",
                  maxWidth: "800px",
                }}
              >
                <p style={{ fontFamily: "Cardo, serif" }}>
                  <strong style={{ color: "#950f13" }}>
                    Minuit sonne rouge
                  </strong>{" "}
                  est une version francisée du jeu{" "}
                  <strong>Blood on the Clocktower</strong>, réalisée par un fan.
                </p>

                <p style={{ fontFamily: "Cardo, serif" }}>
                  <strong>Blood on the Clocktower</strong> est une marque
                  déposée de Steven Medway et The Pandemonium Institute.
                </p>
                <p style={{ fontFamily: "Cardo, serif" }}>
                  Cette application est un grimoire virtuel non officiel et
                  gratuit. Elle n’est pas affilié à Steven Medway ou The
                  Pandemonium Institute.
                </p>
                <ul style={{ marginLeft: "0rem", fontFamily: "Cardo, serif" }}>
                  <li>Traduction des textes&nbsp;: Valentin Janequin</li>
                  <li>
                    Source d’images et textes &nbsp;:&nbsp;
                    <a
                      href="https://wiki.bloodontheclocktower.com/Main_Page"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Wiki offciel
                    </a>
                  </li>
                </ul>

                <p style={{ fontFamily: "Cardo, serif", opacity: 1 }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      textAlign: "center",
                      marginTop: "2rem",
                    }}
                  >
                    <strong>v{pkg.version}</strong>
                  </div>
                </p>
              </div>
            </details>
          </div>
        </div>
      </main>
    </div>
  );
}
