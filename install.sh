#!/bin/bash
echo "
----------------------------------------
฿ installing node modules for server ...
----------------------------------------"
cd server/
npm install



echo "
--------------------------------------------------------------
฿ installing node modules for React, this may take a while ...
--------------------------------------------------------------"
cd ../view/
npm install



echo "
----------------------------------------------
฿ installing machine learning api packages ...
----------------------------------------------"
cd ../ML-API
python3 -m pip install -r requirements.txt

python3 -m nltk.downloader punkt

echo "
-------------------------------------
฿ installing general node modules ...
-------------------------------------"
cd ..
npm install


echo "                                                                                                                       
-------------------------------------                                                                                        
฿ retrieving ML Models ...                                                                                        
-------------------------------------"

fileid="1kQExz-YngdZU8OhRnOhEstlEP2vbGvQZ"
filename="best-model.pt"
curl -c ./cookie -s -L "https://drive.google.com/uc?export=download&id=${fileid}"
curl -Lb ./cookie "https://drive.google.com/uc?export=download&confirm=`awk '/download/ {print $NF}' ./cookie`&id=${fileid}" -o ${filename}


fileid="1rcPqiyJUuss59VN5H0BN9dUWkukW6Y4B"
filename="glove_model.joblib"
curl -c ./cookie -s -L "https://drive.google.com/uc?export=download&id=${fileid}" 
curl -Lb ./cookie "https://drive.google.com/uc?export=download&confirm=`awk '/download/ {print $NF}' ./cookie`&id=${fileid}" -o ${filename}

fileid="1TQpXv7M22A4wHro7GWX3bzFqKEy46ypG"
filename="model_save.zip"
curl -c ./cookie -s -L "https://drive.google.com/uc?export=download&id=${fileid}" 
curl -Lb ./cookie "https://drive.google.com/uc?export=download&confirm=`awk '/download/ {print $NF}' ./cookie`&id=${fileid}" -o ${filename}

rm cookie
mv best-model.pt ML-API/best-model.pt
mv glove_model.joblib ML-API/glove_model.joblib
mv model_save.zip ML-API/model_save.zip

cd ML-API
unzip model_save
rm model_save.zip


echo "
------------------------------------
฿ all node modules were installed !!
------------------------------------"