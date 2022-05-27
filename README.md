// Mostra os processos que estão em execução
- docker ps

// Roda o container com postgres
- docker run --name postgresdb2 -e POSTGRES_USER=itallo -e POSTGRES_PASSWORD=minhasenhasecreta -e POSTGRES_DB=heroes -p 5432:5432 -d postgres

// Entra no container 
- docker exec -it <nome do container> <diretorio (/bin/bash)>


// painel administrativo
- docker run --name adminer2 -p 8080:8080 --link postgresdb2:postgresdb2 -d adminer


## MongoDB
# // create a mongodb container
- docker run --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=senhaadmin -d mongo:4

# // create a client and linking with mongo
- docker run --name mongoclient -p 3000:3000 --link mongodb:mongodb -d mongoclient/mongoclient


# // create a new user
- docker exec -it mongodb mongo --host localhost -u admin senhaadmin --authenticationDatabase admin --eval "db.getSiblingDB('herois').createUser({user: 'itallo', pwd: 'minhasenhasecreta', roles: [{role: 'readWrite', db: 'herois'}]})"

# // executando o mongo pelo terminal
docker exec -it <id do mongo para conectar> mongo -u admin -p senhaadmin


### remove todos os containers (inativos ou ativos)
- docker rm $(docker ps -aq)