// 1. INITIALISATION DE LA BASE DE DONNÉES
var baseDeDonneesUtilisateurs = JSON.parse(localStorage.getItem("pokemarket_users"));

if (baseDeDonneesUtilisateurs === null) {
    baseDeDonneesUtilisateurs = [
        { 
            id: "Admin2", 
            pass: "admin123", 
            monnaie: 1500, 
            dernierCadeau: "", 
            inventaire: [
                { nom: "Rayquaza Shiny", type: "Légendaire", hp: 250, maxHp: 250, atk: 120, niveau: 5, xp: 0 }
            ] 
        },
        { 
            id: "Sacha", 
            pass: "pikachu123", 
            monnaie: 150, 
            dernierCadeau: "", 
            inventaire: [
                { nom: "Pikachu", type: "Rare", hp: 85, maxHp: 85, atk: 32, niveau: 1, xp: 0 }
            ] 
        }
    ];
    localStorage.setItem("pokemarket_users", JSON.stringify(baseDeDonneesUtilisateurs));
}

var utilisateurActuel = null;
var indexCarteActiveSurTerrain = null; 

// 2. CATALOGUE DES CARTES ET IMAGES LOCALES AVEC ATTRIBUT ALT OPTIMISÉ
var imagesPokemon = {
    "Rattata": "Rattata.png",
    "Chenipan": "Chenipan.png",
    "Roucool": "Roucool.png",
    "Nosferapti": "Nosferapti.png",
    "Pikachu": "pickachu.png",
    "Bulbizarre": "Bulbizarre.png",
    "Salamèche": "Salamèhce.png",
    "Carapuce": "Carapuce.png",
    "Stari": "Stari.png",
    "Arcanin": "Arcanin.png",
    "Léviator": "Léviator.png",
    "Ectoplasma": "Ectoplasma.png",
    "Ronflex": "Ronflex.png",
    "Dracaufeu EX": "Dracaufeu.png",
    "Mewtwo GX": "Mewtwo.png",
    "Lugia Brillant": "Lugia.png",
    "Rayquaza Shiny": "Rayquaza.png"
};

// Fonction générant la balise image avec un alt clair pour la retranscription
function obtenirBaliseImage(nomPokemon, taillePx) {
    var fichierImg = imagesPokemon[nomPokemon];
    var largeur = taillePx || 85;
    if (fichierImg) {
        return '<img src="' + fichierImg + '" class="poke-img" style="width:' + largeur + 'px; height:' + largeur + 'px;" alt="Carte Pokémon : ' + nomPokemon + '">';
    }
    return '<div style="font-size: 2rem;">🎴</div>';
}

var catalogueCartes = {
    Commun: ["Rattata", "Chenipan", "Roucool", "Nosferapti"],
    Rare: ["Pikachu", "Bulbizarre", "Salamèche", "Carapuce", "Stari"],
    Épique: ["Arcanin", "Léviator", "Ectoplasma", "Ronflex"],
    Légendaire: ["Dracaufeu EX", "Mewtwo GX", "Lugia Brillant", "Rayquaza Shiny"]
};

var prixRevente = {
    Commun: 8,
    Rare: 20,
    Épique: 50,
    Légendaire: 120
};

function genererStatistiquesCarte(typeBooster) {
    var hpMin = 40, hpMax = 65;
    var atkMin = 10, atkMax = 20;

    if (typeBooster === 'Rare') {
        hpMin = 70; hpMax = 100;
        atkMin = 25; atkMax = 40;
    } else if (typeBooster === 'Épique') {
        hpMin = 110; hpMax = 150;
        atkMin = 45; atkMax = 70;
    } else if (typeBooster === 'Légendaire') {
        hpMin = 180; hpMax = 250;
        atkMin = 80; atkMax = 120;
    }

    var hpAleatoires = Math.floor(Math.random() * (hpMax - hpMin + 1)) + hpMin;
    return {
        hp: hpAleatoires,
        maxHp: hpAleatoires, 
        atk: Math.floor(Math.random() * (atkMax - atkMin + 1)) + atkMin,
        niveau: 1,
        xp: 0
    };
}

// 3. GESTION DES COMPTES (INSCRIPTION / CONNEXION)
function sinscrire() {
    var idInput = document.getElementById("reg-id").value.trim();
    var passInput = document.getElementById("reg-pass").value.trim();

    if (idInput === "" || passInput === "") {
        alert("Remplis tous les champs pour créer ton profil de dresseur !");
        return;
    }

    for (var i = 0; i < baseDeDonneesUtilisateurs.length; i++) {
        if (baseDeDonneesUtilisateurs[i].id.toLowerCase() === idInput.toLowerCase()) {
            alert("Ce nom de dresseur existe déjà.");
            return;
        }
    }

    var nouvelUtilisateur = {
        id: idInput,
        pass: passInput,
        monnaie: 100,
        dernierCadeau: "",
        inventaire: []
    };

    baseDeDonneesUtilisateurs.push(nouvelUtilisateur);
    localStorage.setItem("pokemarket_users", JSON.stringify(baseDeDonneesUtilisateurs));

    alert("Compte créé avec succès ! Connecte-toi.");
    document.getElementById("reg-id").value = "";
    document.getElementById("reg-pass").value = "";
}

function seConnecter() {
    var idInput = document.getElementById("login-id").value.trim();
    var passInput = document.getElementById("login-pass").value.trim();
    var utilisateurTrouve = null;

    for (var i = 0; i < baseDeDonneesUtilisateurs.length; i++) {
        if (baseDeDonneesUtilisateurs[i].id === idInput && baseDeDonneesUtilisateurs[i].pass === passInput) {
            utilisateurTrouve = baseDeDonneesUtilisateurs[i];
            break;
        }
    }

    if (utilisateurTrouve !== null) {
        utilisateurActuel = utilisateurTrouve;

        document.getElementById("username-display").innerHTML = utilisateurActuel.id;
        document.getElementById("wallet-display").innerHTML = utilisateurActuel.monnaie;

        document.getElementById("auth-section").classList.add("hidden");
        document.getElementById("main-section").classList.remove("hidden");
        document.getElementById("user-info").classList.remove("hidden");

        var boutonDev = document.getElementById("dev-btn");
        if (utilisateurActuel.id === "Admin2") {
            boutonDev.classList.remove("hidden");
        } else {
            boutonDev.classList.add("hidden");
        }

        reinitialiserSessionCombat();
        mettreAJourCasier();
    } else {
        alert("Identifiant ou mot de passe incorrect.");
    }
}

function seDeconnecter() {
    utilisateurActuel = null;
    indexCarteActiveSurTerrain = null;
    document.getElementById("auth-section").classList.remove("hidden");
    document.getElementById("main-section").classList.add("hidden");
    document.getElementById("user-info").classList.add("hidden");
    document.getElementById("login-pass").value = "";
}

// 4. FONCTIONS DU PANNEAU DE CONTRÔLE DÉV (ADMIN2)
function ouvrirPanneauDev() {
    if (!utilisateurActuel || utilisateurActuel.id !== "Admin2") {
        alert("Accès refusé. Réservé exclusivement à Admin2 !");
        return;
    }
    document.getElementById("dev-modal").classList.remove("hidden");
}

function fermerPanneauDev() {
    document.getElementById("dev-modal").classList.add("hidden");
}

function devModifierMonnaie() {
    if (!utilisateurActuel || utilisateurActuel.id !== "Admin2") return;

    var valeur = parseInt(document.getElementById("dev-coins-input").value);
    if (isNaN(valeur)) {
        alert("Entre un nombre valide !");
        return;
    }

    utilisateurActuel.monnaie += valeur;
    if (utilisateurActuel.monnaie < 0) utilisateurActuel.monnaie = 0;

    document.getElementById("wallet-display").innerHTML = utilisateurActuel.monnaie;
    sauvegarderDonneesUtilisateur();
    alert("✨ Pièces mises à jour ! Nouveau solde : " + utilisateurActuel.monnaie + " 🪙");
}

function devSupprimerPokemon() {
    if (!utilisateurActuel || utilisateurActuel.id !== "Admin2") return;

    var indexSaisi = parseInt(document.getElementById("dev-poke-index").value);
    
    if (isNaN(indexSaisi) || indexSaisi < 0 || indexSaisi >= utilisateurActuel.inventaire.length) {
        alert("Index invalide ! Ton casier contient " + utilisateurActuel.inventaire.length + " carte(s).");
        return;
    }

    var pokemonSupprime = utilisateurActuel.inventaire.splice(indexSaisi, 1)[0];
    
    if (indexCarteActiveSurTerrain === indexSaisi) {
        reinitialiserSessionCombat();
    } else if (indexCarteActiveSurTerrain > indexSaisi) {
        indexCarteActiveSurTerrain--;
    }

    sauvegarderDonneesUtilisateur();
    mettreAJourCasier();
    alert("🗑️ Pokémon supprimé du casier : " + pokemonSupprime.nom);
}

function devViderCasier() {
    if (!utilisateurActuel || utilisateurActuel.id !== "Admin2") return;

    if (confirm("⚠️ Es-tu sûr de vouloir vider entièrement ton casier ?")) {
        utilisateurActuel.inventaire = [];
        reinitialiserSessionCombat();
        sauvegarderDonneesUtilisateur();
        mettreAJourCasier();
        alert("🧹 Casier vidé avec succès !");
    }
}

// 5. SAUVEGARDE & UTILITAIRES
function sauvegarderDonneesUtilisateur() {
    for (var i = 0; i < baseDeDonneesUtilisateurs.length; i++) {
        if (baseDeDonneesUtilisateurs[i].id === utilisateurActuel.id) {
            baseDeDonneesUtilisateurs[i] = utilisateurActuel;
            break;
        }
    }
    localStorage.setItem("pokemarket_users", JSON.stringify(baseDeDonneesUtilisateurs));
}

function reclamerCadeauQuotidien() {
    var aujourdhui = new Date().toDateString();
    if (utilisateurActuel.dernierCadeau === aujourdhui) {
        alert("Tu as déjà récupéré ton cadeau aujourd'hui !");
        return;
    }

    utilisateurActuel.monnaie += 50;
    utilisateurActuel.dernierCadeau = aujourdhui;
    document.getElementById("wallet-display").innerHTML = utilisateurActuel.monnaie;
    sauvegarderDonneesUtilisateur();
    alert("🎁 Cadeau quotidien récupéré : +50 pièces 🪙 !");
}

function changerOnglet(nomOnglet) {
    document.getElementById("tab-shop").classList.add("hidden");
    document.getElementById("tab-casier").classList.add("hidden");
    document.getElementById("tab-combat").classList.add("hidden");

    document.getElementById("tab-shop-btn").classList.remove("active");
    document.getElementById("tab-casier-btn").classList.remove("active");
    document.getElementById("tab-combat-btn").classList.remove("active");

    if (nomOnglet === 'shop') {
        document.getElementById("tab-shop").classList.remove("hidden");
        document.getElementById("tab-shop-btn").classList.add("active");
    } else if (nomOnglet === 'casier') {
        document.getElementById("tab-casier").classList.remove("hidden");
        document.getElementById("tab-casier-btn").classList.add("active");
        mettreAJourCasier();
    } else if (nomOnglet === 'combat') {
        document.getElementById("tab-combat").classList.remove("hidden");
        document.getElementById("tab-combat-btn").classList.add("active");
        chargerPlateauCombat();
    }
}

// 6. BOUTIQUE & OUVERTURE DE BOOSTERS
function acheterBooster(typeBooster, prix) {
    if (utilisateurActuel.monnaie < prix) {
        alert("Pas assez de pièces !");
        return;
    }

    utilisateurActuel.monnaie -= prix;
    document.getElementById("wallet-display").innerHTML = utilisateurActuel.monnaie;

    var listePossibles = catalogueCartes[typeBooster];
    var nomCarteObtenue = listePossibles[Math.floor(Math.random() * listePossibles.length)];
    var stats = genererStatistiquesCarte(typeBooster);

    var nouvelleCarte = {
        nom: nomCarteObtenue,
        type: typeBooster,
        hp: stats.hp,
        maxHp: stats.maxHp,
        atk: stats.atk,
        niveau: 1,
        xp: 0
    };
    
    utilisateurActuel.inventaire.push(nouvelleCarte);
    sauvegarderDonneesUtilisateur();
    document.getElementById("casier-count").innerHTML = utilisateurActuel.inventaire.length;

    var logBox = document.getElementById("shop-log");
    logBox.innerHTML = "✨ Booster " + typeBooster + " ouvert ➔ <strong>" + nomCarteObtenue + "</strong> (PV: " + nouvelleCarte.hp + ", ATK: " + nouvelleCarte.atk + ")<br>" + logBox.innerHTML;

    afficherModalBooster(nouvelleCarte);
}

function afficherModalBooster(carte) {
    var modal = document.getElementById("booster-modal");
    var contenu = document.getElementById("modal-card-content");
    
    contenu.className = "modal-card rarity-" + carte.type.toLowerCase();
    contenu.innerHTML = 
        '<p style="color: #ffcb05; font-weight: bold; letter-spacing: 1px;">NOUVELLE CARTE !</p>' +
        '<h2 style="margin: 10px 0;">' + carte.nom + '</h2>' +
        '<span style="background: #2d334a; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem;">' + carte.type + '</span>' +
        '<div style="margin: 15px 0;">' + obtenirBaliseImage(carte.nom, 130) + '</div>' +
        '<p style="font-size: 1.1rem; margin-bottom: 15px;">❤️ <strong>' + carte.hp + '</strong> PV  |  ⚔️ <strong>' + carte.atk + '</strong> ATK</p>' +
        '<button class="btn" onclick="fermerModalBooster()">Super !</button>';

    modal.classList.remove("hidden");
}

function fermerModalBooster() {
    document.getElementById("booster-modal").classList.add("hidden");
}

// 7. CASIER & SOINS
function genererBarreDeVie(hp, maxHp) {
    var pourcentage = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)));
    var couleur = "#2ed573";
    if (pourcentage <= 50) couleur = "#ffa502";
    if (pourcentage <= 20) couleur = "#ff4757";

    return '<div class="hp-bar-bg"><div class="hp-bar-fill" style="width: ' + pourcentage + '%; background: ' + couleur + ';"></div></div>';
}

function mettreAJourCasier() {
    var conteneurCasier = document.getElementById("inventory-container");
    document.getElementById("casier-count").innerHTML = utilisateurActuel.inventaire.length;

    if (utilisateurActuel.inventaire.length === 0) {
        conteneurCasier.innerHTML = "<p style='color: #777; grid-column: 1 / -1; text-align: center;'>Ton casier est vide.</p>";
        return;
    }

    var htmlContent = "";
    for (var i = 0; i < utilisateurActuel.inventaire.length; i++) {
        var carte = utilisateurActuel.inventaire[i];
        if (carte.niveau === undefined) { carte.niveau = 1; carte.xp = 0; }

        var estKO = carte.hp <= 0;
        var estBlesse = carte.hp < carte.maxHp;
        var classeKO = estKO ? " card-ko" : "";
        var valeurVente = prixRevente[carte.type] || 10;

        htmlContent += '<div class="inventory-item rarity-' + carte.type.toLowerCase() + classeKO + '">';
        htmlContent += '<div>';
        htmlContent += '<div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#aaa;"><span>N°' + i + ' • ' + carte.type + '</span><span style="color:#ffcb05;">Niv. ' + carte.niveau + '</span></div>';
        htmlContent += obtenirBaliseImage(carte.nom, 80);
        htmlContent += '<strong>' + carte.nom + '</strong>';
        htmlContent += genererBarreDeVie(carte.hp, carte.maxHp);
        htmlContent += '<p style="font-size: 0.75rem; color: #ffcb05;">❤️ ' + carte.hp + '/' + carte.maxHp + ' | ⚔️ ' + carte.atk + '</p>';
        if (estKO) {
            htmlContent += '<span style="font-size: 0.65rem; color: #ff4757; font-weight: bold;">K.O.</span>';
        }
        htmlContent += '</div>';

        htmlContent += '<div class="card-actions">';
        if (estBlesse) {
            htmlContent += '<button class="btn-heal" onclick="soignerCarte(' + i + ')">💊 15🪙</button>';
        }
        htmlContent += '<button class="btn-sell" onclick="vendreCarte(' + i + ')">💰 +' + valeurVente + '🪙</button>';
        htmlContent += '</div>';

        htmlContent += '</div>';
    }

    conteneurCasier.innerHTML = htmlContent;
}

function soignerCarte(index) {
    var carte = utilisateurActuel.inventaire[index];
    var coutSoin = 15;

    if (utilisateurActuel.monnaie < coutSoin) {
        alert("Pas assez de pièces !");
        return;
    }

    utilisateurActuel.monnaie -= coutSoin;
    carte.hp = carte.maxHp;

    document.getElementById("wallet-display").innerHTML = utilisateurActuel.monnaie;
    sauvegarderDonneesUtilisateur();
    mettreAJourCasier();
}

function soignerToutLeCasier() {
    var cartesBlessees = 0;
    for (var i = 0; i < utilisateurActuel.inventaire.length; i++) {
        if (utilisateurActuel.inventaire[i].hp < utilisateurActuel.inventaire[i].maxHp) {
            cartesBlessees++;
        }
    }

    if (cartesBlessees === 0) {
        alert("Toutes tes cartes sont en pleine forme !");
        return;
    }

    var coutTotal = cartesBlessees * 15;
    if (utilisateurActuel.monnaie < coutTotal) {
        alert("Il te faut " + coutTotal + " 🪙.");
        return;
    }

    utilisateurActuel.monnaie -= coutTotal;
    for (var j = 0; j < utilisateurActuel.inventaire.length; j++) {
        utilisateurActuel.inventaire[j].hp = utilisateurActuel.inventaire[j].maxHp;
    }

    document.getElementById("wallet-display").innerHTML = utilisateurActuel.monnaie;
    sauvegarderDonneesUtilisateur();
    mettreAJourCasier();
    alert("🏥 Soin général effectué !");
}

function vendreCarte(index) {
    var carte = utilisateurActuel.inventaire[index];
    var gain = prixRevente[carte.type] || 10;

    if (confirm("Vendre " + carte.nom + " pour " + gain + " 🪙 ?")) {
        utilisateurActuel.monnaie += gain;
        utilisateurActuel.inventaire.splice(index, 1);
        
        if (indexCarteActiveSurTerrain === index) {
            reinitialiserSessionCombat();
        } else if (indexCarteActiveSurTerrain > index) {
            indexCarteActiveSurTerrain--;
        }

        document.getElementById("wallet-display").innerHTML = utilisateurActuel.monnaie;
        sauvegarderDonneesUtilisateur();
        mettreAJourCasier();
    }
}

// 8. ARÈNE DE COMBAT
function chargerPlateauCombat() {
    var mainJoueurConteneur = document.getElementById("player-hand");
    
    if (utilisateurActuel.inventaire.length === 0) {
        mainJoueurConteneur.innerHTML = "<p style='color: #aaa;'>Achète des cartes pour combattre !</p>";
        return;
    }

    var htmlContent = "";
    for (var i = 0; i < utilisateurActuel.inventaire.length; i++) {
        var carte = utilisateurActuel.inventaire[i];
        if (carte.niveau === undefined) { carte.niveau = 1; carte.xp = 0; }

        var estKO = carte.hp <= 0;
        var classeKO = estKO ? " card-ko" : "";
        var fonctionClic = estKO ? "" : 'onclick="selectionnerCarteCombat(' + i + ')"';
        var bordureSelection = (indexCarteActiveSurTerrain === i) ? " style='outline: 3px solid #2ed573;'" : "";

        htmlContent += '<div class="inventory-item rarity-' + carte.type.toLowerCase() + classeKO + '" ' + fonctionClic + bordureSelection + '>';
        htmlContent += '<div>';
        htmlContent += '<span style="font-size:0.65rem; color:#ffcb05;">Niv. ' + carte.niveau + '</span>';
        htmlContent += obtenirBaliseImage(carte.nom, 65);
        htmlContent += '<strong style="font-size: 0.85rem; display:block;">' + carte.nom + '</strong>';
        htmlContent += genererBarreDeVie(carte.hp, carte.maxHp);
        htmlContent += '<p style="font-size: 0.7rem; color: #ffcb05;">❤️ ' + carte.hp + '/' + carte.maxHp + ' | ⚔️ ' + carte.atk + '</p>';
        if (estKO) {
            htmlContent += '<span style="font-size: 0.65rem; color: #ff4757; font-weight: bold;">K.O.</span>';
        }
        htmlContent += '</div>';
        htmlContent += '</div>';
    }
    mainJoueurConteneur.innerHTML = htmlContent;
}

function selectionnerCarteCombat(index) {
    var carte = utilisateurActuel.inventaire[index];

    if (carte.hp <= 0) {
        alert("Cette carte est K.O. !");
        return;
    }

    indexCarteActiveSurTerrain = index;
    afficherCarteDansSlot("slot-player", carte, true);
    chargerPlateauCombat();

    var logBox = document.getElementById("battle-log");
    logBox.innerHTML = "▶️ <strong>" + carte.nom + " (Niv. " + carte.niveau + ")</strong> entre sur le terrain !<br>" + logBox.innerHTML;
}

function afficherCarteDansSlot(idSlot, carte, estJoueur) {
    var slot = document.getElementById(idSlot);
    slot.className = "slot-box rarity-" + carte.type.toLowerCase();
    var infoNiveau = estJoueur ? '<span style="font-size:0.7rem; color:#2ed573;">Niv. ' + carte.niveau + '</span>' : '<span style="font-size:0.7rem; color:#ff4757;">Sauvage</span>';
    
    slot.innerHTML = 
        infoNiveau +
        obtenirBaliseImage(carte.nom, 85) +
        '<strong style="font-size:0.95rem;">' + carte.nom + '</strong>' +
        genererBarreDeVie(carte.hp, carte.maxHp) +
        '<small style="color:#ffcb05;">❤️ ' + carte.hp + '/' + carte.maxHp + ' | ⚔️ ' + carte.atk + '</small>';
}

function lancerLigneCombat() {
    if (indexCarteActiveSurTerrain === null) {
        alert("Sélectionne d'abord un Pokémon !");
        return;
    }

    var carteJoueur = utilisateurActuel.inventaire[indexCarteActiveSurTerrain];
    if (carteJoueur.hp <= 0) {
        alert("Ce Pokémon est K.O. !");
        return;
    }

    var types = ["Commun", "Rare", "Épique", "Légendaire"];
    var typeAdv = types[Math.floor(Math.random() * types.length)];
    var nomAdv = catalogueCartes[typeAdv][Math.floor(Math.random() * catalogueCartes[typeAdv].length)];
    var statsAdv = genererStatistiquesCarte(typeAdv);
    var carteAdv = { nom: nomAdv, type: typeAdv, hp: statsAdv.hp, maxHp: statsAdv.maxHp, atk: statsAdv.atk };

    var slotPlayer = document.getElementById("slot-player");
    var slotOpponent = document.getElementById("slot-opponent");
    slotPlayer.classList.remove("shake-anim");
    slotOpponent.classList.remove("shake-anim");
    void slotPlayer.offsetWidth;
    slotPlayer.classList.add("shake-anim");
    slotOpponent.classList.add("shake-anim");

    var degatsSubis = carteAdv.atk;
    carteJoueur.hp = Math.max(0, carteJoueur.hp - degatsSubis);

    var scoreJoueur = carteJoueur.atk + (carteJoueur.hp / 3);
    var scoreAdv = statsAdv.atk + (statsAdv.hp / 3);
    var logBox = document.getElementById("battle-log");
    var messageResultat = "";

    if (scoreJoueur >= scoreAdv) {
        carteAdv.hp = 0;
        utilisateurActuel.monnaie += 35;
        document.getElementById("wallet-display").innerHTML = utilisateurActuel.monnaie;
        
        carteJoueur.xp = (carteJoueur.xp || 0) + 50;
        var msgLevelUp = "";
        if (carteJoueur.xp >= 100) {
            carteJoueur.niveau++;
            carteJoueur.xp = 0;
            carteJoueur.maxHp += 15;
            carteJoueur.hp = Math.min(carteJoueur.maxHp, carteJoueur.hp + 15);
            carteJoueur.atk += 5;
            msgLevelUp = " <strong style='color:#ffcb05;'>⬆️ LEVEL UP ! Niveau " + carteJoueur.niveau + "</strong>";
        }

        messageResultat = "<span style='color: #2ed573;'>🎉 VICTOIRE ! (+35 🪙, +50 XP)." + msgLevelUp + "</span><br>";
    } else {
        messageResultat = "<span style='color: #ff4757;'>❌ DÉFAITE... (-" + degatsSubis + " PV).</span><br>";
    }

    afficherCarteDansSlot("slot-opponent", carteAdv, false);

    if (carteJoueur.hp <= 0) {
        messageResultat += "<span style='color: #ff4757; font-weight: bold;'>⚠️ " + carteJoueur.nom + " est K.O. !</span><br>";
        slotPlayer.innerHTML = '<span style="color: #ff4757; font-weight:bold;">K.O. (0 PV)</span>';
        slotPlayer.className = "slot-box";
        indexCarteActiveSurTerrain = null;
    } else {
        afficherCarteDansSlot("slot-player", carteJoueur, true);
    }

    logBox.innerHTML = messageResultat + logBox.innerHTML;
    sauvegarderDonneesUtilisateur();
    chargerPlateauCombat();
}

function reinitialiserSessionCombat() {
    indexCarteActiveSurTerrain = null;
    document.getElementById("slot-player").innerHTML = '<span style="color: #555;">Choisis une carte</span>';
    document.getElementById("slot-player").className = "slot-box";
    document.getElementById("slot-opponent").innerHTML = '<span style="color: #555;">En attente...</span>';
    document.getElementById("slot-opponent").className = "slot-box";
    document.getElementById("battle-log").innerHTML = "Terrain réinitialisé.";
    chargerPlateauCombat();
}