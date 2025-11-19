provider "google" {
  project = "devops-candidate-2"
  region = "us-central1"
  credentials = "${file("D:/Assesment/candidate-2-key.json")}"
}

terraform {

  required_providers {
    google = {
        source = "hashicorp/google"
        version = "~> 4.0"
    }
  }
}