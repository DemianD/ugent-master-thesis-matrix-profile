docker build --tag matrix-profile-service .
docker rm matrix-profile-service-instance
docker run --mount type=bind,source=$(PWD)/queue,target=/app/queue \
           --mount type=bind,source=$(PWD)/results,target=/app/results \
           --name matrix-profile-service-instance \
           matrix-profile-service:latest

# docker exec -it matrix-profile-service-instance bash
# docker run -it matrix-profile-service bash
