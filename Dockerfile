### build stage ###
FROM node:lts-alpine as builder
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm install @vercel/ncc
RUN npx ncc build index.js -o dist

### run stage ###
FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist/* . 
COPY --from=builder /usr/src/app/buttons .
ENTRYPOINT ["node", "index.js"]