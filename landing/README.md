# Landing

## Development

### Postgres

```
podman run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

### PgAdmin

```
podman run --name pgadmin -e 'PGADMIN_DEFAULT_EMAIL=pgadmin@mailinator.com' -e 'PGADMIN_DEFAULT_PASSWORD=password' -p 5000:80 -d dpage/pgadmin4
```

### Running Migration

```
cd db
sqlx migrate run
```
