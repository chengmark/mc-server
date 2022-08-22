# Server Installer

- edit args.json

- put world folders to this folder

- move this folder to remote instance

```
sudo gcloud compute scp --recurse ./server mc-server:/home/minecraft/
```

- run `sudo python3 setup.py`

## Feature

- [x] Download paper server
- [x] agree EULA
- [x] download plugins
- [x] set worlds
- [x] set server properties
- [ ] set ops
- [ ] set whitelist

## Pre-Requisites

- folders of worlds
- `server.properties` file
- `ops.json` file
- `whitelist.json` file
