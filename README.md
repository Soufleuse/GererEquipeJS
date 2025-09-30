# Construire l'image
docker build --no-cache -t mon-exemple-js .

# Rouler l'image
docker run -p 12080:12080 -p 5245:5245 -d -v C:\Users\lemst5\source\repos\js\GererEquipeJs\mysql_data:/var/lib/mysql -e MYSQL_DATABASE=LigueHockey -e MYSQL_USER=<mon-user> -e MYSQL_PASSWORD=<mon-mot-de-passe> -e MYSQL_ROOT_PASSWORD=<mon-mot-de-passe> --name mon-application mon-exemple-js

docker run -p 12080:12080 -p 5245:5245 -d -v C:\Users\lemst5\source\repos\js\GererEquipeJs\mysql_data:/var/lib/mysql --name mon-application mon-exemple-js

# Stopper l'application
docker stop mon-application

# Détruire l'image
docker rmi mon-exemple-js