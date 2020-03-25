#/bin/bash

SKIP=1
FILE="uplink.csv"
CODEC="tekelek_tek766_codec.js"
DATAENCODING="hex"
while IFS=";" read -r fport data object
do
    echo $fport $data $object
    node test.js $CODEC $DATAENCODING $fport $data $object
done <  <(tail -n$((`cat "${FILE}" | wc -l` - SKIP)) "${FILE}")
