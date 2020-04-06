FROM node as build-deps
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
COPY . ./
RUN npm install
RUN npm run build

# Stage 2 - the production environment
FROM nikolaik/python-nodejs:python3.7-nodejs10 
#FROM nginx:1.12-alpine
RUN apt-get update
##RUN apt-get install apt-file
##RUN apt-file update
RUN apt-get install software-properties-common -y
RUN \
    add-apt-repository -y ppa:nginx/stable && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/* && \
    chown -R www-data:www-data /var/lib/nginx

COPY --from=build-deps /usr/src/app/build /var/www/html
RUN ls
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]