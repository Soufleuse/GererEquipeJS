// Variables globales
let toutesLesEquipes = [];
let toutesLesDivisions = [];
let equipesAffichees = [];
let currentPage = 1;
const itemsPerPage = 10;
const apiBaseUrl = "http://localhost:5246/api/";

// Vos fonctions d'accès aux données existantes
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
    console.log("Entrée dans ObtenirListeEquipe");

    const url = `${apiBaseUrl}equipe/`;
    let json = "";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Statut de la réponse : ${response.status}`);
        }

        json = await response.json();
        console.log(json);
    }
    catch (error) {
        console.error(error.message);
    }
    
    console.log("Sortie de ObtenirListeEquipe");

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
    
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(entree)
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        alert("Équipe mise à jour avec succès!");
        console.log('Mise à jour réussie - Code:', response.status);
        await chargerEquipes(); // Recharger la liste
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        alert("Erreur lors de la mise à jour de l'équipe.");
    }
}

async function getDernierNumeroEquipe() {
    const url = `${apiBaseUrl}equipe/prochainid`;
    
    let monId = 0;
    const response = await fetch(url);
    if(response.ok) {
        monId = await response.json();
        console.log(`monId: ${monId}`);
    }

    return monId;
    /*fetch(url).then((response) => response.json())
        .then((idARetourner) => {
            console.log(`x: ${idARetourner}`);
            return idARetourner;
        })
    .catch((error) => {
        console.error(error.message);
    });*/
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
        console.error('Erreur lors de l\'ajout:', error);
        alert("Erreur lors de l\'ajout de l'équipe.");
    }
}

// Nouvelles fonctions pour l'interface
async function chargerDivisions() {
    montrerChargementDivisions(true);
    hideError();
    
    try {
        toutesLesDivisions = await listerDivision();
        afficherDivision();
    } catch (error) {
        showError('Erreur lors du chargement des divisions: ' + error.message);
    } finally {
        montrerChargementDivisions(false);
    }
}

async function chargerEquipes() {
    montrerChargementEquipes(true);
    hideError();
    
    try {
        toutesLesEquipes = await getListeEquipe();
        equipesAffichees = [...toutesLesEquipes];
        mettreAJourStatistiques();
        afficherEquipes();
        currentPage = 1;
        mettreAJourPagination();
    } catch (error) {
        showError('Erreur lors du chargement des équipes: ' + error.message);
    } finally {
        montrerChargementEquipes(false);
    }
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
function modifierEquipe(id) {
    alert(`Fonction de modification pour l'équipe ${id} - À implémenter`);
}

function voirEquipe(id) {
    alert(`Fonction de visualisation pour l'équipe ${id} - À implémenter`);
}

function supprimerEquipe(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
        alert(`Fonction de suppression pour l'équipe ${id} - À implémenter`);
    }
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

    try {
        await ajoutEquipe(nouvelleEquipe);
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTeamModal'));
        modal.hide();
        // Réinitialiser le formulaire
        form.reset();
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
    }
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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Charger les divisions au démarrage
    chargerDivisions();

    // Charger les équipes au démarrage
    chargerEquipes();

    // Event listeners pour les filtres
    document.getElementById('searchInput').addEventListener('input', filtrerEquipes);
    document.getElementById('divisionFilter').addEventListener('change', filtrerEquipes);
});