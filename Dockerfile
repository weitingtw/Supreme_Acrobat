
### build frontend src
FROM node as build-deps
WORKDIR /usr/src/app
COPY view .
RUN npm install
RUN npm run build

FROM nikolaik/python-nodejs:python3.7-nodejs10



## nginx
RUN apt-get update
RUN apt-get install software-properties-common -y
RUN \
    add-apt-repository -y ppa:nginx/stable && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/* && \
    chown -R www-data:www-data /var/lib/nginx

RUN wget -qO - https://adoptopenjdk.jfrog.io/adoptopenjdk/api/gpg/key/public | sudo apt-key add -
RUN add-apt-repository --yes https://adoptopenjdk.jfrog.io/adoptopenjdk/deb/
RUN apt-get update && sudo apt-get install adoptopenjdk-8-hotspot

COPY --from=build-deps /usr/src/app/build /var/www/html


# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY install.sh ./

# Bundle app source
COPY . .

RUN /bin/bash -c  "./install.sh"
RUN rm /etc/nginx/sites-enabled/default
RUN mv default /etc/nginx/sites-enabled/default

RUN wget https://github.com/kermitt2/grobid/zipball/master
RUN unzip master
RUN mv ./kermitt* master2
RUN ./master2/gradlew clean install

EXPOSE 80
EXPOSE 3001
EXPOSE 5001
EXPOSE 5000

CMD [ "npm", "run", "docker" ]