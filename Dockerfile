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

# Install MongoDB
RUN wget https://repo.mongodb.org/apt/ubuntu/dists/bionic/mongodb-org/4.2/multiverse/binary-amd64/mongodb-org-server_4.2.2_amd64.deb
RUN dpkg -i mongodb-org-server_4.2.2_amd64.deb

# Copy colonyServer
COPY . ./colonyServer

WORKDIR /colonyServer

# Setup the server modules
RUN npm i --force

# Build the server files
RUN npm run build

# Create mongo's data and logs folders
RUN mkdir mongo-data logs

# Expose the Apollo Server's port
EXPOSE 3000

# Start the Express Server, The MongoDB Server and setup the Database schema
CMD ["npm", "run", "prod"]

# READY TO GO !
