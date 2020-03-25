#/bin/bash

SKIP=1
FILE="uplink.csv"
CODEC="bosch_parking_codec.js"
DATAENCODING="base64"
while IFS=";" read -r fport data object
do
    echo $fport $data $object
    node test.js $CODEC $DATAENCODING $fport $data $object
done <  <(tail -n$((`cat "${FILE}" | wc -l` - SKIP)) "${FILE}")
