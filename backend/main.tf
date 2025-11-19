# Storage bucket
resource "google_storage_bucket" "tf_backend_bucket" {
  name          = "tfstate-bucket-candidate-2"
  location      = "us-central1"
  force_destroy = true

  uniform_bucket_level_access = true
}

