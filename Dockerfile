# Этап 1: Сборка
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
# Важно: если будешь размещать админку по пути /admin, добавь --base-href=/admin/
RUN npm run build -- --configuration production 

# Этап 2: Раздача через легкий Nginx
FROM nginx:alpine
COPY --from=build /app/dist/mantera-hostel-group-front/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]