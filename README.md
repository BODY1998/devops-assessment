# DevOps Technical Assessment – Microservice Deployment Automation

This repository contains the completed implementation of the DevOps technical assessment for automating the provisioning, deployment, and monitoring of a simple containerized web application on Google Cloud Platform (GCP).

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Infrastructure](#infrastructure)
- [Application](#application)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Alerts](#monitoring--alerts)
- [End-to-End Usage](#end-to-end-usage)
- [Assumptions & Limitations](#assumptions--limitations)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Overview

The project provisions a Kubernetes environment on GCP using Terraform, builds and containerizes a sample web application, deploys it with Helm to a GKE cluster, and configures basic monitoring with Prometheus and Grafana.  
It is intended to demonstrate practical DevOps skills across infrastructure as code, containerization, CI/CD, and observability.

---

## Architecture

At a high level, the system consists of:

- **GKE cluster** hosting:
  - The web application
  - A database running as a Kubernetes workload
  - A Prometheus + Grafana monitoring stack
- **Container registry** (e.g. GCR or Docker Hub) that stores the built application images
- **GitHub Actions pipeline** that builds, tests, pushes, and deploys the application using Helm
- **Storage bucket** used for static files and/or logs

You can describe this as a simple three‑tier architecture: web app → database → storage/monitoring, all running inside or alongside the same Kubernetes cluster.

---

## Repository Structure
```
devops-assessment/
│
├── app/
│ ├── Dockerfile
│ └── src/
│
├── infra/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── backend.tf
│   ├── providers.tf
│   ├── terraform.tfvars
│   └── modules/
│    ├── gke/
│    |    ├── main.tf
│    |    ├── outputs.tf
│    |    └── variables.tf
│    ├── artifact_registry/
│    |    ├── main.tf
│    |    ├── outputs.tf
│    |    └── variables.tf
│    ├── db/
│    |    ├── main.tf
│    |    ├── outputs.tf
│    |    └── variables.tf
│    ├── gke-network/
│    |    ├── main.tf
│    |    ├── outputs.tf
│    |    └── variables.tf
│    └── storage/
│         ├── main.tf
│         ├── outputs.tf
│         └── variables.tf  
│
├── helm/
│ └── webapp/
│
├── monitoring/
│ ├── prometheus-values.yaml
│ └── grafana-values.yaml
│
├── .github/workflows/cicd.yml
│
├── .gitignore
│
└── README.md

```


- `infra/` – Terraform configuration for GKE, database workload, storage bucket, and related resources.  
- `app/` – Sample application source code and `Dockerfile`.  
- `helm/` – Helm chart for the web application (deployment, service, values).  
- `monitoring/` – Configuration for Prometheus, Grafana, and alerting rules.  
- `.github/workflows/` – GitHub Actions workflow implementing CI/CD.

---

## Infrastructure

### Technologies

- **Cloud provider:** Google Cloud Platform (GCP)  
- **Kubernetes:** Google Kubernetes Engine (GKE)  
- **IaC:** Terraform

### Features

- Provisions a GKE cluster with configurable:
  - Region / zone
  - Node machine type
  - Node count and autoscaling options
- Deploys a **database as a workload** inside the cluster (e.g., PostgreSQL/MySQL StatefulSet) rather than a managed service.  
- Creates a **storage bucket** for static assets and/or log retention.  
- Uses **variables** to parameterize common settings (see `variables.tf`).  
- Can be configured to use a **remote backend** for Terraform state (GCS bucket or Terraform Cloud).  
- Uses at least one **Terraform module** to keep the configuration modular and reusable.

### Usage

From the `infra/` directory:

`terraform plan` # review planned changes  
`terraform apply` # create / update infrastructure


Typical variables:

- `project_id` – GCP project ID  
- `region` / `zone` – deployment location  
- `cluster_name` – GKE cluster name  
- `node_count`, `node_machine_type`, etc.

---

## Application

### Technologies

- **Language/Framework:** (Node.js/Express)  
- **Containerization:** Docker

### Container Image

The `app/Dockerfile` builds a minimal image for the sample web application, following best practices such as:

- Using a small base image for the runtime stage  
- Copying only required artifacts  
- Exposing the application port and defining a simple entrypoint

To build and push the image manually:

`docker build -t <registry>/<project>/sample-app:<tag> ./app`
`docker push <registry>/<project>/sample-app:<tag>`


---

## CI/CD Pipeline

### Tooling

- **CI/CD:** GitHub Actions  
- **Deployment:** Helm (to GKE)

### Pipeline Stages

Defined in `.github/workflows/main.yml`:

1. **Checkout** – Fetch repository code.  
2. **Build** – Build the Docker image from `app/Dockerfile`.  
3. **Test** – Run basic tests (unit tests and/or linting).  
4. **Push** – Push the image to the configured container registry.  
5. **Deploy** – Upgrade or install the Helm release to the target GKE cluster using the new image tag.  

The workflow uses secrets for:

- Registry credentials (or GCP Workload Identity / OIDC)  
- GCP service account key or workload identity to access GKE  
- Any other environment‑specific settings (namespace, release name, etc.)

### Rollback

If a deployment fails, Helm’s release history can be used to roll back:

`helm rollback webapp <revision>`

## Helm Deployment

The `helm/webapp` chart manages all Kubernetes manifests for the application:

- `Deployment` – Application pods with configurable replicas and resources  
- `Service` – ClusterIP or LoadBalancer for external access  
- Optional ConfigMaps/Secrets as needed

Example manual deployment:

`helm upgrade --install webapp ./helm/webapp`
`--namespace webapp --create-namespace`
`--set image.repository=<registry>/<project>/sample-app`
`--set image.tag=<tag>`

## Monitoring & Alerts

### Stack

- **Prometheus** – Metrics scraping and alerting  
- **Grafana** – Dashboards

Deployed via Helm charts with overrides stored in `monitoring/`:

- `prometheus-values.yaml` – scrape configs, resource limits, alerting rules, etc.  
- `grafana-values.yaml` – admin credentials, data sources, basic dashboard provisioning.

### Custom Metric & Alert

- The application exposes a custom metric (for example, `http_requests_total` or `app_requests_total`) on a `/metrics` endpoint in Prometheus format.  
- Prometheus is configured to scrape this endpoint.  
- A sample alert rule (e.g., high error rate or frequent restarts) is defined to showcase alerting capability.
