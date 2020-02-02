#/bin/bash

# frame=$(echo "1ADguo6v1jVFFiN3GtQ/hBI=" |  base64 -d | od -t x1 -An | xargs)
# echo -n "${frame//[[:space:]]/}"

node test.js ./adeunisrf_ftd_codec.js "1ADguo6v1jVFFiN3GtQ/hBI=" \
    '{"accelerometerTrigger":false,"button1Trigger":false,"latitude":-21.751816666666667,"longitude":-800.0906666666667,"quality":15,"satellites":15}'
node test.js ./adeunisrf_ftd_codec.js "nxtFEJNwAFRBMDrqWg8QdPw=" \
    '{"accelerometerTrigger":false,"batteryVoltage":3856,"button1Trigger":false,"downlinkCounter":255,"latitude":45.18228333333333,"longitude":5.7355,"quality":15,"satellites":15,"temperature":27,"uplinkCounter":255}'
node test.js ./adeunisrf_ftd_codec.js "vxtFEJNAAFRBMDr0Ww8Ihu8=" \
    '{"accelerometerTrigger":false,"batteryVoltage":3848,"button1Trigger":true,"downlinkCounter":255,"latitude":45.182233333333336,"longitude":5.7355,"quality":15,"satellites":15,"temperature":27,"uplinkCounter":255}'
node test.js ./adeunisrf_ftd_codec.js "nhtFEJNwAFRBMDjgWQ8H" \
    '{"accelerometerTrigger":false,"button1Trigger":false,"latitude":-21.751816666666667,"longitude":-700.0906666666667,"quality":15,"satellites":15}'
node test.js ./adeunisrf_ftd_codec.js "vxtFFZaQAFU0UCcgIA/JUgc=" \
    '{"accelerometerTrigger":false,"button1Trigger":true,"temperature":27,"latitude":45.26615,"longitude":5.890833333333333,"satellites":15,"quality":15,"uplinkCounter":255,"downlinkCounter":255,"batteryVoltage":4041}'
