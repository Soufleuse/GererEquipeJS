# Construire l'image
docker build --no-cache -t mon-exemple-js .

# Rouler l'image
docker compose up

docker run -p 12080:12080 -p 5246:5246 -d -v C:\Users\lemst5\source\repos\js\GererEquipeJs\mysql_data:/var/lib/mysql --name mon-application mon-exemple-js

# Stopper l'application
docker compose stop

# Détruire l'image
docker rmi mon-exemple-js
