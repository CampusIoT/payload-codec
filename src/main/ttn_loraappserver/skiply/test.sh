#/bin/bash

node test.js ./smilio_codec.js "010c800c8064" '{"type":"keepalive","batteryIdle":3200,"batteryTx":3200}'
node test.js ./smilio_codec.js "020001001000A000230010" '{"type":"normal","but1":1,"but2":16,"but3":160,"but4":35,"but5":16}'
node test.js ./smilio_codec.js "030001001000A000230010" '{"type":"ack","but1":1,"but2":16,"but3":160,"but4":35,"but5":16}'
