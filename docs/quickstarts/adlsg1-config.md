---
id: adlsg1
title: ADLS Gen1
sidebar_label: ADLS Gen1
---

Use this quickstart if you want to configure Fusion to connect to ADLS Gen1 storage.

## Prerequisites

* Azure VM instance set up and running, with root access available.
* Docker (v19.03.3 or higher), Docker Compose (v1.24.1 or higher), and Git installed on instance.
* Credentials for accessing the Data Lake Storage Gen1.
* Network connectivity between Azure VM and Data Lake Storage Gen1.

## Guidance

Clone the Fusion docker repository to your Azure VM instance:

`$ git clone https://github.com/WANdisco/fusion-docker-compose.git`

Switch to the repository directory, and run the setup script:

`cd fusion-docker-compose`

`./setup-env.sh`

Follow the prompts to configure your zone(s):

```text
Please choose from one of the following zone types:

  cdh
  hdi-adls1
  hdi-adls2
  hdp
  s3

Enter the first zone type: hdi-adls1
Enter a name for the first zone [hdi-adls1]: adls1-zone
Configure a second zone? (Y/n) n
Enter the ADLS home hostname for adls1-zone [example.westeurope.azuredatalakestore.net]: "The ADLS Gen1 hostname to connect to."
Enter the ADLS home mountpoint for adls1-zone [/]: "The file path in the ADLS file system for Fusion to use as root."
Enter the ADL handshake user for adls1-zone: "The service principal name to be used to authenticate with the ADLS Gen1."
Enter the ADL OAUTH2 Credential for adls1-zone: "The authentication key of the Active Directory credential you wish to use with Fusion."
Enter the ADL OAUTH2 Refresh URL for adls1-zone [https://login.microsoftonline.com/example/oauth2/token]: "The Refresh Token URL for the account."
Enter the ADL OAUTH2 Client ID for adls1-zone: "The full client ID of the Active Directory credential you wish to use with Fusion."
```

After all the prompts have been completed, the following text will appear:

```text
# This script should be sourced with:
#   . ./setup-env.sh
# Or you can manually export the following:
export COMPOSE_FILE="docker-compose.common.yml:docker-compose.zone-a.yml"
Run docker-compose up -d to start the Fusion containers
Once Fusion starts browse to http://HOST:8080 to access the UI
```

Ensure that Docker is started:

`systemctl status docker`

If not, start the Docker service:

`systemctl start docker`

As per the instructions provided after the prompts, source the setup file, and export the environment variable:

_Example_

`. ./setup-env.sh`

`export COMPOSE_FILE="docker-compose.common.yml:docker-compose.zone-a.yml"`

Start the Fusion containers with:

`docker-compose up -d`

Log into the ONEUI via a web browser with the VM's hostname and port 8080.

_Example_

`http://<hostname>:8080/`

Register your email address and password, and then use these to log into the ONEUI.

*You have now completed this quickstart, until you have registered another zone, you will not be able to create replication rules.*

## Useful docker commands

Stop all containers:

`docker container stop $(docker container ls -aq)`

Remove all stopped containers, all networks not used by at least one container, all dangling images and all dangling build cache:

`docker system prune`

List all running containers:

`docker ps`

Log into specific container:

`docker exec -it <container-ID> /bin/bash`

## Troubleshooting

In the event that you need to rebuild your Fusion environment, you should `stop` and `prune` all existing containers first. After which, you may need to delete the underlying database for the ONEUI instance.

This is required because the data stored there is not cleaned up when pruning the existing containers, and will still contain information regarding the previous ecosystem.

Obtain the ONEUI container ID:

`docker ps | grep oneui`

Log into the ONEUI container and delete the H2 database for ONEUI:

`docker exec -it <ONEUI-container-ID> /bin/bash`

`rm -rf /h2db/db`

`exit`

Restart the ONEUI service:

`docker-compose up -d --force fusion-oneui-server`

Note: The Fusion service names can be found in the `.yml` files contained within the `fusion-docker-compose` Git repository.

_Example_
```text
docker-compose.zone-a.yml
docker-compose.common.yml
```
As the ONEUI is not required in a specific zone, the service name can be found inside of the `docker-compose.common.yml` file.

`vi docker-compose.common.yml`

```text
# This service creates the One UI Server component to manage both zones.
#
# Note: this component can be run in either zone, so one is chosen arbitrarily

  # Fusion OneUI Server
  fusion-oneui-server:
```

If you wanting to run the setup script again, you must remove all of the `.yml` and `.env` files that were created after the setup:

`rm -f common.env zone_a.env docker-compose.zone-a.yml docker-compose.common.yml`

## Reference links

https://docs.docker.com/install/

https://docs.docker.com/compose/install/

https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
