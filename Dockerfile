FROM nginx:1.29.3-alpine-slim AS fin-finale

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

# Copier les configurations Nginx et Supervisor
COPY js/GererEquipeJS/conf/nginx.conf /etc/nginx/conf.d/default.conf
COPY js/GererEquipeJS/conf/supervisord.conf /etc/supervisord.conf

# Définir les permissions appropriées
RUN chown -R nginx:nginx /var/www/html

# Exposer le port 12080 (Nginx) et le port pour l'API .NET (5245 dans mon cas)
# 1433 est pour SQL Server
EXPOSE 12080

# Démarrer Supervisor qui gérera Nginx, PHP-FPM et l'application .NET
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]