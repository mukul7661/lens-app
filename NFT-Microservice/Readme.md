# System Architecture Documentation

## Overview

This system is designed to interface with various blockchain networks to retrieve, update, and store non-fungible token (NFT) data. It utilizes a microservices architecture for modularity and ease of maintenance.

## Architecture

### Blockchain Networks

- **Ethereum**: The primary blockchain network used for retrieving NFT data.
- **Polygon**: An Ethereum scaling solution and sidechain that supports faster and cheaper transactions.
- **Zora**: Specialized in NFT data handling.
- **Optimism**: An Ethereum layer-two scaling solution offering faster and cheaper transactions.

### Microservice Architecture

The system is built on a microservices architecture framework, which includes:

- **Microservice for NFTs**
  - **Uses Alchemy API**: To fetch and update NFT metadata from the blockchain networks.
  - **Updates S3 Bucket**: Stores the updated NFT data, including images, in an Amazon S3 bucket.

### AWS Lambda

Utilizes AWS Lambda for running backend code that scales automatically with the number of requests.

## Functionality

- **Get User NFTs**: Retrieves user NFTs from each supported blockchain network.
- **Request Handling Microservice**: Processes incoming requests and interacts with the Alchemy API.
- **Alchemy API Integration Microservice**: Updates NFT metadata.
- **NFT Data Update Microservice**: Retrieves images and prepares them for upload.
- **Image Upload Microservice**: Handles the upload of NFT images to the S3 bucket.

## Deployment Instructions

1. **Setup AWS Services**:
   - Configure AWS Lambda functions for each microservice.
   - Setup an S3 bucket with appropriate permissions.

2. **Blockchain Network Interaction**:
   - Ensure each Lambda function has the required access to the blockchain networks.

3. **Configure Alchemy API**:
   - Obtain and configure Alchemy API keys within the microservices.

4. **Deploy Microservices**:
   - Package and deploy each microservice to AWS Lambda.
   - Test each microservice to ensure functionality.

5. **System Integration Testing**:
   - Conduct end-to-end tests to verify all components are working as expected.

6. **Monitoring and Logging**:
   - Setup AWS CloudWatch for Lambda monitoring and logging.

