# Registry Deployment

## Generate password file

```
podman run --entrypoint htpasswd registry:2 -Bbn yasirsoleh password > registry-auth/htpasswd
```

## Create a secret for the password file

```
kubectl create secret generic registry-htpasswd   --from-file=htpasswd=./registry-htpasswd
```

## Login to the registry

```
podman login registry.yasirsoleh.my -u yasirsoleh -p password
```
