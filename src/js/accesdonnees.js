// Variables globales
let toutesLesEquipes = [];
let toutesLesDivisions = [];
let equipesAffichees = [];
let currentPage = 1;
const itemsPerPage = 10;
const apiBaseUrl = "http://localhost:5246/api/";

// Variable globale pour les stats
let statsEquipes = [];
let anneeSelectionnee = new Date().getFullYear();

// Fonction pour gérer la navigation entre les sections
function naviguerVers(section) {
    // Cacher toutes les sections
    document.getElementById('sectionEquipes').style.display = 'none';
    document.getElementById('sectionStatistiques').style.display = 'none';
    
    // Retirer la classe active de tous les liens
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Afficher la section demandée et activer le lien correspondant
    if (section === 'equipes') {
        document.getElementById('sectionEquipes').style.display = 'block';
        document.querySelector('a[href="#equipes"]').classList.add('active');
    } else if (section === 'statistiques') {
        document.getElementById('sectionStatistiques').style.display = 'block';
        document.querySelector('a[href="#statistiques"]').classList.add('active');
        // Charger les statistiques détaillées si nécessaire
        afficherStatistiquesDetailees();
    }
}

// Obtenir une équipe avec son id
async function getEquipe(id) {
    if (id === undefined || id < 1) {
        return "";
    }
    
    const url = `${apiBaseUrl}equipe/` + id;
    let json = "";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Statut de la réponse : ${response.status}`);
        }
        json = await response.json();
    }
    catch (error) {
        console.error(error.message);
    }
    return json;
}

async function ObtenirListeEquipe() {

    const url = `${apiBaseUrl}equipe/`;
    let json = "";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Statut de la réponse : ${response.status}`);
        }

        json = await response.json();
    }
    catch (error) {
        console.error(error.message);
    }
    
    return json;
}

async function getListeEquipe() {
    const url = `${apiBaseUrl}equipe/`;
    let json = "";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Statut de la réponse : ${response.status}`);
        }
        json = await response.json();
    }
    catch (error) {
        console.error(error.message);
        throw error;
    }
    return json;
}

async function majEquipe(entree) {
    console.log('Entrée majEquipe : ', entree);

    const url = `${apiBaseUrl}equipe/` + entree.id;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('accept', '*/*');
    
    fetch(url, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(entree)
        }).then((response) => {
            if (!response.ok) {
                console.log(`Erreur response: `, response.Error);
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            alert("Équipe mise à jour avec succès!");
            chargerEquipes().then(() => { console.log('Équipes rechargées'); }); // Recharger la liste
        }).catch((error) => {
            console.error('Erreur lors de la mise à jour:', error);
            alert("Erreur lors de la mise à jour de l'équipe.");
        });
}

// Fonction pour sauvegarder les modifications
function sauvegarderModification() {
    const form = document.getElementById('editTeamForm');
    
    const equipeModifiee = {
        id: parseInt(document.getElementById('editTeamId').value),
        nomEquipe: document.getElementById('editTeamName').value,
        ville: document.getElementById('editTeamCity').value,
        divisionId: parseInt(document.getElementById('editTeamDivision').value),
        anneeDebut: parseInt(document.getElementById('editTeamFounded').value) || null,
        anneeFin: parseInt(document.getElementById('editTeamCeased').value) || null,
        estDevenueEquipe: parseInt(document.getElementById('editBecameTeam').value) || null
    };

    console.log(`equipeModifiee : `, JSON.stringify(equipeModifiee));

    const modalTitle = document.querySelector('#editTeamModal .modal-title').textContent;
    if (modalTitle.includes('Fermer')) {
        if (!equipeModifiee.anneeFin) {
            alert('Veuillez entrer une année de fermeture');
            return;
        }    
        if (equipeModifiee.anneeFin < equipeModifiee.anneeDebut) {
            alert('L\'année de fermeture ne peut pas être antérieure à l\'année de fondation');
            return;
        }
        
        if (equipeModifiee.anneeFin > new Date().getFullYear()) {
            alert('L\'année de fermeture ne peut pas être dans le futur');
            return;
        }
    } else {
        // Validation basique pour modification normale
        if (!equipeModifiee.nomEquipe || !equipeModifiee.ville || !equipeModifiee.divisionId || !equipeModifiee.anneeDebut) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
    }

    majEquipe(equipeModifiee).then(() => {
            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editTeamModal'));
            modal.hide();
            
            // Réinitialiser le formulaire
            form.reset();
        })
        .catch((error) => {
            console.error('Erreur lors de la sauvegarde:', error);
        });
}

async function getDernierNumeroEquipe() {
    const url = `${apiBaseUrl}equipe/prochainid`;
    
    let monId = 0;
    const response = await fetch(url);
    if(response.ok) {
        monId = await response.json();
    }
    else {
        alert(`Erreur pour obtenir le dernier numéro d'équipe, erreur : ` + response.Error);
    }

    return monId;
}

async function ajoutEquipe(entree) {
    const url = `${apiBaseUrl}equipe/`;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('accept', '*/*');
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(entree)
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        alert("Équipe ajoutée avec succès!");
        console.log('Ajout réussi - Code:', response.status);
        await chargerEquipes(); // Recharger la liste
        
    } catch (error) {
        alert("Erreur lors de l\'ajout de l'équipe.");
    }
}

// Nouvelles fonctions pour l'interface
async function chargerDivisions() {
    montrerChargementDivisions(true);
    hideError();
    
    listerDivision().then((mesDivisions) => {
        toutesLesDivisions = mesDivisions;
        afficherDivision();
    }).catch((error) => {
        showError('Erreur lors du chargement des divisions: ' + error.message);
    }).finally(() => {
        montrerChargementDivisions(false);
    });
}

async function chargerEquipes() {
    montrerChargementEquipes(true);
    hideError();
    
    getListeEquipe().then((mesEquipes) => {
        toutesLesEquipes = mesEquipes;
        equipesAffichees = [...toutesLesEquipes];
        mettreAJourStatistiques();
        afficherEquipes();
        currentPage = 1;
        mettreAJourPagination();
    }).catch((error) => {
        console.log(error);
        showError('Erreur lors du chargement des équipes: ' + error.message);
    }).finally(() => {
        montrerChargementEquipes(false);
    })
}

function mettreAJourStatistiques() {
    const stats = {
        total: toutesLesEquipes.length,
        atlantique: toutesLesEquipes.filter(e => e.divisionId === 1).length,
        metro: toutesLesEquipes.filter(e => e.divisionId === 2).length,
        central: toutesLesEquipes.filter(e => e.divisionId === 3).length,
        pacifique: toutesLesEquipes.filter(e => e.divisionId === 4).length
    };

    document.getElementById('totalEquipes').textContent = stats.total;
    document.getElementById('division1').textContent = stats.atlantique;
    document.getElementById('division2').textContent = stats.metro;
    document.getElementById('division3').textContent = stats.central;
    document.getElementById('division4').textContent = stats.pacifique;
}

function afficherDivision()
{
    const listeCartesStatsDiv = document.getElementById('cartesStatsDiv');
    listeCartesStatsDiv.innerHTML = `
        <div class="col-md-3 mb-3">
            <div class="stats-card">
                <div class="stats-number" id="totalEquipes">0</div>
                <div class="text-muted">Total Équipes</div>
                <i class="fas fa-users fa-2x text-primary mt-2"></i>
            </div>
        </div>
    `;

    const listeOptionDivision = document.getElementById('divisionFilter');
    var opt = document.createElement('option');
    opt.value = '';
    opt.innerHTML = "Toutes divisions";
    listeOptionDivision.appendChild(opt);

    const listeDivisionsPourAjout = document.getElementById('teamDivision');
    var opt2 = document.createElement('option');
    opt2.value = '';
    opt2.innerHTML = "Sélectionner une division";
    listeDivisionsPourAjout.appendChild(opt2);
    
    toutesLesDivisions.forEach((x) => {
        const row = `
            <div class="col-md-3 mb-3">
                <div class="stats-card">
                    <div class="stats-number" id="division${x.id}">0</div>
                    <div class="text-muted">${x.nomDivision || 'N/A'}</div>
                    <i class="fas fa-map-marker-alt fa-2x text-info mt-2"></i>
                </div>
            </div>
        `;
        listeCartesStatsDiv.innerHTML += row;

        var ajoutOption = document.createElement('option');
        ajoutOption.value = x.id;
        ajoutOption.innerHTML = x.nomDivision;
        listeOptionDivision.appendChild(ajoutOption);

        var ajoutOption2 = document.createElement('option');
        ajoutOption2.value = x.id;
        ajoutOption2.innerHTML = x.nomDivision;
        listeDivisionsPourAjout.appendChild(ajoutOption2);
    });
}

function ajouterEquipeBecameTeam(id) {
    const listeOptionBecameTeam = document.getElementById('becameTeam');
    var opt = document.createElement('option');
    opt.value = '';
    opt.innerHTML = "Sélectionnez une équipe";
    listeOptionBecameTeam.appendChild(opt);
    
    var ajoutOption = document.createElement('option');
    toutesLesEquipes.forEach((x) => {
        if (x.id != id) {
            console.log(x.nomEquipe);
            ajoutOption.value = x.id;
            ajoutOption.innerHTML = x.nomEquipe;
            listeOptionBecameTeam.appendChild(ajoutOption);
        }
    });
}

function afficherEquipes() {
    const tbody = document.getElementById('equipesTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const equipesPage = equipesAffichees.slice(startIndex, endIndex);

    tbody.innerHTML = '';

    if (equipesPage.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="fas fa-search fa-2x text-muted mb-3"></i>
                    <p class="text-muted">Aucune équipe trouvée</p>
                </td>
            </tr>
        `;
        return;
    }

    equipesPage.forEach(equipe => {
        const divisionClass = getDivisionClass(equipe.divisionId);
        let nomDivision = "";
        
        toutesLesDivisions.forEach( maDivision => 
        {
            if(maDivision.id == equipe.divisionId)
            {
                nomDivision = maDivision.nomDivision;
            }
        });

        const row = `
            <tr>
                <td>${equipe.id || 'N/A'}</td>
                <td><strong>${equipe.nomEquipe || 'Sans nom'}</strong></td>
                <td>${equipe.ville || 'N/A'}</td>
                <td><span class="division-badge ${divisionClass || ''}">${nomDivision || 'N/A'}</span></td>
                <td>${equipe.anneeDebut || 'N/A'}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-hockey-success" title="Modifier" onclick="modifierEquipe(${equipe.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary" title="Voir détails" onclick="voirEquipe(${equipe.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-hockey-danger" title="Supprimer" onclick="supprimerEquipe(${equipe.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function getDivisionClass(division) {
    if (!division) return '';
    if (!Number.isInteger(division)) return '';
    switch (division) {
        case 1: return 'division-atlantique';
        case 2: return 'division-Metro';
        case 3: return 'division-central';
        default: return 'division-pacifique';
    }
}

async function listerDivision()
{
    const url = `${apiBaseUrl}division/`;
    let json = "";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Statut de la réponse : ${response.status}`);
        }
        json = await response.json();
    }
    catch (error) {
        console.error(error.message);
        throw error;
    }
    return json;
}

async function obtenirDivision(division)
{
    if (!division) return '';
    if (!Number.isInteger(division)) return '';

    const url = `${apiBaseUrl}division/` + division;
    let json = "";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Statut de la réponse : ${response.status}`);
        }
        json = await response.json();
    }
    catch (error) {
        console.error(error.message);
        throw error;
    }
    return json;
}

function mettreAJourPagination() {
    const totalPages = Math.ceil(equipesAffichees.length / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, equipesAffichees.length);

    // Mise à jour des informations de pagination
    document.getElementById('paginationInfo').textContent = 
        `Affichage de ${startItem} à ${endItem} de ${equipesAffichees.length} équipes`;

    // Génération des boutons de pagination
    const paginationNav = document.getElementById('paginationNav');
    paginationNav.innerHTML = '';

    if (totalPages <= 1) return;

    // Bouton Précédent
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    paginationNav.innerHTML += `
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="#" onclick="changerPage(${currentPage - 1})">Précédent</a>
        </li>
    `;

    // Boutons numérotés
    for (let i = 1; i <= totalPages; i++) {
        const active = i === currentPage ? 'active' : '';
        paginationNav.innerHTML += `
            <li class="page-item ${active}">
                <a class="page-link" href="#" onclick="changerPage(${i})">${i}</a>
            </li>
        `;
    }

    // Bouton Suivant
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    paginationNav.innerHTML += `
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="#" onclick="changerPage(${currentPage + 1})">Suivant</a>
        </li>
    `;
}

function changerPage(page) {
    const totalPages = Math.ceil(equipesAffichees.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    afficherEquipes();
    mettreAJourPagination();
}

function filtrerEquipes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const divisionFilter = document.getElementById('divisionFilter').value;

    equipesAffichees = toutesLesEquipes.filter(equipe => {
        const matchesSearch = !searchTerm || 
            (equipe.nomEquipe && equipe.nomEquipe.toLowerCase().includes(searchTerm)) ||
            (equipe.ville && equipe.ville.toLowerCase().includes(searchTerm));
        
        const matchesDivision = !divisionFilter || equipe.divisionId === Number(divisionFilter);

        return matchesSearch && matchesDivision;
    });

    currentPage = 1;
    afficherEquipes();
    mettreAJourPagination();
}

// Fonctions pour les actions des boutons
// Fonction pour ouvrir le modal de modification avec les données de l'équipe
function modifierEquipe(id, mode = 'edit') {
    // Récupérer les données de l'équipe
    getEquipe(id).then((equipe) => {
        if (!equipe) {
            alert('Erreur: Équipe non trouvée');
            return;
        }

        setTimeout(() => {
             // Remplir le select des divisions si ce n'est pas déjà fait
            const selectDivision = document.getElementById('editTeamDivision');
            if (selectDivision.options.length <= 1) {
                selectDivision.innerHTML = '<option value="">Sélectionner une division</option>';
                toutesLesDivisions.forEach((division) => {
                    const option = document.createElement('option');
                    option.value = division.id;
                    option.innerHTML = division.nomDivision;
                    selectDivision.appendChild(option);
                });
            }

            // Re-sélectionner la division de l'équipe après avoir rempli le select
            selectDivision.value = equipe.divisionId || '';

            // Remplir le formulaire avec les données existantes
            document.getElementById('editTeamId').value = equipe.id;
            document.getElementById('editTeamName').value = equipe.nomEquipe || '';
            document.getElementById('editTeamCity').value = equipe.ville || '';
            document.getElementById('editTeamDivision').value = equipe.divisionId || '';
            document.getElementById('editTeamFounded').value = equipe.anneeDebut || '';
            document.getElementById('editTeamCeased').value = equipe.anneeFin || '';
            document.getElementById('editBecameTeam').value = equipe.estDevenueEquipe || '';
            
            const modalTitle = document.querySelector('#editTeamModal .modal-title');
            const allFields = document.querySelectorAll('#editTeamForm input, #editTeamForm select');
            const saveButton = document.querySelector('#editTeamModal .btn-hockey-primary');
            const closeField = document.getElementById('editTeamCeased');

            console.log(`saveButton: `, saveButton);

            if(mode === 'view') {
                // Changer le titre
                modalTitle.innerHTML = '<i class="fas fa-eye me-2"></i>Consulter l\'équipe';
                
                // Désactiver tous les champs
                allFields.forEach(field => {
                    field.setAttribute('disabled', 'disabled');
                });
                
                // Cacher le bouton Sauvegarder
                saveButton.style.display = 'none';
            } else if (mode === 'close')  {
                // Mode fermeture (seulement année de fin modifiable)
                modalTitle.innerHTML = '<i class="fas fa-ban me-2"></i>Fermer l\'équipe';
                modalTitle.parentElement.style.background = '#dc3545'; // Rouge pour fermeture
                
                // Désactiver tous les champs SAUF l'année de fermeture
                allFields.forEach(field => {
                    if (field.id !== 'editTeamCeased') {
                        field.setAttribute('disabled', 'disabled');
                    }
                });
                
                // S'assurer que le champ année de fermeture est actif et en focus
                closeField.removeAttribute('disabled');
                closeField.focus();
                
                // Modifier le texte du bouton Sauvegarder
                saveButton.innerHTML = '<i class="fas fa-ban me-1"></i> Fermer l\'équipe';
                saveButton.classList.remove('btn-hockey-primary');
                saveButton.classList.add('btn-danger');
                saveButton.style.display = 'inline-block';
            } else {
                // Mode modification : réactiver tout
                modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Modifier l\'équipe';
                
                allFields.forEach(field => {
                    field.removeAttribute('disabled');
                });

                saveButton.classList.remove('btn-danger');
                saveButton.classList.add('btn-hockey-primary');
                saveButton.style.display = 'inline-block';

                //ajouterEquipeBecameTeam(id);
            }

            // Ouvrir le modal
            const modal = new bootstrap.Modal(document.getElementById('editTeamModal'));
            modal.show();
        }, 100);

    })
    .catch((error) => {
        console.error('Erreur lors du chargement de l\'équipe:', error);
        alert('Erreur lors du chargement des données de l\'équipe');
    });
}

function voirEquipe(id) {
    modifierEquipe(id, 'view');
}

function supprimerEquipe(id) {
    // Récupérer l'équipe pour vérifier si elle n'est pas déjà fermée
    getEquipe(id).then((equipe) => {
        if (equipe.anneeFin) {
            alert(`Cette équipe est déjà fermée depuis ${equipe.anneeFin}.`);
            return;
        }
        
        if (confirm('Voulez-vous fermer cette équipe en ajoutant une année de fin ?')) {
            modifierEquipe(id, 'close');
        }
    });
}

// Fonction pour ajouter une équipe depuis le modal
async function ajouterEquipe() {
    const form = document.getElementById('addTeamForm');
    const formData = new FormData(form);
    
    const nouvelleEquipe = {
        nomEquipe: formData.get('nomEquipe'),
        ville: formData.get('ville'),
        divisionId: formData.get('division'),
        anneeDebut: parseInt(formData.get('anneeDebut')) || null,
        anneeFin: parseInt(formData.get('anneeFin')) || null,
        estDevenueEquipe: parseInt(formData.get('estDevenueEquipe')) || null
    };

    // Validation basique
    if (!nouvelleEquipe.nomEquipe || !nouvelleEquipe.ville || !nouvelleEquipe.divisionId || !nouvelleEquipe.anneeDebut) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    getDernierNumeroEquipe().then((resultat) => {
            nouvelleEquipe.id = resultat;
            return ajoutEquipe(nouvelleEquipe);
        }).then(() => {
            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTeamModal'));
            modal.hide();
            // Réinitialiser le formulaire
            form.reset();
        }).catch((error) => {
            alert('Erreur lors de l\'ajout:', error);
        }).finally(() => { console.log('Fin getDernierNumeroEquipe');
     });
}

async function ajouterStatsEquipe() {
    alert('En construction...');
}

// Fonctions utilitaires
function montrerChargementEquipes(show) {
    document.getElementById('loadingEquipes').style.display = show ? 'block' : 'none';
}

function montrerChargementDivisions(show) {
    document.getElementById('loadingDivisions').style.display = show ? 'block' : 'none';
}

function showError(message) {
    document.getElementById('errorText').textContent = message;
    document.getElementById('errorMessage').style.display = 'block';
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

// Fonction pour récupérer les statistiques d'une année
async function getStatsParAnnee(annee) {
    const url = `${apiBaseUrl}StatsEquipe/parannee/${annee}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Statut de la réponse : ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement des stats:', error.message);
        throw error;
    }
}

// Fonction pour afficher les statistiques de performance
async function afficherStatistiquesDetailees() {
    const statsContent = document.getElementById('statsContent');
    
    // Afficher le sélecteur d'année et le loader
    statsContent.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="form-container">
                    <label for="anneeStats" class="form-label">
                        <i class="fas fa-calendar me-2"></i>Sélectionner une année
                    </label>
                    <select id="anneeStats" class="form-select" onchange="chargerStatsAnnee(this.value)">
                        ${genererOptionsAnnees()}
                    </select>
                </div>
            </div>
        </div>
        <div class="loading" style="display: block;">
            <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
            <p class="mt-2">Chargement des statistiques...</p>
        </div>
        <div id="tableauStats"></div>
    `;

    // Charger les stats de l'année courante
    await chargerStatsAnnee(anneeSelectionnee);
}

// Générer les options d'années (ex: 2015 à année courante)
function genererOptionsAnnees() {
    const anneeActuelle = new Date().getFullYear();
    let options = '';
    for (let annee = anneeActuelle; annee >= 2015; annee--) {
        const selected = annee === anneeSelectionnee ? 'selected' : '';
        options += `<option value="${annee}" ${selected}>${annee}</option>`;
    }
    return options;
}

// Charger les stats pour une année spécifique
async function chargerStatsAnnee(annee) {
    anneeSelectionnee = parseInt(annee);
    const tableauStats = document.getElementById('tableauStats');
    
    try {
        statsEquipes = await getStatsParAnnee(annee);
        
        if (!statsEquipes || statsEquipes.length === 0) {
            tableauStats.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Aucune statistique disponible pour l'année ${annee}.
                </div>
            `;
            return;
        }

        // Calculer les points pour chaque équipe (Victoire = 2 pts, Défaite Prolo = 1 pt)
        statsEquipes.forEach(stat => {
            stat.points = (stat.nbVictoires * 2) + stat.nbDefProlo;
            stat.differentielButs = stat.nbButsPour - stat.nbButsContre;
        });

        // Trier par points (décroissant)
        statsEquipes.sort((a, b) => b.points - a.points);

        afficherTableauStats();
        
    } catch (error) {
        tableauStats.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                Erreur lors du chargement des statistiques : ${error.message}
            </div>
        `;
    } finally {
        // Cacher le loader
        const loader = document.querySelector('#statsContent .loading');
        if (loader) loader.style.display = 'none';
    }
}

// Afficher le tableau des statistiques
function afficherTableauStats() {
    const tableauStats = document.getElementById('tableauStats');
    
    let html = `
        <div class="team-table">
            <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h4 class="mb-0">
                    <i class="fas fa-trophy me-2"></i>
                    Classement ${anneeSelectionnee}
                </h4>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th><i class="fas fa-hashtag me-1"></i> #</th>
                            <th><i class="fas fa-hockey-puck me-1"></i> Équipe</th>
                            <th><i class="fas fa-city me-1"></i> Ville</th>
                            <th class="text-center"><i class="fas fa-play me-1"></i> PJ</th>
                            <th class="text-center"><i class="fas fa-check me-1"></i> V</th>
                            <th class="text-center"><i class="fas fa-times me-1"></i> D</th>
                            <th class="text-center"><i class="fas fa-clock me-1"></i> DP</th>
                            <th class="text-center"><i class="fas fa-crosshairs me-1"></i> BP</th>
                            <th class="text-center"><i class="fas fa-shield-alt me-1"></i> BC</th>
                            <th class="text-center"><i class="fas fa-chart-line me-1"></i> Diff</th>
                            <th class="text-center"><i class="fas fa-star me-1"></i> PTS</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    statsEquipes.forEach((stat, index) => {
        const diffClass = stat.differentielButs >= 0 ? 'text-success' : 'text-danger';
        const positionClass = index < 3 ? 'fw-bold' : '';
        
        html += `
            <tr class="${positionClass}">
                <td>${index + 1}</td>
                <td><strong>${stat.equipe?.nomEquipe || 'N/A'}</strong></td>
                <td>${stat.equipe?.ville || 'N/A'}</td>
                <td class="text-center">${stat.nbPartiesJouees}</td>
                <td class="text-center"><span class="badge bg-success">${stat.nbVictoires}</span></td>
                <td class="text-center"><span class="badge bg-danger">${stat.nbDefaites}</span></td>
                <td class="text-center"><span class="badge bg-warning text-dark">${stat.nbDefProlo}</span></td>
                <td class="text-center">${stat.nbButsPour}</td>
                <td class="text-center">${stat.nbButsContre}</td>
                <td class="text-center ${diffClass}"><strong>${stat.differentielButs > 0 ? '+' : ''}${stat.differentielButs}</strong></td>
                <td class="text-center"><strong class="text-primary fs-5">${stat.points}</strong></td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-12">
                <div class="alert alert-info">
                    <strong><i class="fas fa-info-circle me-2"></i>Légende:</strong><br>
                    PJ = Parties Jouées | V = Victoires | D = Défaites | DP = Défaites en Prolongation/Fusillade<br>
                    BP = Buts Pour | BC = Buts Contre | Diff = Différentiel | PTS = Points (V=2pts, DP=1pt)
                </div>
            </div>
        </div>
    `;

    tableauStats.innerHTML = html;
}

// Modifier le DOMContentLoaded existant pour ajouter les event listeners de navigation
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter les event listeners pour la navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const section = href.substring(1); // Enlever le #
            naviguerVers(section);
        });
    });

    // Afficher la section équipes par défaut
    naviguerVers('equipes');

    setTimeout(() => {
        // Charger les divisions au démarrage
        chargerDivisions().then(() => {
            // Charger les équipes au démarrage
            chargerEquipes().then(() => {
                // Event listeners pour les filtres
                document.getElementById('searchInput').addEventListener('input', filtrerEquipes);
                document.getElementById('divisionFilter').addEventListener('change', filtrerEquipes);
                ajouterEquipeBecameTeam(0);
            }).catch((error) => {
                alert(error);
            });
        }).catch((error) => {
            alert(error);
        });
    }, 200);
});