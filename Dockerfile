# Dockerfile multi-stage pour SQL Server + API .NET + Nginx

# Stage 1: Build de l'application .NET
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY c#/ServiceLigueHockeySqlServer/ServiceLigueHockeySqlServer/ServiceLigueHockeySqlServer.csproj ServiceLigueHockeySqlServer/
RUN dotnet restore ServiceLigueHockeySqlServer/ServiceLigueHockeySqlServer.csproj

COPY c#/ServiceLigueHockeySqlServer/ServiceLigueHockeySqlServer/ ServiceLigueHockeySqlServer/
RUN dotnet build ServiceLigueHockeySqlServer/ServiceLigueHockeySqlServer.csproj -c Release -o /app/build
RUN dotnet publish ServiceLigueHockeySqlServer/ServiceLigueHockeySqlServer.csproj -c Release -o /app/publish

# Stage 2: Image finale avec SQL Server
FROM mcr.microsoft.com/mssql/server:2022-latest

USER root

# Installer .NET Runtime, ASP.NET Core Runtime et Nginx
RUN apt-get update && \
    apt-get install -y wget nginx supervisor && \
    wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb && \
    dpkg -i packages-microsoft-prod.deb && \
    apt-get update && \
    apt-get install -y aspnetcore-runtime-8.0 dotnet-runtime-8.0 && \
    rm -rf /var/lib/apt/lists/* && \
    rm packages-microsoft-prod.deb

# Créer les répertoires nécessaires
RUN mkdir -p /app /var/www/html /usr/local/share/ca-certificates
RUN mkdir -p /app /var/www/html /usr/local/share/ca-certificates /var/log/supervisor

# Copier l'application .NET
COPY --from=build /app/publish /app/

# Copier les fichiers web JavaScript
COPY js/GererEquipeJS/ /var/www/html/

# Copier les certificats (si présents)
COPY js/GererEquipeJS/certificats/*.crt /usr/local/share/ca-certificates/

# Copier les configurations Nginx et Supervisor
COPY js/GererEquipeJS/conf/nginx.conf /etc/nginx/sites-available/default
COPY js/GererEquipeJS/conf/supervisord.conf /etc/supervisord.conf

# Mettre à jour les certificats CA
RUN update-ca-certificates || true

# Définir les permissions
RUN chown -R www-data:www-data /var/www/html

# Variables d'environnement
ENV ASPNETCORE_ENVIRONMENT=Development
ENV DOTNET_ENVIRONMENT=Development

# Créer les scripts d'initialisation
COPY c#/ServiceLigueHockeySqlServer/scripts/init-db.sh /init-db.sh
COPY c#/ServiceLigueHockeySqlServer/scripts/start.sh /start.sh

RUN chmod +x /init-db.sh /start.sh

# Exposer les ports
EXPOSE 1433 5245 12080

# Volume pour la persistance
VOLUME ["/var/opt/mssql"]

CMD ["/start.sh"]