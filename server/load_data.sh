dataDir="../../COMPLETE"

echo "Loading data from $dataDir to db";
# txtData=$(cat example.txt)
# annData=$(cat example.ann)

# curl -X POST --data "txt=${txtData}&ann=${annData}" http://localhost:3001/api/putCaseReport/

for entry in "$dataDir"/*.ann
do	
	filename=$(basename -- "$entry")
	extension="${entry##*.}"
	filename="${entry%.*}"
	txtFile=$filename.txt
	annFile=$entry
	txtData=$(cat $txtFile)
	annData=$(cat $annFile)
	name=$(basename "$entry" ".ann")
	curl -X POST --data "pmid=${name}&txt=${txtData}&ann=${annData}" http://localhost:3001/api/putCaseReport/

done
echo "Finished loading data"
echo "###############"
exit
