# Chronos

## Configuring Project

To configure this projects Frontend you should define enviroment variables VITE_BACKEND_URL and VITE_CORS_PROXY_URL.

VITE_BACKEND_URL has a link to your backend api, e.g. http://localhost:1109/api/

VITE_CORS_PROXY_URL has a prefix for foreign iCal links to deal with CORS errors. 
It is prefixed to links. It can be a link to built-in backend CORS proxy like http://localhost:1109/cors-proxy/ or other service with similar schema

## How to run

To run development server
> npm i; npm run dev

 To build for deploy
> npm i; npm run build


