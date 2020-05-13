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

fileid="16Neexi-QyX-WettcN6Oc6mNNuK4NlsIr"
filename="roberta.zip"
curl -c ./cookie -s -L "https://drive.google.com/uc?export=download&id=${fileid}"
curl -Lb ./cookie "https://drive.google.com/uc?export=download&confirm=`awk '/download/ {print $NF}' ./cookie`&id=${fileid}" -o ${filename}

fileid="1TQpXv7M22A4wHro7GWX3bzFqKEy46ypG"
filename="model_save.zip"
curl -c ./cookie -s -L "https://drive.google.com/uc?export=download&id=${fileid}" 
curl -Lb ./cookie "https://drive.google.com/uc?export=download&confirm=`awk '/download/ {print $NF}' ./cookie`&id=${fileid}" -o ${filename}

rm cookie
mv roberta.zip ML-API/entity/roberta.zip
mv model_save.zip ML-API/relation/model_save.zip

cd ML-API/relation
unzip model_save
rm model_save.zip

cd ../entity/
unzip roberta
rm roberta.zip



echo "
------------------------------------
฿ all node modules were installed !!
------------------------------------"