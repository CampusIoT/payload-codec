#/bin/bash

echo; echo payload_elt2hp_maxbotix
./test.sh payload_elt2hp_maxbotix.csv

echo; echo payload_ems
./test.sh payload_ems.csv

echo; echo payload_ers
./test.sh payload_ers.csv

echo; echo payload_ers_co2
./test.sh payload_ers_co2.csv

echo; echo payload_ers_eye
./test.sh payload_ers_eye.csv

echo; echo payload_ers_sound
./test.sh payload_ers_sound.csv
