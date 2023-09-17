# WEBTRAX

__EXPERIMENTAL__: This repository is at a very early stage. Everything will change, don't depend on it.

## Firebase Configs

### Cloud Storage - CORS

Configure CORS for the cloud storage buckets to be able to download them from the browser.
https://firebase.google.com/docs/storage/web/download-files#cors_configuration

```
gsutil cors set cloud_storage_cors.json gs://webtrax-1fc7d.appspot.com
```
