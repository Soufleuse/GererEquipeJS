async function getEquipe(id) {
    if (id === undefined) {
        return "";
    }
    
    if (id < 1) {
        return "";
    }

    const url = "http://localhost:5245/api/equipe/" + id;
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

    return json;
}

async function ObtenirListeEquipe() {
    console.log("Entrée dans ObtenirListeEquipe");

    const url = "http://localhost:5245/api/equipe/";
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

async function majEquipe(entree)
{
    console.log('Entrée majEquipe : ', entree);
    
    const url = "http://localhost:5245/api/equipe/" + entree.id;
    console.log("url : ", url);
    console.log("data stringifié : " + JSON.stringify(entree));

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
        
        // Optionnel : réinitialiser le formulaire ou rediriger
        // document.forms["modificationequipe"].reset();
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        alert("Erreur lors de la mise à jour de l'équipe.");
    }
}

async function getDernierNumeroEquipe() {
    const url = "http://localhost:5245/api/equipe/prochainid";
    
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

function ajoutEquipe(entree)
{
    const url = "http://localhost:5245/api/equipe/";

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('accept', '*/*');

    fetch(url,
        {
            method: "POST",
            headers: headers,
            body: JSON.stringify(entree)
        }
        ).then((maReponse) => {
            if (maReponse.ok) {
                alert("Équipe ajoutée avec succès!");
                document.getElementById("txtIdEquipe").value = entree.id;
            }
            else {
                const reader = maReponse.body.getReader();
                reader.read().then((itllgetHer) => {
                    const utf8Decoder = new TextDecoder("utf-8");
                    const erreurRecue = utf8Decoder.decode(itllgetHer.value, { stream: true });
                    const erreurParsee = JSON.parse(erreurRecue);
                    console.log(erreurParsee);
                    alert(`Erreur lors de l\'ajout de l'équipe: ${erreurParsee.Message}`);
                });
                return;
            }
        })
        .catch((monErreur) => {
            console.error(monErreur);
            alert("Erreur lors de l\'ajout de l'équipe.");
            return;
        });
}