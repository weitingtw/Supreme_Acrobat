FROM python:3.7
COPY . /app
WORKDIR /app

RUN chmod +x install.sh
RUN chmod +x gunicorn_starter.sh

RUN ./install.sh

EXPOSE 5000

ENTRYPOINT ["./gunicorn_starter.sh"]
