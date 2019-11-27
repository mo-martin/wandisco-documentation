---
id: hdp-adlsg2
title: Hortonworks (HDP) to ADLS Gen2
sidebar_label: Hortonworks (HDP) to ADLS Gen2
---

Use this quickstart if you want to configure Fusion to connect to Hortonworks (HDP) and ADLS Gen2 storage.

Please see the [Useful information](https://wandisco.github.io/wandisco-documentation/docs/troubleshooting/useful_info) section for additional commands and help.

## Limitations of this quickstart

* This guide does not currently offer configuration of Fusion to a **Kerberized** HDP cluster.
* Migration of existing data will be available after configuration, but not live replication.

We are working to include these additional items as soon as possible.

## Prerequisites

* Azure VM instance set up and running, with root access available (instructions were tested on RHEL 7).
* [Docker](https://docs.docker.com/install/) (v19.03.3 or higher), [Docker Compose](https://docs.docker.com/compose/install/) (v1.24.1 or higher), and [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed on instance.
* Administrator credentials for the HDP Ambari Manager.
* Network connectivity to the Ambari Manager and NameNodes.
* Credentials for accessing the Data Lake Storage Gen2.
* Network connectivity to the Data Lake Storage Gen2.

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

_Example entries for HDP_

HDP version: `3.1.0`

Hadoop NameNode IP/hostname: `namenode.example.com` - if NameNode HA is configured, this should be the Active NameNode.

NameNode port: `8020` - if NameNode HA is configured, this value will be defined in the `dfs.namenode.rpc-address.<nameservice>.<namenode_id>` property. If NameNode HA is not configured, the value will be defined in the `fs.defaultFS` property.

_Example entries for ADLS Gen2_

HDI version: `4.0`

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

Log in to the UI via a web browser with the VM's hostname and port 8081.

`http://<docker_hostname>:8081/`

Register your email address and password, and then use these to log in to the UI.

### Replication

_You now have the ability to create replication rules via the UI, feel free to create one and test replication._
