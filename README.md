
# WorkNest

A full-stack Project Management and Collaboration tool built with the T3 stack, designed for team productivity and seamless project management. This application integrates a Next.js frontend with a serverless backend deployed on AWS using SST, and it leverages Supabase for PostgreSQL database management.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [User Journey](#user-journey)
- [Features](#features)
- [Installation & Setup](#installation--setup)
- [Deployment](#deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Known Issues](#known-issues)

---

## Overview

**WorkNest** is a task management and collaboration tool that allows users to:
- Sign up and create their first project.
- Invite teammates and assign different roles.
- Create and manage tasks with deadlines, tags, and statuses.
- Collaborate using a drag-and-drop interface for easy task updates.
- Manage projects with strict access controls ensuring that each project’s data is isolated and secure.

The app is built using modern technologies, leveraging the T3 stack, and is deployed on AWS via SST, utilizing services like AWS Lambda (Edge functions), S3, CloudFront, and CloudWatch.

---

# Tech Stack

- **Frontend Framework:** Next.js (15 App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **API & Data Layer:** tRPC
- **ORM:** Prisma
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** NextAuth with GitHub Provider (JWT strategy)
- **Deployment:** AWS using SST (Serverless Stack)
- **CI/CD:** GitHub Actions

---

## User Journey

1. **Signup:**  
   Users sign up using their GitHub account.

2. **Project Creation:**  
   After registration, users create their first project.

3. **Collaboration:**  
   Within each project, users can invite teammates and assign roles (e.g., owner, admin, member).

4. **Task Management:**  
   - Users create tasks with detailed descriptions, deadlines, and tags.
   - Tasks can be assigned to specific users.
   - Task statuses can be updated manually or via a drag-and-drop interface.
   - Only owners/admins have permissions to edit or delete projects or tasks, while members can only view tasks created by or assigned to them.

5. **Project Isolation:**  
   Each project is isolated ensuring that tasks and data are accessible only to the relevant team members.

---

## Features

- **Intuitive Task Management:**  
  Create, assign, and track tasks with deadlines and priorities.

- **Role-Based Access Control:**  
  Different levels of access (owner, admin, member) to manage tasks and project settings.

- **Real-Time Collaboration:**  
  Invite team members, assign roles, and view tasks dynamically.

- **Secure Authentication:**  
  Utilize NextAuth with GitHub authentication (JWT) to secure user sessions.

- **Serverless Deployment:**  
  Deployed on AWS using SST with underlying services:
  - AWS Lambda (for Edge functions)
  - S3 (for site data)
  - CloudFront (for CDN)
  - CloudWatch (for logging)

- **Automated CI/CD:**  
  GitHub Actions pipeline for continuous integration and deployment on every code push.

---

# Installation & Setup

## Prerequisites

- **Node.js (v20 or higher)**
- **npm**
- **An AWS Account** with proper IAM credentials
- **A Supabase Account** for PostgreSQL database management

# How to Set Up the Project and Run on Your Machine

## Clone the Repository and install dependencies

```bash
git clone https://github.com/ayusharma-ctrl/WorkNest.git
cd WorkNest
npm install
```

## Configure Environment Variables - follow .env.example file

## Run the Project Locally

```bash
npm run dev
```

# Deploying to AWS

Before deploying, ensure your **AWS credentials** are properly configured. Follow the guide here:  
🔗 [Configure AWS IAM Credentials](https://sst.dev/docs/iam-credentials#credentials)

Once configured, deploy with:

```bash
npx sst deploy --stage production
```


## Setting up the new T3 Stack from Scratch

### Create a New T3 App

```bash
npm create t3-app@latest
```

## Select the Following Configuration

- **Project Name:** AppName
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **API:** tRPC
- **Authentication:** NextAuth.js
- **ORM:** Prisma
- **Router:** Choose the classic pages or Next.js App Router as required

## Setting up SST for AWS Deployment

### Install SST CLI

```bash
npm create sst

```

### Note for Windows Users: 
#### If you encounter issues, use:

```bash
npm install sst@two --save-exact

```

## Deployment

### Configure AWS IAM Credentials

1. Create an IAM user in your AWS account.
2. Generate an **Access Key** and **Secret**.
3. Follow the [SST IAM Credentials Guide](https://sst.dev/docs/iam-credentials/) to properly configure your environment.
4. Create an **IAM group**, add your user to the group, create a **policy** for the group, and attach the policy.

### Deploy Your Application

```bash
npm run deploy
```

This command is equivalent to running:

```bash
sst deploy --stage production
```

### Environment Variables
Create a .env file in the root directory with the following keys or follow .env.example file:

```bash
AUTH_SECRET=your_secret
NEXTAUTH_URL=your_server_url
DATABASE_URL=your_postgresql_connection_string
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

```

You also need to save these to github repository if you have plans to setup CI/CD using Github Actions.

# Known Issues

## SST on Windows:
- SST may have limited support on native Windows environments. It is recommended to use Windows Subsystem for Linux (WSL) if you encounter issues.

