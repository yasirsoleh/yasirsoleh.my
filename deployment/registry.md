# Registry Deployment

## Generate password file

```
podman run --rm httpd:2.4-alpine htpasswd -Bbn yasirsoleh password > registry-htpasswd
```

## Create a secret for the password file

```
kubectl create secret generic registry-htpasswd   --from-file=htpasswd=./registry-htpasswd
```

## Login to the registry

```
podman login registry.yasirsoleh.my -u yasirsoleh -p password
```
