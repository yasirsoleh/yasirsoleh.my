# Postgres Deployment

## Create a secret

```
kubectl create secret generic postgres \
  --from-literal=POSTGRES_USER=yasirsoleh \
  --from-literal=POSTGRES_PASSWORD=password
```
