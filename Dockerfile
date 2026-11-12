# Build the site (prerendered pages, sitemap, service worker file list), then serve dist/ with nginx.
#   docker build --target lint .   -> runs the linter only
#   docker build .                 -> the image that serves the site

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

FROM deps AS lint
RUN npm run lint

FROM deps AS build
# Settings from .env.example; pass --build-arg (or set them in compose.yaml) to override.
ARG VITE_SITE_URL=http://localhost:8088
ARG VITE_CONTACT_EMAIL=hello@example.com
ARG VITE_MEALDB_API_KEY=1
ENV VITE_SITE_URL=$VITE_SITE_URL \
    VITE_CONTACT_EMAIL=$VITE_CONTACT_EMAIL \
    VITE_MEALDB_API_KEY=$VITE_MEALDB_API_KEY
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# The prerender step's server bundle isn't needed at runtime.
RUN rm -rf /usr/share/nginx/html/.server
EXPOSE 80
