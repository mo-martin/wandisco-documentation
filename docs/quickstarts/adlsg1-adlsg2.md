---
id: adlsg1-adlsg2
title: ADLS Gen1 to ADLS Gen2
sidebar_label: ADLS Gen1 to ADLS Gen2
---

Use this quickstart if you want to configure Fusion to connect to ADLS Gen1 storage and ADLS Gen2 storage.

Please see the [Useful information and troubleshooting](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/useful_info_ts) section for additional commands and help.

## Prerequisites

* Azure VM instance set up and running, with root access available (instructions were tested on RHEL 7).
* [Docker](https://docs.docker.com/install/) (v19.03.3 or higher), [Docker Compose](https://docs.docker.com/compose/install/) (v1.24.1 or higher), and [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed on instance.
* Credentials for accessing the Data Lake Storage Gen1 and Data Lake Storage Gen2.
* Network connectivity between Azure VM and Data Lake Storage Gen1/Gen2.

## Guidance

Clone the Fusion docker repository to your Azure VM instance:

`git clone https://github.com/WANdisco/fusion-docker-compose.git`

Switch to the repository directory, and run the setup script:

`cd fusion-docker-compose`

`./setup-env.sh`

Follow the prompts to configure your zones.

### Setup prompts

_Zone name_

If defining a zone name, please note that each zone must have a different name (i.e. they cannot match).

_Licenses_

Trial licenses will last 30 days and are limited to 1TB of replicated data.

_Examples entries for ADLS Gen1_

Hostname: `example.westeurope.azuredatalakestore.net`

Mountpoint: `/`,`/path/to/mountpoint` - Can be root or a specific directory.

Handshake user: `wandisco` - must be an Owner of the ADLS Gen1 (under role assignments).

OAUTH2 Credential: `RANDOM_STRING` - the authentication key of the Active Directory credential you wish to use with Fusion.

OAUTH2 Refresh URL: `https://login.microsoftonline.com/abc123de-fgh4-567i-8jkl-90123mnop456/oauth2/token`

OAUTH2 Client ID: `123ab456-78c9-0d12-3456-78e90123f45g`

_Example entries for ADLS Gen2_

Storage account: `adlsg2storage`

Storage container: `fusionreplication`

Account key: `RANDOM_STRING` - the Primary Access Key is now referred to as Key1 in Microsoft’s documentation. You can get the KEY from the Microsoft Azure storage account.

default FS: `abfss://fusionreplication@adlsg2storage.dfs.core.windows.net/`

underlying FS: `abfs://fusionreplication@adlsg2storage.dfs.core.windows.net/`

### Startup

After all the prompts have been completed, you will be able to start the containers.

Ensure that Docker is started:

`systemctl status docker`

If not, start the Docker service:

`systemctl start docker`

Start the Fusion containers with:

`docker-compose up -d`

Log into the ONEUI via a web browser with the VM's hostname and port 8080.

`http://<docker_hostname>:8081/`

Register your email address and password, and then use these to log into the ONEUI.

### Replication

_You now have the ability to create replication rules via the UI, feel free to create one and test replication._
