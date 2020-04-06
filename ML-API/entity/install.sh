python3 -m pip install -r requirements.txt
python3 -m nltk.downloader punkt

fileid="1kQExz-YngdZU8OhRnOhEstlEP2vbGvQZ"
filename="best-model.pt"
curl -c ./cookie -s -L "https://drive.google.com/uc?export=download&id=${fileid}"
curl -Lb ./cookie "https://drive.google.com/uc?export=download&confirm=`awk '/download/ {print $NF}' ./cookie`&id=${fileid}" -o ${filename}

rm cookie