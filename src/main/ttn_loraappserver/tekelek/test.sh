#/bin/bash

node test.js ./tekelek_tek766_codec.js 16 "1000000000A30CAA00A20BAA00A20EAA00A620AA"  | jq .
node test.js ./tekelek_tek766_codec.js 16 "1000000000A20BAA00A20EAA00A620AA00A30CAA"  | jq .
node test.js ./tekelek_tek766_codec.js 48 "3000000201083700380064016806000D1753" | jq .
node test.js ./tekelek_tek766_codec.js 16 "100000000033173A0033173A0000000000000000" | jq .
