FROM python:3.7
COPY . /app
WORKDIR /app

RUN chmod +x install.sh

RUN ./install.sh

EXPOSE 5001

CMD ["python3","api-server2.py"]