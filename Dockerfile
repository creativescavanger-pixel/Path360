FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
