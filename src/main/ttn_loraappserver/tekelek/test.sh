#/bin/bash

node test.js ./tekelek_tek766_codec.js "1000000000A30CAA00A20BAA00A20EAA00A620AA"  | jq .
node test.js ./tekelek_tek766_codec.js "1000000000A20BAA00A20EAA00A620AA00A30CAA"  | jq .
