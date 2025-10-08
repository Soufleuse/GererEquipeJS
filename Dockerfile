# Stage pour construire l'application .NET
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS dotnet-build

# Section si on prend le repo Git
# Installer git pour cloner le repository
#RUN apk add --no-cache git

# Cloner le repository
#RUN git clone https://github.com/Soufleuse/ServiceLigueHockeyV2.git /src
#RUN git clone https://github.com/Soufleuse/ServiceLigueHockeySqlServer.git /src

# Section si on copie à partir du chemin relatif
COPY c#/ServiceLigueHockeySqlServer /src
RUN ls /src

WORKDIR /src

# Restore des packages NuGet
RUN dotnet restore

# Build et publish de l'application
RUN dotnet publish -c Release -o /app --no-restore

FROM nginx:1.29.0-alpine-slim AS fin-finale

COPY js/GererEquipeJS/certificats/*.crt /usr/local/share/ca-certificates/

RUN apk --no-cache --no-check-certificate \
    add ca-certificates \
    && update-ca-certificates

# Installer Supervisor (sans MySQL/MariaDB et extensions MySQL)
RUN apk add --no-cache \
    supervisor

# Installer le runtime .NET et les dépendances pour SQL Server
RUN apk add --no-cache \
    dotnet8-runtime \
    aspnetcore8-runtime \
    krb5-libs \
    libgcc \
    libintl \
    libssl3 \
    libstdc++ \
    zlib

# CONFIGURATION ENVIRONNEMENT Production
# Définir les variables d'environnement pour la Production
#ENV ASPNETCORE_ENVIRONMENT=Production
#ENV DOTNET_ENVIRONMENT=Production
# Pour le développement
ENV ASPNETCORE_ENVIRONMENT=Development
ENV DOTNET_ENVIRONMENT=Development

# Crée /var/www/html pour aller mettre ce qui a été créé dans le stage depart
RUN mkdir -p /var/www/html
COPY js/GererEquipeJS/src /var/www/html/

# Copier l'application .NET compilée
RUN mkdir -p /app
COPY --from=dotnet-build /app /app

# Copier les configurations Nginx et Supervisor
COPY js/GererEquipeJS/conf/nginx.conf /etc/nginx/conf.d/default.conf
COPY js/GererEquipeJS/conf/supervisord.conf /etc/supervisord.conf

# Définir les permissions appropriées
RUN chown -R nginx:nginx /var/www/html

# Exposer le port 12080 (Nginx) et le port pour l'API .NET (5245 dans mon cas)
# 1433 est pour SQL Server
EXPOSE 12080 5245 1433

# Démarrer Supervisor qui gérera Nginx, PHP-FPM et l'application .NET
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]