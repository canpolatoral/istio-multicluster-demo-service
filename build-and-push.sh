#!/bin/bash

# Variables - replace `your_dockerhub_username` with your actual Docker Hub username
DOCKER_USERNAME="canpolatoral"
CALLER_IMAGE_NAME="caller-service"
RECEIVER_IMAGE_NAME="receiver-service"
VERSION="1.0.14" # You can change this to a specific version if needed

# Build caller-service service image
echo "Building ${CALLER_IMAGE_NAME} image..."
docker build -t $DOCKER_USERNAME/$CALLER_IMAGE_NAME:$VERSION -f caller-service/Dockerfile caller-service/
if [ $? -ne 0 ]; then
  echo "Failed to build ${CALLER_IMAGE_NAME} image."
  exit 1
fi

# Push caller-service service image
echo "Pushing ${CALLER_IMAGE_NAME} image to Docker Hub..."
docker push $DOCKER_USERNAME/$CALLER_IMAGE_NAME:$VERSION
if [ $? -ne 0 ]; then
  echo "Failed to push ${CALLER_IMAGE_NAME} image."
  exit 1
fi

# Build receiver-service service image
echo "Building ${RECEIVER_IMAGE_NAME} image..."
docker build -t $DOCKER_USERNAME/$RECEIVER_IMAGE_NAME:$VERSION -f receiver-service/Dockerfile receiver-service/
if [ $? -ne 0 ]; then
  echo "Failed to build ${RECEIVER_IMAGE_NAME} image."
  exit 1
fi

# Push receiver-service service image
echo "Pushing ${RECEIVER_IMAGE_NAME} image to Docker Hub..."
docker push $DOCKER_USERNAME/$RECEIVER_IMAGE_NAME:$VERSION
if [ $? -ne 0 ]; then
  echo "Failed to push ${RECEIVER_IMAGE_NAME} image."
  exit 1
fi

echo "All images built and pushed successfully!"
