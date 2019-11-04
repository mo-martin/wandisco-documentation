---
id: useful_info_ts
title: Useful information and troubleshooting
sidebar_label: Useful information and troubleshooting
---

## Reference links

[Docker installation guide](https://docs.docker.com/install/)

[Docker Compose installation guide](https://docs.docker.com/compose/install/)

[Git installation guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

## Useful docker-compose commands

Bring down containers and retain configured state:

`docker-compose down`

Remove all named volumes and down containers (current configuration will be lost):

`docker-compose down -v`

## Useful docker commands

List all running containers:

`docker ps`

Log in to specific container:

`docker exec -it <container-ID> /bin/bash`

Stop all containers:

`docker container stop $(docker container ls -aq)`

Remove all stopped containers, all networks not used by at least one container, all dangling images and all dangling build cache:

`docker system prune`

## Information on service names

The Fusion service names can be found in the `.yml` files contained within the `fusion-docker-compose` Git repository.

_Example_
```text
docker-compose.zone-a.yml
docker-compose.common.yml
```
For instance, the ONEUI service is not required in a specific zone, so the service name can be found inside of the `docker-compose.common.yml` file.

`vi docker-compose.common.yml`

```text
# This service creates the One UI Server component to manage both zones.
#
# Note: this component can be run in either zone, so one is chosen arbitrarily

  # Fusion OneUI Server
  fusion-oneui-server:
```

Restart the ONEUI service:

`docker-compose up -d --force fusion-oneui-server`

## Troubleshooting

In the event that you need to rebuild your Fusion environment, use the docker compose command shown below to stop and delete all containers.

`docker-compose down -v`

Please note that this is a destructive action that cannot be recovered from, you will lose all container data including that stored in the persisted storage directories (e.g. `/etc/wandisco`).

If you wanting to run through the setup script with prompts again, you can rerun the setup script with the `-a` flag:

`./setup-env.sh -a`
