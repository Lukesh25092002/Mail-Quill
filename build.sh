#!/usr/bin/bash

gnome-terminal -- bash -c "cd ./api-gateway && npm install; exec bash"
gnome-terminal -- bash -c "cd ./core && pip install -r requirements.txt; exec bash"
gnome-terminal -- bash -c "cd ./web && npm install; exec bash"