#/bin/bash

FILE=$1
CODEC="bosch_parking_codec.js"
DATAENCODING="base64"
while IFS=";" read -r fport data object
do
    echo $fport $data $object
    node test.js $CODEC $DATAENCODING $fport $data $object
done <  <(tail -n +2 "${FILE}")
