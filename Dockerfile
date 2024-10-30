FROM node:14.18.0-bullseye

# Update the apt cache
RUN apt-get clean
RUN apt-get update

# Apt-utils needs to be in before installing the rest
RUN apt-get install -y \
  locales \
  apt-utils \
  build-essential \
  curl \
  file \
  zip

# Reconfigure locales
RUN echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
RUN locale-gen

# Install new version of NPM
RUN npm i -g npm@8 --registry=https://registry.npmjs.org

# RUN wget http://security.debian.org/debian-security/pool/updates/main/g/glibc/multiarch-support_2.28-10+deb10u4_amd64.deb
# RUN dpkg -i multiarch-support_2.28-10+deb10u4_amd64.deb

# RUN wget http://ftp.ro.debian.org/debian/pool/main/c/curl/libcurl3-gnutls_7.74.0-1.3+deb11u13_amd64.deb
# RUN dpkg -i libcurl3-gnutls_7.74.0-1.3+deb11u13_amd64.deb

# Install version 1.0.0 of libssl
# Required by Mongo
# RUN wget http://archive.debian.org/debian-security/pool/updates/main/o/openssl/libssl1.0.0_1.0.1t-1+deb8u12_amd64.deb
# RUN dpkg -i libssl1.0.0_1.0.1t-1+deb8u12_amd64.deb

# Install MongoDB
# RUN wget https://repo.mongodb.org/apt/ubuntu/dists/xenial/mongodb-org/4.4/multiverse/binary-amd64/mongodb-org-server_4.4.29_amd64.deb
# RUN dpkg -i mongodb-org-server_4.4.29_amd64.deb

# RUN wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add - && \
#   echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list && \

# Add MongoDB 4.4 repository and install
RUN wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add - && \
  echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list && \
  apt-get update && \
  apt-get install -y mongodb-org && \
  rm -rf /var/lib/apt/lists/*

# Copy colonyServer
COPY . ./colonyServer

WORKDIR /colonyServer

# Setup the server modules
RUN npm i --force

# Build the server files
RUN npm run build

# Create mongo's data and logs folders
RUN mkdir logs

# Expose the Apollo Server's port
EXPOSE 3000

# Start the Express Server, The MongoDB Server and setup the Database schema
CMD ["npm", "run", "prod"]

# READY TO GO !
