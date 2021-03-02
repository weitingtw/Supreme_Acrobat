FROM python:3.7
COPY . /app
WORKDIR /app

RUN chmod +x install.sh

RUN ./install.sh

EXPOSE 5000

CMD ["gunicorn","-w","4","-b","0.0.0.0:5000","api-server:api-server"]
