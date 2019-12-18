---
id: hdp_sandbox_lhv_client-adlsg2_lan
title: Hortonworks (HDP) Sandbox with Live Hive to Azure Databricks with Live Analytics
sidebar_label: HDP Sandbox with Live Hive to Azure Databricks with Live Analytics
---

_THIS GUIDE IS WORK IN PROGRESS, PLEASE DO NOT FOLLOW ANYTHING HERE UNTIL THIS WARNING IS REMOVED_

[//]: <This quickstart is work in progress, and new items are still being added. The development approach is that all known workarounds/configuration steps will be kept in the document until we have fully confirmed their fix (see MTC label). At which point, they will be removed. The same will apply for configuration/installation steps when blueprints for HDP or Fusion have been completed (see DAP-144).>

Use this quickstart if you want to configure Fusion to replicate from a Hortonworks (HDP) Sandbox to an Azure Databricks cluster. This will involve the use of Live Hive for the HDP cluster, and Live Analytics for the Azure Databricks cluster.

Please see the [Useful information](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/troubleshooting/useful_info) section for additional commands and help.

## Prerequisites

[//]: <We are still working out the minimum VM requirements, at the moment, we are working with Standard D8 v3.>

To complete this lab exercise, you will need:

* Azure VM created and started. See the [Azure VM creation](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/preparation/azure_vm_creation) guide for steps to create an Azure VM.
  * Minimum size VM recommendation = **Standard D8 v3 (8 vcpus, 32 GiB memory).**
  * CentOS-based 7.7 (or higher) or UbuntuLTS 18.04. Instructions are provided for these releases.
  * A minimum of 128GB storage. The [Azure VM creation](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/preparation/azure_vm_creation) guide includes this by default.
  * Root access on server (this is normally available by default).
* Azure VM prepared for Fusion installation, see [Azure VM preparation](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/preparation/azure_vm_prep) guide for all required steps.

###  Command line editing

The `vi` command line editor will be used in this lab, please see this [vi cheat sheet](https://ryanstutorials.net/linuxtutorial/cheatsheetvi.php) for guidance on how to use it.

## Installation

All the commands within this guidance should be run as **root** user. To switch to this user, type `sudo -i` in the command line when logged in as the default Azure user (this will have been set during creation of the VM).

Log into the VM via a terminal session and switch to root user.

`ssh <docker_host>`

`sudo -i`

### Create docker network

1. Run the following command to create the Fusion docker network that will work in conjunction with the HDP Sandbox.

   `docker network create fusion-docker-compose_fusion`

   A 'sha' reference will be displayed afterwards if this was successful.

### Add temporary entry to hosts file

[//]: <This is required to get the Fusion docker setup script to pass verification when entering the HDP NameNode/Metastore hostnames. It is removed after the setup script is done.>

[//]: <This workaround is not required after removing the 'validate_hostname' function from the following conf files: common.conf, common-fusion.conf, plugin-livehive.conf and zone-hdp.conf.>

1. On the docker host, edit the hosts file so that the correct hostname variables will be set during the Fusion setup.

   `vi /etc/hosts`

   Add an additional line as below:

   `127.0.0.1 manager fusion-nn-proxy-hdp fusion-server-hdp fusion-livehive-proxy-hdp`

   Once complete, save and quit the file (e.g. `:wq!`).

### Setup Fusion

[//]: <Still not determined as to where the users will pull the fusion-docker-compose repository. We will need to provide pre-baked config files so that the only entries required will be the ADLS Gen2 details.>

1. (**TBC**) Clone the Fusion docker repository to your Azure VM instance:

   `cd ~`

   `git clone -b features/livehive-merge https://github.com/WANdisco/fusion-docker-compose.git`

2. Change to the repository directory:

   `cd fusion-docker-compose`

3. Run the setup script:

   `./setup-env.sh`

4. Follow the prompts to configure your ADLS Gen2 Zone, see the next section below for guidance on this.

#### Setup prompts for ADLS Gen2

Please ensure to enter your details for the **Storage account**, **Storage container** and **Account Key** values so that they match your account in Azure.
The examples shown below are for guidance only.

* Storage account: `adlsg2storage`

* Storage container: `fusionreplication`

* Account key: `KEY_1_STRING` - the Primary Access Key is now referred to as "Key1" in Microsoft’s documentation. You can get the Access Key from the Microsoft Azure storage account under the **Access Keys** section.

* default FS: `abfss://fusionreplication@adlsg2storage.dfs.core.windows.net/` - press enter for the default value.

* underlying FS: `abfs://fusionreplication@adlsg2storage.dfs.core.windows.net/` - press enter for the default value.

At this point, the setup prompts will be complete and the script will exit out with an informational message. Please ignore this for now and continue following the steps below.

### Remove temporary entry to hosts file

[//]: <This workaround is not required after removing the 'validate_hostname' function from the following conf files: common.conf, common-fusion.conf, plugin-livehive.conf and zone-hdp.conf.>

1. Edit the hosts file as the additional entry is no longer required and will create problems with the internal network if not removed.

   `vi /etc/hosts`

   Remove the line below:

   `127.0.0.1   manager fusion-nn-proxy-hdp fusion-server-hdp fusion-livehive-proxy-hdp`

   Once complete, save and quit the file (e.g. `:wq!`).

### Startup Fusion

After all the prompts have been completed, you will be able to start the containers.

1. Ensure that Docker is started:

   `systemctl status docker`

   If not, start the Docker service:

   `systemctl start docker`

2. Start the Fusion containers with:

   `docker-compose up -d`

### Setup and start HDP Sandbox (TBC)

[//]: <DAP-142>

[//]: <These steps are being performed using the 'wandocker.run' script. This script allows for the creation of a custom network name, as well as selecting existing ones. It is also using Ambari 2.7.3, which will allow us to export blueprints via the UI when we have configured everything on the cluster. There is also expansion planned to the script capabilities (on the side) for multiple node HDP clusters, so that future testing could be done with NameNode HA.>

1. (**TBC**) Download the HDP sandbox in compressed format.

   _Example_

   `wget https://URL/wandocker.run`

2. Decompress the gzip file and run the script.

   `tar -xf wandocker.tar.gz`

   `./wandocker.run`

[//]: <DAP-151 workaround>

3. Change directory and run the wandocker management script.

   `cd wandocker`

   `./wandocker.sh -i hdp265_docker.ini`

4. Choose Option 1 to set up all the required images for the HDP sandbox and repository.

   `1` - Build All Images (Repo, Agent, Server)

   This may take up to 15 minutes.

   Once the following four lines are displayed in the Event Log, the image builds will have completed:

   ```text
   BuildResponseItem[stream=Successfully tagged hdp_slave:2.7.3.0
   BuildResponseItem[stream=Successfully tagged repo_host:2.6.5.0-292
   BuildResponseItem[stream=Successfully tagged hdp_master:2.7.3.0
   BuildResponseItem[stream=Successfully tagged repo_cache_host:2.6.5.0-292
   ```

   Press enter to return to the Main Menu.

5. Select option 2 to create and start the HDP repository and cache.

   `2` - Create and start Local Repo Containers

   Type the Index number for the `fusion-docker-compose_fusion` network, followed by enter.

   This may take 2-3 minutes. Once the following line is displayed in the Event Log, the repositories are ready:

   ```text
   [/root/buildrepo.sh, 2.6.5.0-292] on /repo_host Completed.
   ```

   Press enter to return to the Main Menu.

6. Select option 3 to create the HDP sandbox.

   `3` - Create and start Sandbox Container(s)

   Type the Index number for the `fusion-docker-compose_fusion` network, followed by enter.

   This may take 3-4 minutes. Press enter to return to the Main Menu.

   Wait until the Ambari UI is accessible on `http://<docker_IP_address>:8080` via a web browser before continuing (you do not need to log in at this time).

7. Install the Cluster blueprint by selecting option 4.

   `4` - Install Cluster from Blueprint

   Press `q` to quit out of the wandocker main menu after completing this.

8. Log into the Ambari UI.

   Username = `admin`
   Password = `admin`

   Two automated jobs will automatically be started for installing and starting components, observable in **Background Operations**. Wait until these are complete before continuing (~12mins).

## Configuration

### Live Hive configuration and activation

1. Log into one of the containers for the HDP zone.

   `docker exec -it fusion-docker-compose_fusion-ui-server-hdp_1 bash`

[//]: <DAP-131>

2. Add an additional property to the Live Hive config:

   `vi /etc/wandisco/fusion/plugins/hive/live-hive-site.xml`

   Add the following property and value below:

   ```json
     <property>
       <name>live.hive.cluster.delegation.token.delayed.removal.interval.in.seconds</name>
       <value>5</value>
     </property>
   ```

   Once complete, save and quit the file (e.g. `:wq`).

3. Exit back into the docker host and restart the Fusion containers so that the configuration changes are picked up.

   `exit`

   `docker-compose restart`

4. Log into the Fusion UI for the HDP zone, and activate the Live Hive plugin.

   `http://<docker_IP_address>:8083`

   Username: `admin`
   Password: `admin`

   Proceed to the Settings tab and select the *Live Hive: Plugin Activation* option on the left-hand panel.

   Click on the *Activate* option. Wait for the **Reload this window** message to appear and refresh the page.

### Setup Databricks

Prior to performing these tasks, the Databricks cluster must be in a **running** state. Please access the Azure portal and check the status of the cluster. If it is not running, select to start the cluster and wait until it is **running** before continuing.

1. Log into the Fusion UI for the ADLS Gen2 zone.

   `http://<docker_IP_address>:8583`

   Username: `admin`
   Password: `admin`

2. Enter the Databricks Configuration details on the Settings page.

   **Fusion UI -> Settings -> Databricks: Configuration**

   _Examples for Databricks details_

   * Databricks Service Address: `westeurope.azuredatabricks.net`

   * Bearer Token: `dapicd7689jkb25473c765ghty78bb299a83`

   * Databricks Cluster ID: `2233-255452-boned277`

   * Unique JDBC HTTP path: `sql/protocolv1/o/6987013384345789/2233-255452-boned277`

   _Ensure to change the above examples to match your Databricks details._

   Click **Update** once complete.

3. On the docker host, log into one of the containers for the ADLS Gen2 zone as root user.

   `docker exec -u root -it fusion-docker-compose_fusion-ui-server-adls2_1 bash`

[//]: <DAP-135 workaround>

4. Upload the Live Analytics "datatransformer" jar using a curl command.

   `curl -v -H "Authorization: Bearer <bearer_token>" -F contents=@/opt/wandisco/fusion/plugins/databricks/live-analytics-databricks-etl-5.0.0.0.jar -F path="/datatransformer.jar" https://<databricks_service_address>/api/2.0/dbfs/put`

   You will need to adjust the `curl` command so that your **Bearer Token** and **Databricks Service Address** is referenced.

   _Example values_

   * Bearer Token: `dapicd7689jkb25473c765ghty78bb299a83`
   * Databricks Service Address: `westeurope.azuredatabricks.net`

   _Example command_

   `curl -v -H "Authorization: Bearer dapicd7689jkb25473c765ghty78bb299a83"  -F contents=@/opt/wandisco/fusion/plugins/databricks/live-analytics-databricks-etl-5.0.0.0.jar -F path="/datatransformer.jar" https://westeurope.azuredatabricks.net/api/2.0/dbfs/put`

   If the command is successful, you will see that the message output contains the following text below:

   ```json
   < HTTP/1.1 100 Continue
   < HTTP/1.1 200 OK
   ```

5. Exit back into the docker host and restart the Fusion containers so that the configuration changes are picked up.

   `exit`

   `docker-compose restart`

6. Log into the Azure portal and Launch Workspace for your Databricks cluster.

7. On the left-hand panel, select **Clusters** and then select your interactive cluster.

8. Click on the **Libraries** tab, and select the option to **Install New**.

9. Select the following options for the Install Library prompt:

   * Library Source = `DBFS`

   * Library Type = `Jar`

   * File Path = `dbfs:/datatransformer.jar`

10. Select **Install** once the details are entered. Wait for the **Status** of the jar to display as **Installed** before continuing.

## Replication

In this section, follow the steps detailed to perform live replication of HCFS data and Hive metadata from the HDP cluster to the Azure Databricks cluster.

### Create replication rules

1. Log into the Fusion UI for the HDP zone.

   `http://<docker_IP_address:8083`

   Username: `admin`
   Password: `admin`

2. Enter the Replication tab, and select to **+ Create** a replication rule.

3. Create a new HCFS rule using the UI with the following properties:

   * Type = `HCFS`

   * Zones = `adls2, hdp` _- Leave as default._

   * Priority Zone = `hdp` _- Leave as default._

   * Rule Name = `warehouse`

   * Path for adls2 = `/apps/hive/warehouse`

   * Path for hdp = `/apps/hive/warehouse`

   Click **Add** after entering the Rule Name and Paths.

   * Advanced Options: Preserve Origin Block Size = `true` _- click the checkbox to set this to true._

   Click **Create rules (1)** once complete.

4. Create a new Hive rule using the UI with the following properties:

   On the Replication tab, select to **+ Create** a replication rule again.

   * Type = `Hive`

   * Database name = `test*`

   * Table name = `*`

   * Description = `Testing` _- this field is optional_

   Click **Create rule** once complete.

5. Both rules should now display on the **Replication** tab in the Fusion UI.

### Test replication

Prior to performing these tasks, the Databricks cluster must be in a **running** state. Please access the Azure portal and check the status of the cluster. If it is not running, select to start the cluster and wait until it is **running** before continuing.

1. On the docker host, log into the HDP cluster node.

   `docker exec -it manager bash`

2. Run beeline and use the `!connect` string to start a Hive session via the Hiveserver2 service.

   `beeline`

   `beeline> !connect jdbc:hive2://manager:2181/;serviceDiscoveryMode=zooKeeper;zooKeeperNamespace=hiveserver2`

   This connection string can also be found on the Ambari UI under **Hive -> Summary -> HIVESERVER2 JDBC URL**.

   When prompted for a username and password, enter the following:

   `Enter username: hdfs`

   `Enter password: ` _- leave blank and press enter._

2. Create a database to use that will match the regex for the Hive replication rule created earlier in the Fusion UI.

   `0: jdbc:hive2://manager:2181/> create database test01;`

3. Create a table inside of the database.

   `0: jdbc:hive2://manager:2181/> use test01;`

   `0: jdbc:hive2://manager:2181/> create table table01(id int, name string) stored as ORC;`

4. Insert data inside of the table.

   `0: jdbc:hive2://manager:2181/> insert into table01 values (1,'words');`

   This will now launch a Hive job that will insert the data values provided in this example. If this is successful, you will see **SUCCEEDED** written in the STATUS column.

   _Example_

   ```json
   --------------------------------------------------------------------------------
           VERTICES      STATUS  TOTAL  COMPLETED  RUNNING  PENDING  FAILED  KILLED
   --------------------------------------------------------------------------------
   Map 1 ..........   SUCCEEDED      1          1        0        0       0       0
   --------------------------------------------------------------------------------
   VERTICES: 01/01  [==========================>>] 100%  ELAPSED TIME: XY.ZA s
   --------------------------------------------------------------------------------
   ```

   Please note that running an 'insert into table' for the first time on the HDP cluster may take a longer period of time than normal. Further jobs will complete at a much faster rate.

### Verify replication

1. To verify the data values inside of the table on the **HDP** zone, run the command below when still logged into the Hive beeline session:

   `0: jdbc:hive2://manager:2181/> select * from table01;`

   The output will be similar to that of below:

   ```json
   +-------------+----------------+--+
   | table01.id  |  table01.name  |
   +-------------+----------------+--+
   | 1           | words          |
   +-------------+----------------+--+
   1 rows selected (X.YZA seconds)
   ```

2. To verify the data has replicated to the ADLS Gen2 zone and Databricks cluster, access the Azure portal and and Launch Workspace for your Databricks cluster (if not already opened).

3. On the left-hand panel, select **Data** and then select the database created for this test (i.e. `test01`).

4. In the _Tables_ list, select the table created for this test (i.e. `table01`).

5. Wait for the table details to be loaded, and verify that the Schema and Sample Data match that seen in the HDP zone.

   **Schema**
   ```json
   col_name   data_type
   id         int
   name       string
   ```

   **Sample Data**
   ```json
   id         name
   1          words
   ```

## Troubleshooting

### Hiveserver2 down after HDP Sandbox is started for first time

The Hiveserver2 component in the HDP sandbox may be down after starting the cluster for the first time. If so, try the following steps to start it back up.

1. On the docker host, change directory to the Fusion docker compose directory and restart the Fusion containers.

   `cd /path/to/fusion-docker-compose`

   `docker-compose restart`

   Wait until all containers have finished restarting before continuing.

2. Access the Ambari UI, and manually start the Hiveserver2 component.

   **Ambari UI -> Hive -> Summary -> Click on the "HIVESERVER2" written in blue text.**

3. Locate the HiveServer2 in the component list and click the `...` in the Action column. Select to **Start** the component in the drop-down list.

### Error relating to 'system_dbus_socket'

[//]: <May not be included but a few people have hit this when using docker. It is apparently due to an incompatibility with Ubuntu, see https://bugs.freedesktop.org/show_bug.cgi?id=75515 for detail.>

If encountering a `system_dbus_socket` error when attempting to start containers, run the following commands below on the docker host:

```json
mkdir -p /run /run/lock
mv /var/run/* /run/
mv /var/lock/* /run/lock/
rm -rf /var/run /var/lock
ln -s /run /var/run
ln -s /run/lock /var/lock
```

### Error relating to 'connection refused' after starting Fusion for the first time

You may see the following error occur when running `docker-compose up -d` for the first time inside the fusion-docker-compose repository:

```json
ERROR: Get https://registry-1.docker.io/v2/: dial tcp: lookup registry-1.docker.io on [::1]:53: read udp [::1]:52155->[::1]:53: read: connection refused
```

If encountering this error, run the `docker-compose up -d` command again, and this should initiate the download of the docker images.

### Fusion zones not inducted together after initial start-up

[//]: <DAP-136 workaround>

If the Fusion zones are not inducted together after starting Fusion for the first time (`docker-compose up -d`), you can simply run the same command again to start the induction container:

`docker-compose up -d`

## Advanced options

* This guide does not currently offer configuration of Fusion to a **Kerberized** HDP cluster.
* This guide does not currently offer configuration of Fusion to a NameNode HA HDP cluster.

Please contact [WANdisco](https://wandisco.com/contact) for further information on Fusion with docker.
