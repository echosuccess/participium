# Scripts for common Docker operations

### Build and start
```Powershell
docker-compose up -d --build
```

### Show status
```Powershell
docker-compose ps
```

### Log
```Powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
```

### Stop containers
```Powershell
# Stop
docker-compose down

# Stop and remove (deletes all data)
docker-compose down -v
```

### Rebuild from scratch
```Powershell
# Rebuild from scratch
docker-compose up -d --build --force-recreate
```