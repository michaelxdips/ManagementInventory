# Stage 1: Build
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Set API URL to empty to let Nginx proxy handle it (relative path)
# OR hardcode if we aren't using Nginx proxy. 
# Best practice: Use relative path in axios config, let Nginx proxy to backend.
# But our current axios setup uses absolute URL/dynamic.
# Let's clean that up or ensure proxy works.
ENV VITE_API_URL=/api

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
