#!/bin/bash

gnome-terminal -- bash -c "cd ./api-gateway && node src/app.js; exec bash"
gnome-terminal -- bash -c "cd ./core && python3 app.py; exec bash"
gnome-terminal -- bash -c "cd ./web && ng serve --open; exec bash"