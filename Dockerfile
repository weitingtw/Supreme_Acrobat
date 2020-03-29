FROM nikolaik/python-nodejs:python3.7-nodejs10
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY install.sh ./

# Bundle app source
COPY . .

RUN /bin/bash -c  "./install.sh"

EXPOSE 3000
EXPOSE 3001
EXPOSE 5001
EXPOSE 5000

CMD [ "npm", "run", "start" ]