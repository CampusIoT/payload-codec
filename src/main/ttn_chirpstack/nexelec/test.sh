#/bin/bash

FILE=$1
CODEC="nexelec_orign_codec.js"
DATAENCODING="hex"
while IFS=";" read -r fport data object
do
    echo $fport $data $object
    node test.js $CODEC $DATAENCODING $fport $data $object
done <  <(tail -n +2 "${FILE}")
