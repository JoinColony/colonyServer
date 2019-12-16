#!/bin/bash

if [ $(node --version) != "v$(cat .nvmrc)" ]; then
  echo "Node versions do not match. Please use node version $(cat .nvmrc) (preferably using nvm)"
  exit 1;
fi
