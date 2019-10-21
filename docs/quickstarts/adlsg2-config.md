---
id: adlsg2
title: ADLS Gen2
sidebar_label: ADLS Gen2
---

_THIS IS DEFUNCT UNTIL KUBERNETES OR EQUIVALENT ORCHESTRATION IS AVAILABLE._

Use this quickstart if you want to configure Fusion to connect to ADLS Gen2 storage.

## Prerequisites

* Azure VM instance set up and running, with root access available.
* Docker (v19.03.3 or higher), Docker Compose (v1.24.1 or higher), and Git installed on instance.
* Credentials for accessing the Data Lake Storage Gen2 account.
* Network connectivity between Azure VM and Data Lake Storage Gen2 account.

## Guidance

Clone the Fusion docker repository to your Azure VM instance:

`$ git clone https://github.com/WANdisco/fusion-docker-compose.git`

Switch to the repository directory, and run the setup script:

`cd fusion-docker-compose`

`./setup-env.sh`

Follow the prompts to configure your zone(s):

```text
Enter the first zone type: [Press enter to get a list of available zone types]
Please choose from one of the following zone types:

  cdh
  hdi-adls1
  hdi-adls2
  hdp
  s3

Enter the first zone type: hdi-adls2
Enter the second zone type (or NONE to skip): NONE
Enter your license file path (or NONE for a trial): [NONE]: "Press enter for a trial license, or provide an absolute path to one on the filesystem."
Enter the UI external address for zone-a [fusion-ui.example.com]: "Enter the external hostname for the Fusion node."
Enter the Azure storage account name for zone-a: "The name of the ADLS Gen2 storage account.""
Enter the Azure storage container for zone-a: "The blob container that should be used."
Enter the Azure account key for zone-a: "The Primary Access Key is now referred to as Key1 in Microsoft’s documentation. You can get the KEY from the Microsoft Azure storage account."
Enter the default FS for zone-a [abfss://<storage-container>@<storage-account>.dfs.core.windows.net/]: "Leave blank as default is okay to use here"
Enter the underlying FS for zone-a [abfs://<storage-container>@<storage-account>.dfs.core.windows.net/]: "Leave blank as default is okay to use here"
```

After all the prompts have been completed, the following text will appear:

```text
The environment has now been configured. You can run:
  docker-compose up -d
to start the Fusion containers.
Once Fusion starts browse to http://<zone-a.external.address>:8080 to access the UI.
```

Ensure that Docker is started:

`systemctl status docker`

If not, start the Docker service:

`systemctl start docker`

Start the Fusion containers with:

`docker-compose up -d`

Log into the ONEUI via a web browser with the VM's external hostname and port 8080.

_Example_

`http://<zone-a.external.address>:8080/`

Register your email address and password, and then use these to log into the ONEUI.

*You have now completed this quickstart, until you have inducted another zone, you will not be able to create replication rules.*

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

If you wanting to run through the setup script with prompts again, you must remove all of the `.yml` and `.env` files that were created after the setup:

`rm -f common.env zone_a.env docker-compose.zone-a.yml docker-compose.common.yml`

## Reference links

https://docs.docker.com/install/

https://docs.docker.com/compose/install/

https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
