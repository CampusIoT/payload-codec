#/bin/bash

node test.js ./tekelek_tek766_codec.js "1000000000A30CAA00A20BAA00A20EAA00A620AA" '{"type":"keepalive","batteryIdle":3200,"batteryTx":3200}' | jq .
node test.js ./tekelek_tek766_codec.js "1000000000A20BAA00A20EAA00A620AA00A30CAA" '{"type":"ack","but1":1,"but2":16,"but3":160,"but4":35,"but5":16}' | jq .
