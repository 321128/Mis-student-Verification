#!/bin/sh
# Start the React app in the background
npm run start &
# Start the Express server
node server.js