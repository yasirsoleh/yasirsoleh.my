# Postgres Deployment

## Create a secret

```
kubectl create secret generic landing \
  --from-literal=JWT_SECRET=secret
```
