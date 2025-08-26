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
  background: "#f5F5F5",

  color: "#222",
  cursor: "pointer",
  transition: "background 0.2s, color 0.2s, border 0.2s",
};
const selectBaseStyle = {
  fontSize: "1rem",
  fontFamily: "Cardo, serif",
  padding: "0.25rem 0.5rem",
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#fff",
  appearance: "auto",
};

export default function App() {
  // Liste figée des rôles bons non attribués au moment de l'attribution des rôles
  const [bluffsPoolInitial, setBluffsPoolInitial] = useState(null);
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
      color: "#222",
      page: "demon",
      content: "Voici le démon",
      textColor: "#222",
      background: "#f5F5F5",

      border: "1px solid #bbb",
      fontFamily: "Cardo, serif",
    },
    {
      label: "Voici tes acolytes",
      color: "#222",
      page: "acolytes",
      content: "Voici tes acolytes",
      textColor: "#222",
      background: "#f5F5F5",

      border: "1px solid #bbb",
      fontFamily: "Cardo, serif",
    },
    {
      label: "Bluffs du démon",
      color: "#222",
      page: "not-in-game",
      content: "Ces rôles ne sont pas en jeu",
      textColor: "#222",
      background: "#f5F5F5",

      border: "1px solid #bbb",
      fontFamily: "Cardo, serif",
    },
    {
      label: "Afficher un rôle",
      color: "#222",
      page: "roles",
      content: "Afficher un rôle",
      textColor: "#222",
      background: "#f5F5F5",

      border: "1px solid #bbb",
      fontFamily: "Cardo, serif",
    },
    {
      label: "Tu es",
      color: "#222",
      page: "you-are",
      content: "Tu es",
      textColor: "#222",
      background: "#f5F5F5",

      border: "1px solid #bbb",
      fontFamily: "Cardo, serif",
    },
    {
      label: "Ce joueur est",
      color: "#222",
      page: "player-is",
      content: "Ce joueur est",
      textColor: "#222",
      background: "#f5F5F5",

      border: "1px solid #bbb",
      fontFamily: "Cardo, serif",
    },
    {
      label: "Utiliser ton pouvoir ?",
      color: "#222",
      page: "use-power",
      content: "Utiliser ton pouvoir ?",
      textColor: "#222",
      background: "#f5F5F5",

      border: "1px solid #bbb",
      fontFamily: "Cardo, serif",
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
    // Figer la liste des rôles bons non attribués pour les bluffs du démon
    if (bluffsPoolInitial === null) {
      const nomsRolesAttribues = Object.values(joueursAttribues).map(
        (j) => j.role.nom
      );
      const pool = (
        edition === "Script personnalisé"
          ? customScriptPool
          : roles.filter((r) => r.edition === edition)
      ).filter(
        (r) => r.alignement === "Bon" && !nomsRolesAttribues.includes(r.nom)
      );
      setBluffsPoolInitial(pool);
    }
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
        rappelRoles: [], // ← chaque joueur a sa liste de rappels
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
  // Liste figée des bluffs du démon
  const rolesBonsNonAttribués =
    bluffsPoolInitial !== null
      ? bluffsPoolInitial
      : (edition === "Script personnalisé"
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
    font-family: 'IM Fell English SC', serif;
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
  /* Uniformiser la taille des icônes (rappels, anciens rôles, mort, vote, etc.) */

  .icon-img {
    width: 1.6em;
    height: 1.6em;
    object-fit: contain;
    vertical-align: middle;
    flex: 0 0 auto;
  }

  .icon-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.3em;
    min-height: 2em;
  }

@media (max-width: 420px) {
  .icon-img { width: 1.4em; height: 1.4em; }
}

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
                className="titre-principal"
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#950f13",
                  lineHeight: "1.1",
                }}
              >
                Minuit Sonne Rouge
              </span>

              <span
                style={{
                  fontFamily: "IM Fell English SC, serif",
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
                    ...selectBaseStyle,
                    marginLeft: "0.5rem",
                    width: "auto", // même look, largeur contenu (pas plein écran)
                  }}
                >
                  {Array.from({ length: 11 }, (_, i) => i + 5).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>

              {/* Stat grid — remplace le tableau */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "0.5rem",
                  width: "100%",
                }}
              >
                {[
                  { label: "Habitants", key: "Habitants" },
                  { label: "Acolytes", key: "Acolytes" },
                  { label: "Étrangers", key: "Étrangers" },
                  { label: "Démons", key: "Démons" },
                ].map(({ label, key }) => {
                  const color =
                    lignes.find((l) => l.label === label)?.color || "#222";
                  const value = tableRepartition[nbJoueurs]?.[key] ?? 0;
                  return (
                    <div
                      key={label}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 12,
                        padding: "0.6rem 0.75rem",
                        background: "#fafafa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'IM Fell English SC', serif",
                          fontSize: "1.1rem",
                          color,
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontFamily: "Cardo, serif",
                          fontWeight: "bold",
                          fontSize: "1.4rem",
                          lineHeight: 1,
                          color,
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  );
                })}

                {/* Sélection du script — ligne complète sous les cartes */}
                <div
                  style={{
                    gridColumn: "1 / -1", // occupe toute la largeur de la grille
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <label
                    htmlFor="editionSelect"
                    style={{
                      fontSize: "1rem",
                      fontFamily: "Cardo, serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Sélectionner le script :
                  </label>

                  <select
                    id="editionSelect"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    disabled={rolesValides}
                    style={{
                      fontSize: "1rem",
                      fontFamily: "Cardo, serif",
                      padding: "0.25rem 0.5rem",
                      borderRadius: 8,
                      border: "1px solid #ccc",
                      background: "#fff",
                      appearance: "auto",
                      minWidth: "10rem",
                      maxWidth: "220px",
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {[...new Set(roles.map((r) => r.edition))].map((ed) => (
                      <option key={ed} value={ed}>
                        {ed}
                      </option>
                    ))}
                    <option value="Script personnalisé">Personnalisé</option>
                  </select>
                </div>
              </div>
              {/* Ligne des boutons sous le select */}
              <div
                style={{
                  flexBasis: "100%", // reste sur une nouvelle ligne sous le select
                  display: "grid",
                  gridTemplateColumns: "1fr", // 1 colonne = 1 bouton par ligne
                  gap: "0.75rem",
                  marginTop: "0.5rem",
                  width: "100%",
                }}
              >
                <button
                  onClick={() => setQrCodeVisible(true)}
                  style={{
                    ...buttonStyle,
                    width: "100%",
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
                    // gridColumn: "1 / -1", // optionnel si tu veux forcer full-width même si tu remets 2 colonnes plus tard
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
                      width: "100%",
                      cursor: rolesValides ? "not-allowed" : "pointer",
                      opacity: rolesValides ? 0.5 : 1,
                      // gridColumn: "1 / -1", // optionnel (voir note ci-dessus)
                    }}
                  >
                    Éditer le script
                  </button>
                )}
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
                    color: "#222",
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
                    fontFamily: "IM Fell English SC, serif",
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
                              fontFamily: "IM Fell English SC, serif",
                            }}
                          >
                            {typeToPlural[type]}
                          </summary>

                          {/* grille 2 colonnes de boutons (icône + nom coloré) */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, 1fr)", // 2 colonnes fixes
                              gap: ".75rem",
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
                                      flexDirection: "column", // icône au-dessus, texte en dessous
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: ".4rem",
                                      padding: "0.8rem",
                                      borderRadius: 10,
                                      border: `1px solid ${
                                        checked ? color : "#bbb"
                                      }`,
                                      background: checked
                                        ? role.alignement === "Bon"
                                          ? "#e6f0fa"
                                          : "#fae6e6"
                                        : "#f5F5F5",

                                      cursor: "pointer",
                                      width: "100%",
                                      minHeight: "100px", // hauteur pour l’icône + texte
                                      textAlign: "center",
                                    }}
                                  >
                                    <img
                                      src={getRoleIcon(role)}
                                      alt=""
                                      style={{
                                        width: 48,
                                        height: 48,
                                        objectFit: "contain",
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
                                        fontFamily:
                                          "'IM Fell English SC', serif",
                                        fontSize: "1rem",
                                      }}
                                    >
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
                  <div style={{ display: "flex", gap: ".5rem", width: "100%" }}>
                    <button
                      onClick={tirageAleatoireScript}
                      style={{
                        padding: ".5rem 1rem",
                        borderRadius: 8,
                        border: "1px solid #bbb",
                        background: "#f5F5F5",

                        fontFamily: "Cardo, serif",
                        flex: 1,
                      }}
                    >
                      Aléatoire
                    </button>
                    <button
                      onClick={() => {
                        if (customScriptTemp.length > 0)
                          setCustomScriptTemp([]);
                      }}
                      disabled={customScriptTemp.length === 0}
                      style={{
                        ...buttonStyle,
                        flex: 1,
                        cursor:
                          customScriptTemp.length === 0
                            ? "not-allowed"
                            : "pointer",
                        opacity: customScriptTemp.length === 0 ? 0.5 : 1,
                      }}
                    >
                      Vider
                    </button>
                    <button
                      onClick={() => {
                        setCustomScriptPool(customScriptTemp);
                        setCustomScriptVisible(false);
                      }}
                      style={{
                        padding: ".5rem 1rem",
                        borderRadius: 8,
                        border: "1px solid #bbb",
                        background: "#f5F5F5",

                        fontFamily: "Cardo, serif",
                        flex: 1,
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
            open={openRolesDetails}
            onToggle={(e) => setOpenRolesDetails(e.currentTarget.open)}
          >
            <summary>Rôles</summary>
            <div style={{ marginTop: "1rem" }}>
              {!rolesValides && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <button
                    onClick={tirerAuHasard}
                    style={{ ...buttonStyle, width: "100%" }}
                  >
                    Aléatoire
                  </button>
                  <button
                    onClick={deselectionnerTousLesRoles}
                    disabled={selected.length === 0}
                    style={{
                      ...buttonStyle,
                      width: "100%",
                      opacity: selected.length === 0 ? 0.5 : 1,
                    }}
                  >
                    Vider
                  </button>
                  <button
                    onClick={handleValiderRoles}
                    style={{ ...buttonStyle, width: "100%" }}
                  >
                    Valider
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
                      style={{ ...buttonStyle, width: "100%" }}
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
                        fontFamily: "IM Fell English SC, serif",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        color: colorForType(type),
                        marginBottom: "1rem",
                        marginTop: "1rem",
                      }}
                    >
                      {label}
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
                              border: `1px solid ${
                                isSelected
                                  ? role.alignement === "Bon"
                                    ? "#0e74b4"
                                    : "#950f13"
                                  : "#bbb"
                              }`,

                              background: isSelected
                                ? role.alignement === "Bon"
                                  ? "#e6f0fa"
                                  : "#fae6e6"
                                : "#f5F5F5",

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
                      ...buttonStyle,
                      color:
                        ordreNuitActuelle === "premiere"
                          ? "#0e74b4"
                          : buttonStyle.color,
                      background:
                        ordreNuitActuelle === "premiere"
                          ? "#e6f0fa"
                          : buttonStyle.background,
                      border:
                        ordreNuitActuelle === "premiere"
                          ? "1px solid #0e74b4"
                          : buttonStyle.border,
                      boxShadow:
                        ordreNuitActuelle === "premiere"
                          ? "0 1px 4px rgba(0,0,0,0.08)"
                          : "none",
                      fontSize: "1.1rem",
                      //fontWeight: "bold",
                    }}
                  >
                    Première nuit
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrdreNuitActuelle("autres")}
                    style={{
                      ...buttonStyle,
                      color:
                        ordreNuitActuelle === "autres"
                          ? "#0e74b4"
                          : buttonStyle.color,
                      background:
                        ordreNuitActuelle === "autres"
                          ? "#e6f0fa"
                          : buttonStyle.background,
                      border:
                        ordreNuitActuelle === "autres"
                          ? "1px solid #0e74b4"
                          : buttonStyle.border,
                      boxShadow:
                        ordreNuitActuelle === "autres"
                          ? "0 1px 4px rgba(0,0,0,0.08)"
                          : "none",
                      fontSize: "1.1rem",
                      //fontWeight: "bold",
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
                      className="wake-order-img"
                    />
                    <span className="wake-order-text">Crépuscule</span>
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
                        <div key={role.nom} className="wake-order-item">
                          <img
                            src={`icons/icon_${normalizeNom(role.nom)}.png`}
                            alt={role.nom}
                            className="wake-order-img"
                          />
                          <span
                            className="wake-order-text"
                            style={{
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
                    <div key="acolyte" className="wake-order-item">
                      <img
                        src={`icons/acolyte.png`}
                        alt="Réveil des acolytes"
                        className="wake-order-img"
                      />
                      <span
                        className="wake-order-text"
                        style={{ color: "#950f13" }}
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
                        <div key={role.nom} className="wake-order-item">
                          <img
                            src={`icons/icon_${normalizeNom(role.nom)}.png`}
                            alt={role.nom}
                            className="wake-order-img"
                          />
                          <span
                            className="wake-order-text"
                            style={{
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
                      <div key="demon-bluffs" className="wake-order-item">
                        <img
                          src={`icons/demon.png`}
                          alt="Réveil du démon et bluffs"
                          className="wake-order-img"
                        />
                        <span
                          className="wake-order-text"
                          style={{ color: "#950f13" }}
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
                        <div key={role.nom} className="wake-order-item">
                          <img
                            src={`icons/icon_${normalizeNom(role.nom)}.png`}
                            alt={role.nom}
                            className="wake-order-img"
                          />
                          <span
                            className="wake-order-text"
                            style={{
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
                  <div key="aube" className="wake-order-item">
                    <img
                      src={`icons/aube.png`}
                      alt="Aube"
                      className="wake-order-img"
                    />
                    <span className="wake-order-text">Aube</span>
                  </div>
                  {/* Ajout du style global pour l'ordre de réveil */}
                  <style>{`
                      .wake-order-item {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        margin-bottom: 0.5rem;
                      }
                      .wake-order-img {
                        height: 36px;
                        width: 36px;
                        object-fit: contain;
                        margin-right: 12px;
                      }
                      .wake-order-text {
                        font-family: Cardo, serif;
                        font-size: 1.2rem;
                      }
                    `}</style>
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
                backgroundColor: "#fff",
                color: "inherit",
                zIndex: 10,
                display: "flex",
                flexDirection: "column", // header séparé du contenu
              }}
            >
              {/* HEADER MODAL indépendant */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  padding: "1rem 0.75rem",
                  borderBottom: "1px solid #eee",
                  fontFamily: "IM Fell English SC, serif",
                  fontSize: "1.2rem",
                  //textAlign: "center",
                  background: "none",
                  flexShrink: 0,
                }}
              >
                Attribuer les rôles
                <button
                  onClick={quitterAffectation}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "0.5rem",
                    border: "none",
                    background: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: "#222", // Force noir sur toutes plateformes
                    lineHeight: 1,
                  }}
                  aria-label="Fermer"
                >
                  ×
                </button>
              </div>

              {/* CONTENU de la modale */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1rem",
                  overflowY: "auto", // si jamais il y a beaucoup d’éléments
                }}
              >
                {indexActif === null && (
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "560px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "1.5rem",
                    }}
                  >
                    <button
                      onClick={() => {
                        const newAttribues = { ...joueursAttribues };
                        const assignedRoleNames = Object.values(
                          newAttribues
                        ).map((j) => j.role.nom);
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
                              rappelRoles: [], // ← ICI, dans la boucle
                            };

                            availableRoles.splice(indexAleatoire, 1);
                          }
                        }

                        setJoueursAttribues(newAttribues);
                      }}
                      style={{
                        ...buttonStyle,
                        width: "100%",
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
                              : "#e4e4e4",
                            border: "1px solid #bbb",
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
                    <div
                      style={{
                        fontSize: "1.7rem",
                        fontFamily: "IM Fell English SC, serif",
                        color:
                          roleActif.alignement === "Bon"
                            ? "#0e74b4"
                            : roleActif.alignement === "Maléfique"
                            ? "#950f13"
                            : "#222",
                        marginBottom: "0.5rem",
                        textAlign: "center",
                      }}
                    >
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
                    <div style={{ marginTop: "1rem" }}>
                      <button
                        onClick={validerJoueur}
                        style={{
                          ...buttonStyle,
                          width: "100%",
                          opacity: rolesRestants.length === 0 ? 0.5 : 1,
                        }}
                      >
                        Valider
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                  color: "#950f13",
                }}
              >
                <h4
                  style={{
                    color: "#950f13",
                    fontSize: "1.2rem",
                    textAlign: "center",
                  }}
                >
                  Bluffs du démon
                </h4>

                {afficherRepartition && !bluffsValides && (
                  <>
                    <div
                      style={{
                        //marginTop: "2rem",
                        display: "flex",
                        alignItems: "center",
                        background: "#f8f8f8",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        padding: "1rem",
                        cursor: "pointer",
                        border: "2px solid #e0e0e0",
                        width: "100%",
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
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          padding: "0 2rem",
                        }}
                      >
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
                                  ? "1px solid #0e74b4"
                                  : "1px solid #bbb",
                                borderRadius: 8,
                                padding: "0.5rem",
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                opacity: isDisabled ? 0.5 : 1,
                                background: isSelected ? "#e6f0fa" : "#f5F5F5",

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

                <h4
                  style={{
                    color: "#222",
                    fontSize: "1.2rem",
                    textAlign: "center",
                  }}
                >
                  Joueurs
                </h4>

                {Object.entries(joueursAttribues).map(
                  ([index, joueur], idx) => (
                    <div
                      key={index}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        alignItems: "start",
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
                        style={{ marginRight: "0.5rem", alignSelf: "start" }}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
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
                          }}
                        >
                          {joueur.nom}
                        </span>
                        <div
                          className="reminder-icons"
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "flex-start",
                            gap: "4px",
                            marginTop: "4px",
                          }}
                        >
                          {/* Icônes mort et vote */}
                          {joueur.mort && (
                            <img
                              src="icons/mort.png"
                              alt="Mort"
                              style={{ width: 28, height: 28 }}
                            />
                          )}
                          {joueur.mort && joueur.token && (
                            <img
                              src="icons/vote.png"
                              alt="Vote"
                              style={{ width: 28, height: 28 }}
                            />
                          )}
                          {/* Icônes anciens rôles */}
                          {(Array.isArray(joueur.anciensRoles)
                            ? joueur.anciensRoles
                            : []
                          ).map((r, idx) => (
                            <img
                              key={`ancien-${r.nom}-${idx}`}
                              src={`icons/icon_${normalizeNom(r.nom)}.png`}
                              alt={r.nom}
                              style={{
                                width: 32,
                                height: 32,
                                objectFit: "contain",
                                filter:
                                  "grayscale(1) brightness(0.9) contrast(0.9)",
                                opacity: 0.85,
                              }}
                            />
                          ))}
                          {/* Icônes rappels */}
                          {(Array.isArray(joueur.rappelRoles)
                            ? joueur.rappelRoles
                            : []
                          ).map((r, idx) => (
                            <img
                              key={`rappel-${r.nom}-${idx}`}
                              src={`icons/icon_${normalizeNom(r.nom)}.png`}
                              alt={r.nom}
                              style={{ width: 32, height: 32 }}
                            />
                          ))}
                        </div>
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
                          color: "#222",
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
                          fontFamily: "IM Fell English SC, serif",
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
                            gridTemplateColumns: "1fr",
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
                                    fontFamily: "'IM Fell English SC', serif",
                                  }}
                                >
                                  {typeToPlural[type]}
                                </summary>

                                {/* Liste verticale (1 bouton par ligne) */}
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
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
                                            flexDirection: "column", // icône au-dessus, nom en dessous
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: ".4rem",
                                            padding: ".8rem",
                                            borderRadius: 10,
                                            border: checked
                                              ? `1px solid ${color}`
                                              : "1px solid #bbb",
                                            background: checked
                                              ? "#e6f0fa"
                                              : "#f5F5F5",

                                            cursor: disabled
                                              ? "not-allowed"
                                              : "pointer",
                                            textAlign: "center",
                                            width: "100%",
                                            minHeight: "100px",
                                            opacity: disabled ? 0.5 : 1,
                                          }}
                                        >
                                          <img
                                            src={getRoleIcon(role)}
                                            alt=""
                                            style={{
                                              width: 48,
                                              height: 48,
                                              objectFit: "contain",
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
                                              fontFamily:
                                                "'IM Fell English SC', serif",
                                              fontSize: "1rem",
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
                          gap: "0.5rem",
                          marginTop: "1.5rem",
                          width: "100%",
                        }}
                      >
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
                            ...buttonStyle,
                            flex: "0 1 110px", // plus étroit
                            minWidth: 0, // autorise le rétrécissement
                            padding: "0.5rem 0.6rem",
                            fontSize: ".95rem",
                          }}
                        >
                          Aléatoire
                        </button>

                        <button
                          onClick={() => {
                            if (editBluffsTemp.length > 0)
                              setEditBluffsTemp([]);
                          }}
                          disabled={editBluffsTemp.length === 0}
                          style={{
                            ...buttonStyle,
                            flex: "0 1 90px", // plus étroit
                            minWidth: 0,
                            padding: "0.5rem 0.6rem",
                            fontSize: ".95rem",
                            opacity: editBluffsTemp.length === 0 ? 0.5 : 1,
                            cursor:
                              editBluffsTemp.length === 0
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          Vider
                        </button>

                        <button
                          onClick={() => {
                            if (editBluffsTemp.length === 3) {
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
                            ...buttonStyle,
                            flex: "1 1 auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.35em",
                            padding: "0.5rem 1rem",
                            whiteSpace: "nowrap", // ← empêche le retour à la ligne
                            opacity: editBluffsTemp.length === 3 ? 1 : 0.6,
                            cursor:
                              editBluffsTemp.length === 3
                                ? "pointer"
                                : "not-allowed",
                          }}
                        >
                          <span>Valider</span>
                          <span style={{ fontWeight: 400, fontSize: "0.98em" }}>
                            ({editBluffsTemp.length}/3)
                          </span>
                        </button>
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
                          background: "#fff", // ← fond blanc
                          color: "#000", // ← texte noir
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
                            background: "#fff", // ← header blanc
                            borderBottom: "1px solid #eee",
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
                                fontFamily: "IM Fell English SC, serif",
                                fontSize: "1.25rem",
                                lineHeight: 1.1,
                                color: "#000", // ← titre noir
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
                              fontSize: "1.8rem",
                              cursor: "pointer",
                              lineHeight: 1,
                              color: "#222",
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
                            color: "#000", // ← texte noir par défaut
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
                                    fontFamily: "IM Fell English SC, serif",
                                    fontWeight: "bold",
                                    fontSize: "1.2rem",
                                    color:
                                      role.alignement === "Bon"
                                        ? "#0e74b4"
                                        : "#950f13",
                                  }}
                                >
                                  {role.nom}
                                </div>
                              </div>
                              <div
                                style={{
                                  fontFamily: "Cardo, serif",
                                  fontSize: "1rem",
                                  color: "#000", // ← description noire
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
                                border: "1px solid #bbb", // ← bord gris
                                background: "#fff", // ← fond blanc
                                color: "#000", // ← texte noir
                                outline: "none",
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
                                  gridTemplateColumns: "1fr 1fr",
                                  width: "100%",
                                  borderRadius: 8,
                                  gap: "0.5rem",
                                  overflow: "hidden",
                                  margin: "0.5rem 0",
                                }}
                              >
                                {/* Bouton Bon */}
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
                                    borderRadius: 8,
                                    border:
                                      joueur?.alignement === "Bon"
                                        ? "1px solid #0e74b4"
                                        : "1px solid #bbb",
                                    background:
                                      joueur?.alignement === "Bon"
                                        ? "#e6f0fa"
                                        : "#F5F5F5",
                                    color:
                                      joueur?.alignement === "Bon"
                                        ? "#0e74b4"
                                        : "#000", // ← texte bleu si actif
                                    fontWeight:
                                      joueur?.alignement === "Bon"
                                        ? "normal"
                                        : "normal",
                                    transition: "all 0.2s",
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
                                    borderRadius: 8,
                                    border:
                                      joueur?.alignement === "Maléfique"
                                        ? "1px solid #950f13"
                                        : "1px solid #bbb",
                                    background:
                                      joueur?.alignement === "Maléfique"
                                        ? "#fae6e8"
                                        : "#F5F5F5",
                                    color:
                                      joueur?.alignement === "Maléfique"
                                        ? "#950f13"
                                        : "#000", // ← texte rouge si actif
                                    fontWeight:
                                      joueur?.alignement === "Maléfique"
                                        ? "normal"
                                        : "normal",
                                    transition: "all 0.2s",
                                  }}
                                >
                                  Maléfique
                                </button>
                              </div>
                              {/* Icônes statut : mort & vote (affichées dans la modale) */}
                              {joueur?.mort && (
                                <span
                                  style={{
                                    marginLeft: "0.5rem",
                                    fontSize: "1.3rem",
                                    verticalAlign: "middle",
                                  }}
                                  title="Mort"
                                >
                                  <img
                                    src="icons/mort.png"
                                    alt="Mort"
                                    style={{
                                      width: 36,
                                      height: 36,
                                      verticalAlign: "middle",
                                    }}
                                  />
                                </span>
                              )}
                              {joueur?.mort && joueur?.token && (
                                <span
                                  style={{
                                    marginLeft: "0.2rem",
                                    fontSize: "1.3rem",
                                    verticalAlign: "middle",
                                  }}
                                  title="Vote fantôme"
                                >
                                  <img
                                    src="icons/vote.png"
                                    alt="Vote fantôme"
                                    style={{
                                      width: 36,
                                      height: 36,
                                      verticalAlign: "middle",
                                    }}
                                  />
                                </span>
                              )}

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
                                      width: 36,
                                      height: 36,
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
                                        width: 36,
                                        height: 36,
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
                                ...buttonStyle,
                                width: "100%",
                              }}
                            >
                              Rappels
                            </button>

                            {showRappelModal && (
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
                                {/* BOÎTE BLANCHE PLEIN ÉCRAN */}
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
                                    overflow: "hidden",

                                    /* Safe-areas iOS */
                                    paddingTop:
                                      "calc(1rem + env(safe-area-inset-top))",
                                    paddingRight:
                                      "calc(1rem + env(safe-area-inset-right))",
                                    paddingBottom:
                                      "calc(1rem + env(safe-area-inset-bottom))",
                                    paddingLeft:
                                      "calc(1rem + env(safe-area-inset-left))",

                                    WebkitOverflowScrolling: "touch",
                                    overscrollBehavior: "contain",
                                    fontFamily: "Cardo, serif",
                                    zIndex: 501,
                                  }}
                                  role="dialog"
                                  aria-modal="true"
                                >
                                  {/* FERMER */}
                                  <button
                                    onClick={() => setShowRappelModal(false)}
                                    style={{
                                      position: "absolute",
                                      top: "0.75rem",
                                      right: "0.75rem",
                                      border: "none",
                                      background: "none",
                                      fontSize: "1.5rem",
                                      cursor: "pointer",
                                      color: "#222",
                                      lineHeight: 1,
                                    }}
                                    aria-label="Fermer"
                                  >
                                    ×
                                  </button>

                                  {/* TITRE */}
                                  <h3
                                    style={{
                                      marginTop: 0,
                                      marginBottom: "0.75rem",
                                      paddingRight: "2rem",
                                      fontFamily: "IM Fell English SC, serif",
                                      fontSize: "1.3rem",
                                    }}
                                  >
                                    Choisir les rappels
                                  </h3>

                                  {/* CORPS SCROLLABLE : 2 par ligne, icône au-dessus, nom en dessous */}
                                  <div
                                    style={{
                                      flex: 1,
                                      overflow: "auto",
                                      paddingBottom:
                                        "env(safe-area-inset-bottom)",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                          "repeat(2, minmax(0, 1fr))",
                                        gap: "0.75rem",
                                      }}
                                    >
                                      {(edition === "Script personnalisé"
                                        ? customScriptPool
                                        : roles.filter(
                                            (r) => r.edition === edition
                                          )
                                      )
                                        .filter((r) => r.rappel)
                                        .sort((a, b) => {
                                          const order = {
                                            Habitant: 0,
                                            Étranger: 1,
                                            Acolyte: 2,
                                            Démon: 3,
                                          };
                                          return (
                                            (order[a.type] ?? 9) -
                                            (order[b.type] ?? 9)
                                          );
                                        })
                                        .map((role) => {
                                          const currentIndex =
                                            nomEditModal?.index;
                                          const courant =
                                            currentIndex != null
                                              ? joueursAttribues[currentIndex]
                                              : null;
                                          const dejaSelectionne = Array.isArray(
                                            courant?.rappelRoles
                                          )
                                            ? courant.rappelRoles.some(
                                                (x) => x.nom === role.nom
                                              )
                                            : false;

                                          const isGood =
                                            role.alignement === "Bon";
                                          const borderColor = dejaSelectionne
                                            ? isGood
                                              ? "#0e74b4"
                                              : "#950f13"
                                            : "#bbb";
                                          const bgColor = dejaSelectionne
                                            ? isGood
                                              ? "#e6f0fa"
                                              : "#fae6e6"
                                            : "#F5F5F5";
                                          const textColor = isGood
                                            ? "#0e74b4"
                                            : "#950f13"; // <-- toujours couleur alignement

                                          return (
                                            <button
                                              key={role.nom}
                                              type="button"
                                              aria-pressed={dejaSelectionne}
                                              onClick={() => {
                                                const currentIndex =
                                                  nomEditModal?.index;
                                                if (currentIndex == null)
                                                  return;

                                                setJoueursAttribues((prev) => {
                                                  const updated = { ...prev };
                                                  const cur =
                                                    updated[currentIndex] || {};
                                                  const list = Array.isArray(
                                                    cur.rappelRoles
                                                  )
                                                    ? [...cur.rappelRoles]
                                                    : [];
                                                  const next = list.some(
                                                    (x) => x.nom === role.nom
                                                  )
                                                    ? list.filter(
                                                        (x) =>
                                                          x.nom !== role.nom
                                                      )
                                                    : [...list, role];

                                                  updated[currentIndex] = {
                                                    ...cur,
                                                    rappelRoles: next,
                                                  };
                                                  return updated;
                                                });
                                              }}
                                              style={{
                                                display: "flex",
                                                flexDirection: "column", // icône au-dessus, nom en dessous
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: ".5rem",
                                                padding: "0.9rem 0.7rem",
                                                borderRadius: 12,
                                                border: "1px solid #bbb",
                                                background: "#F5F5F5",
                                                cursor: "pointer",
                                                width: "100%",
                                                minHeight: 140,
                                                textAlign: "center",
                                              }}
                                            >
                                              <img
                                                src={`icons/icon_${normalizeNom(
                                                  role.nom
                                                )}.png`}
                                                alt={role.nom}
                                                style={{
                                                  width: 48,
                                                  height: 48,
                                                  objectFit: "contain",
                                                }}
                                              />
                                              <span
                                                style={{
                                                  fontFamily:
                                                    "'IM Fell English SC', serif",
                                                  fontSize: "1rem",
                                                  fontWeight: "bold",
                                                  color: textColor,
                                                  lineHeight: 1.1,
                                                }}
                                              >
                                                {role.nom}
                                              </span>
                                            </button>
                                          );
                                        })}
                                    </div>
                                  </div>
                                  {/* Pas de pied de modale : sélection instantanée, fermer avec × */}
                                </div>
                              </div>
                            )}
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
                                ...buttonStyle,
                                width: "100%",
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
                                    style={{
                                      position: "fixed",
                                      inset: 0,
                                      background: "rgba(0,0,0,0.6)", // ← overlay comme "Rappels"
                                      zIndex: 500,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {/* BOÎTE BLANCHE PLEIN ÉCRAN */}
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
                                      <div
                                        onClick={(e) => e.stopPropagation()}
                                        role="dialog"
                                        aria-modal="true"
                                        style={{
                                          background: "#fff",
                                          color: "#222",
                                          position: "fixed",
                                          top: 0,
                                          right: 0,
                                          bottom: 0,
                                          left: 0,
                                          display: "flex",
                                          flexDirection: "column",
                                          overflow: "hidden",
                                          paddingTop:
                                            "calc(1rem + env(safe-area-inset-top))",
                                          paddingRight:
                                            "calc(1rem + env(safe-area-inset-right))",
                                          paddingBottom:
                                            "calc(1rem + env(safe-area-inset-bottom))",
                                          paddingLeft:
                                            "calc(1rem + env(safe-area-inset-left))",
                                          WebkitOverflowScrolling: "touch",
                                          overscrollBehavior: "contain",
                                          fontFamily: "Cardo, serif",
                                          zIndex: 501,
                                        }}
                                      >
                                        {/* croix comme "Rappels" */}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setShowRemplacerDropdown(false)
                                          }
                                          aria-label="Fermer"
                                          style={{
                                            position: "absolute",
                                            top: "0.75rem",
                                            right: "0.75rem",
                                            border: "none",
                                            background: "none",
                                            fontSize: "1.5rem",
                                            cursor: "pointer",
                                            lineHeight: 1,
                                            color: "#222",
                                          }}
                                        >
                                          ×
                                        </button>

                                        <h3
                                          style={{
                                            marginTop: 0,
                                            marginBottom: "0.75rem",
                                            paddingRight: "2rem",
                                            fontFamily:
                                              "IM Fell English SC, serif",
                                            fontSize: "1.3rem",
                                          }}
                                        >
                                          Choisir le nouveau rôle
                                        </h3>

                                        {/* Corps scrollable : grille 2 colonnes */}
                                        <div
                                          style={{
                                            flex: 1,
                                            overflow: "auto",
                                            padding: "1rem",
                                          }}
                                        >
                                          <div
                                            style={{
                                              display: "grid",
                                              gridTemplateColumns:
                                                "repeat(2, minmax(0,1fr))",
                                              gap: "0.75rem",
                                            }}
                                          >
                                            {candidats.map((r) => {
                                              const textColor =
                                                r.alignement === "Bon"
                                                  ? "#0e74b4"
                                                  : "#950f13";
                                              return (
                                                <button
                                                  key={r.nom}
                                                  type="button"
                                                  onClick={() => {
                                                    // Remplacement + historique + MAJ selected, puis fermer
                                                    setJoueursAttribues(
                                                      (prev) => {
                                                        const updated = {
                                                          ...prev,
                                                        };
                                                        const idx =
                                                          nomEditModal.index;
                                                        const cur =
                                                          updated[idx] || {};
                                                        const oldRole =
                                                          cur.role;
                                                        const history =
                                                          Array.isArray(
                                                            cur.anciensRoles
                                                          )
                                                            ? cur.anciensRoles
                                                            : [];
                                                        const newHistory =
                                                          oldRole &&
                                                          oldRole.nom !== r.nom
                                                            ? [
                                                                ...history,
                                                                oldRole,
                                                              ]
                                                            : history;
                                                        updated[idx] = {
                                                          ...cur,
                                                          role: r,
                                                          anciensRoles:
                                                            newHistory,
                                                        };
                                                        return updated;
                                                      }
                                                    );
                                                    setSelected((prev) => {
                                                      const withoutOld =
                                                        prev.filter(
                                                          (x) =>
                                                            x.nom !==
                                                            currentRole?.nom
                                                        );
                                                      const withoutDup =
                                                        withoutOld.filter(
                                                          (x) => x.nom !== r.nom
                                                        );
                                                      return [...withoutDup, r];
                                                    });
                                                    setShowRemplacerDropdown(
                                                      false
                                                    );
                                                  }}
                                                  style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: ".5rem",
                                                    padding: "0.9rem 0.7rem",
                                                    borderRadius: 12,
                                                    border: "1px solid #bbb",
                                                    background: "#F5F5F5",
                                                    cursor: "pointer",
                                                    width: "100%",
                                                    minHeight: 140,
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  <img
                                                    src={`icons/icon_${normalizeNom(
                                                      r.nom
                                                    )}.png`}
                                                    alt={r.nom}
                                                    style={{
                                                      width: 48,
                                                      height: 48,
                                                      objectFit: "contain",
                                                    }}
                                                  />
                                                  <span
                                                    style={{
                                                      fontFamily:
                                                        "'IM Fell English SC', serif",
                                                      fontSize: "1rem",
                                                      fontWeight: "bold",
                                                      color: textColor,
                                                      lineHeight: 1.1,
                                                    }}
                                                  >
                                                    {r.nom}
                                                  </span>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                          </div>
                          {/* Bouton pour supprimer le dernier ancien rôle */}
                          {Array.isArray(joueur?.anciensRoles) &&
                            joueur.anciensRoles.length > 0 && (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const idx = nomEditModal?.index;
                                    if (idx == null) return;
                                    setJoueursAttribues((prev) => {
                                      const next = { ...prev };
                                      const cur = next[idx] || {};
                                      const list = Array.isArray(
                                        cur.anciensRoles
                                      )
                                        ? [...cur.anciensRoles]
                                        : [];
                                      if (list.length > 0) list.pop(); // retire le dernier ajouté
                                      next[idx] = {
                                        ...cur,
                                        anciensRoles: list,
                                      };
                                      return next;
                                    });
                                  }}
                                  style={{ ...buttonStyle, width: "100%" }}
                                  title="Retirer le dernier ancien rôle"
                                >
                                  Supprimer l’ancien rôle
                                </button>
                              </div>
                            )}

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
                              ...buttonStyle,
                              width: "100%",
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
                                ...buttonStyle,
                                width: "100%",
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
                backgroundColor: "white",
                color: "black",
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
                  color: "black",
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
                <span
                  style={{ fontFamily: '"IM FELL ENGLISH SC", Cardo, serif' }}
                >
                  <span
                    style={{
                      fontFamily: '"Pirata One", cursive',
                      color:
                        edition === "Sombre présage"
                          ? "#950f13"
                          : ["Parfum d'hystérie", "Parfum d’hystérie"].includes(
                              edition
                            )
                          ? "#673253"
                          : edition === "Crépuscule funeste"
                          ? "#af4c0f"
                          : edition === "Script personnalisé"
                          ? "#000"
                          : undefined,
                    }}
                  >
                    {edition}
                  </span>
                </span>
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
                      border: "1px solid #bbb",
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
                    border: "1px solid #bbb",
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
              margin: 0, // uniformise l'espacement
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
                  marginTop: "0.7rem",
                  marginBottom: "0.7rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7rem",
                }}
              >
                {jetonsInfoButtons.map((btn, idx) =>
                  btn.label === "Voici le démon" ? (
                    <button
                      key={btn.label}
                      style={{
                        ...buttonStyle,
                        background: btn.background,
                        border: btn.border,
                        fontFamily: btn.fontFamily,
                        color: btn.textColor,
                        fontWeight: "normal",
                        fontSize: "1rem",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        margin: 0,
                        width: "100%",
                        alignSelf: "stretch",
                      }}
                      onClick={() => setJetonInfoPage(btn.page)}
                    >
                      {btn.label}
                    </button>
                  ) : btn.label === "Voici tes acolytes" ||
                    btn.label === "Bluffs du démon" ? (
                    <button
                      key={btn.label}
                      style={{
                        ...buttonStyle,
                        background: btn.background,
                        border: btn.border,
                        fontFamily: btn.fontFamily,
                        color: btn.textColor,
                        fontWeight: btn.fontWeight || "normal",
                        fontSize: "1rem",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        margin: 0,
                        width: "100%",
                        alignSelf: "stretch",
                      }}
                      onClick={() => setJetonInfoPage(btn.page)}
                    >
                      {btn.label}
                    </button>
                  ) : btn.label === "Utiliser ton pouvoir ?" ||
                    btn.label === "Ce joueur est" ||
                    btn.label === "Tu es" ? (
                    <button
                      key={btn.label}
                      style={{
                        ...buttonStyle,
                        background: btn.background,
                        border: btn.border,
                        color: btn.textColor,
                        fontWeight: btn.fontWeight || "normal",
                        fontSize: "1rem",

                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        margin: 0,
                        width: "100%",
                        alignSelf: "stretch",
                      }}
                      onClick={() => setJetonInfoPage(btn.page)}
                    >
                      {btn.label}
                    </button>
                  ) : null
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
                          background: "#f5F5F5",
                          color: "#222",
                          width: "100%",
                          alignSelf: "stretch",
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

                {/* Séparateur noir — désormais APRÈS les messages custom */}
                <hr
                  aria-hidden="true"
                  style={{
                    border: "none",
                    borderTop: "1px solid #000",
                    margin: 0, // laisse le gap du parent gérer l’espacement
                    width: "100%",
                    alignSelf: "stretch",
                  }}
                />
              </div>
              {/* Modal for roles selection */}
              {rolesModalOpen && (
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
                      overflow: "hidden", // le corps scrolle, pas l'en-tête
                      // Safe-areas
                      paddingTop: "calc(1rem + env(safe-area-inset-top))",
                      paddingRight: "calc(1rem + env(safe-area-inset-right))",
                      paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
                      paddingLeft: "calc(1rem + env(safe-area-inset-left))",
                      WebkitOverflowScrolling: "touch",
                      overscrollBehavior: "contain",
                      fontFamily: "Cardo, serif",
                      zIndex: 501,
                    }}
                    role="dialog"
                    aria-modal="true"
                  >
                    {/* CROIX FERMETURE */}
                    <button
                      onClick={() => setRolesModalOpen(false)}
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        border: "none",
                        background: "none",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        lineHeight: 1,
                        color: "#222",
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
                        fontFamily: "IM Fell English SC, serif",
                      }}
                    >
                      Choisir un rôle
                    </h3>

                    {/* CORPS SCROLLABLE */}
                    <div
                      style={{
                        flex: 1,
                        overflow: "auto",
                        paddingBottom: "env(safe-area-inset-bottom)",
                      }}
                    >
                      {/* Groupes par type, comme la modale Script personnalisé */}
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
                                color: colorForType(type),
                                fontWeight: "bold",
                                fontSize: "calc(var(--h2-size) * 1)",
                                fontFamily: "IM Fell English SC, serif",
                              }}
                            >
                              {typeToPlural[type]}
                            </summary>

                            {/* Grille 2 colonnes : icône au-dessus / texte en dessous */}
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: ".75rem",
                                marginTop: ".5rem",
                              }}
                            >
                              {rolesFiltres
                                .filter((r) => r.type === type) // ← TOUS les rôles de l’édition courante
                                .map((role) => (
                                  <button
                                    key={role.nom}
                                    type="button"
                                    onClick={() => {
                                      setSelectedRole(role);
                                      setRolesModalOpen(false);
                                    }}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: ".4rem",
                                      padding: "0.8rem",
                                      borderRadius: 10,
                                      border: "1px solid #bbb",
                                      background: "#f5F5F5",

                                      cursor: "pointer",
                                      width: "100%",
                                      minHeight: "100px",
                                      textAlign: "center",
                                    }}
                                  >
                                    <img
                                      src={getRoleIcon(role)}
                                      alt={role.nom}
                                      style={{
                                        width: 48,
                                        height: 48,
                                        objectFit: "contain",
                                      }}
                                      onError={(ev) =>
                                        (ev.currentTarget.style.display =
                                          "none")
                                      }
                                    />
                                    <span
                                      style={{
                                        color: colorForType(type),
                                        fontWeight: "bold",
                                        fontFamily:
                                          "'IM Fell English SC', serif",
                                        fontSize: "1rem",
                                      }}
                                    >
                                      {role.nom}
                                    </span>
                                  </button>
                                ))}
                            </div>
                          </details>
                        )
                      )}
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
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      zIndex: 2,
                      color: "#222",
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
                        marginBottom: "12px",
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
                        color: "#222", // force le texte du pouvoir en noir
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
              {addCustomJetonVisible && (
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
                      overflow: "hidden",
                      minHeight: "-webkit-fill-available",
                      paddingTop: "calc(1rem + env(safe-area-inset-top))",
                      paddingRight: "calc(1rem + env(safe-area-inset-right))",
                      paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
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
                      onClick={() => setAddCustomJetonVisible(false)}
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        border: "none",
                        background: "none",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        color: "#222",
                        lineHeight: 1,
                      }}
                      aria-label="Fermer"
                    >
                      ×
                    </button>

                    {/* HEADER */}
                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: "1rem",
                        paddingRight: "2rem",
                        fontFamily: "'IM Fell English SC', serif",
                        fontSize: "calc(var(--h2-size) * 1.1)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Ajouter un message
                    </h3>

                    {/* CORPS SCROLLABLE */}
                    <div
                      style={{
                        flex: 1, // occupe tout l’espace entre header et pied
                        overflow: "auto",
                        paddingBottom: "env(safe-area-inset-bottom)",
                        display: "flex",
                        alignItems: "center", // ← centre verticalement
                        justifyContent: "center", // ← centre horizontalement
                        minHeight: 0, // fix iOS Safari pour le scroll dans un flex
                      }}
                    >
                      <div
                        style={{ width: "100%", maxWidth: 680, margin: "1rem" }}
                      >
                        <label
                          htmlFor="customJetonInput"
                          style={{
                            display: "block",
                            fontFamily: "IM Fell English SC, serif",
                            fontSize: "1.4rem",
                            marginBottom: ".5rem",
                            fontWeight: "bold",
                            textAlign: "left",
                          }}
                        >
                          Texte du message
                        </label>

                        <textarea
                          id="customJetonInput"
                          value={customJetonText}
                          onChange={(e) => setCustomJetonText(e.target.value)}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            fontSize: "1.1rem",
                            lineHeight: 1.4,
                            padding: "0.9rem 1rem",
                            borderRadius: "12px",
                            border: "1px solid #bbb",
                            fontFamily: "Cardo, serif",
                            background: "#fff",
                            minHeight: "14rem", // ← plus grand en hauteur (ajuste si besoin)
                            resize: "vertical", // l’utilisateur peut agrandir
                          }}
                        />
                      </div>
                    </div>

                    {/* PIED / FOOTER */}
                    <div
                      style={{
                        display: "flex",
                        gap: ".5rem",
                        marginTop: "1rem",
                      }}
                    >
                      <button
                        type="button"
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
                        style={{
                          ...buttonStyle,
                          flex: "1 1 auto",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.35em",
                          padding: "0.5rem 1rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Valider
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: "0.7rem" }}></div>
              <button
                style={{
                  ...buttonStyle,
                  background: "#f5F5F5",

                  color: "#222",
                  border: "1px solid #bbb",
                  fontSize: "1rem",
                  fontFamily: "Cardo, serif",
                  minWidth: "180px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  margin: 0,
                  width: "100%",
                  alignSelf: "stretch",
                }}
                onClick={() => setRolesModalOpen(true)}
              >
                Afficher un rôle
              </button>
            </details>
          </div>
          {/* Jeton info modal/page */}

          {jetonInfoPage !== null && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)", // overlay sombre
                zIndex: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* BOÎTE BLANCHE PLEIN ÉCRAN */}
              <div
                style={{
                  background: "#fff", // ← fond blanc
                  color: "#000", // ← texte noir
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
                  overflow: "hidden", // scroll dans le corps si besoin
                  paddingTop: "calc(1rem + env(safe-area-inset-top))",
                  paddingRight: "calc(1rem + env(safe-area-inset-right))",
                  paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
                  paddingLeft: "calc(1rem + env(safe-area-inset-left))",
                  WebkitOverflowScrolling: "touch",
                  overscrollBehavior: "contain",
                  fontFamily: "Cardo, serif",
                  zIndex: 501,
                }}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Corbeille (messages personnalisés) */}
                {jetonInfoPage && jetonInfoPage.startsWith("custom-") && (
                  <button
                    onClick={() => {
                      const idx = parseInt(jetonInfoPage.split("-")[1]);
                      removeCustomJeton(idx);
                      setJetonInfoPage(null);
                    }}
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      left: "0.75rem",
                      fontSize: "1.5rem",
                      color: "#222", // ← icône sombre
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

                {/* Croix fermer */}
                <button
                  onClick={() => setJetonInfoPage(null)}
                  style={{
                    position: "absolute",
                    top: "0.75rem",
                    right: "0.75rem",
                    border: "none",
                    background: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    lineHeight: 1,
                    color: "#222", // ← icône sombre
                    zIndex: 401,
                  }}
                  aria-label="Fermer"
                >
                  ×
                </button>
                {/* CONTENU CENTRÉ VERTICAL + HORIZONTAL */}
                <div
                  style={{
                    flex: 1,
                    overflow: "auto",
                    display: "flex",
                    alignItems: "center", // ← centre vertical
                    justifyContent: "center", // ← centre horizontal
                    minHeight: 0, // fix iOS Safari dans un flex
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 720,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "IM Fell English SC, serif",
                        fontSize: "3rem",
                        marginBottom: "2.5rem",
                        color: "#000",
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

                    {/* Liste des rôles non en jeu (le cas échéant) */}
                    {jetonInfoPage === "not-in-game" &&
                    bluffs &&
                    bluffs.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "1.5rem",
                          marginTop: "1rem",
                        }}
                      >
                        {/* Ligne du haut : 2 rôles */}
                        <div
                          style={{
                            display: "flex",
                            gap: "3rem",
                            justifyContent: "center",
                            flexWrap: "nowrap",
                          }}
                        >
                          {bluffs.slice(0, 2).map((role) => (
                            <div
                              key={role.nom}
                              style={{
                                display: "inline-flex", // shrink-wrap selon le contenu
                                flexDirection: "column",
                                alignItems: "center", // centre l'icône sur l'axe du texte
                                textAlign: "center",
                              }}
                            >
                              <img
                                src={`icons/icon_${normalizeNom(role.nom)}.png`}
                                alt={role.nom}
                                style={{
                                  width: 72,
                                  height: 64,
                                  display: "block", // évite l'espace inline
                                  margin: "0 auto", // sécurité : centre dans le conteneur
                                  objectFit: "contain",
                                  marginBottom: "0.5rem",
                                }}
                              />
                              <div
                                style={{
                                  fontFamily: "'IM Fell English SC', serif",
                                  fontSize: "1.4rem",
                                  color: "#0e74b4",
                                  fontWeight: "bold",
                                }}
                              >
                                {role.nom}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Ligne du bas : 3e rôle centré (si présent) */}
                        {bluffs[2] && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              style={{
                                display: "inline-flex", // shrink-wrap
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                              }}
                            >
                              <img
                                src={`icons/icon_${normalizeNom(
                                  bluffs[2].nom
                                )}.png`}
                                alt={bluffs[2].nom}
                                style={{
                                  width: 72,
                                  height: 72,
                                  display: "block",
                                  margin: "0 auto",
                                  objectFit: "contain",
                                  marginBottom: "0.5rem",
                                }}
                              />
                              <div
                                style={{
                                  fontFamily: "'IM Fell English SC', serif",
                                  fontSize: "1.4rem",
                                  color: "#0e74b4",
                                  fontWeight: "bold",
                                }}
                              >
                                {bluffs[2].nom}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div
            style={{
              margin: 0, // uniformise l'espacement
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
                    border: "1px solid #bbb",
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
                  est une adptation francisée du jeu{" "}
                  <strong>Blood on the Clocktower</strong> réalisée par un fan.
                </p>

                <p style={{ fontFamily: "Cardo, serif" }}>
                  <strong>Blood on the Clocktower</strong> est une marque
                  déposée de Steven Medway et The Pandemonium Institute.
                </p>
                <p style={{ fontFamily: "Cardo, serif" }}>
                  Cette application est un grimoire virtuel non officiel et
                  gratuit et n’est pas affiliée à Steven Medway ou The
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

                <div style={{ fontFamily: "Cardo, serif", opacity: 1 }}>
                  <div
                    style={{
                      fontSize: "1rem",
                      textAlign: "center",
                      marginTop: "0rem",
                    }}
                  >
                    <strong>v{pkg.version}</strong>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </main>
    </div>
  );
}
