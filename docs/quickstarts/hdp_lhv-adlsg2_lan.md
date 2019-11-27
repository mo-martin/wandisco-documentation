---
id: hdp_lhv-adlsg2_lan
title: Hortonworks (HDP) with Live Hive to ADLS Gen2 with Live Analytics
sidebar_label: Hortonworks (HDP) with Live Hive to ADLS Gen2 with Live Analytics
---

_THIS GUIDE IS WORK IN PROGRESS, PLEASE DO NOT FOLLOW ANYTHING HERE UNTIL THIS WARNING IS REMOVED_

Use this quickstart if you want to configure Fusion to connect to Hortonworks (HDP) and ADLS Gen2 storage/Databricks cluster. This guide will also include Live Hive on the HDP cluster, and Live Analytics on the ADLS Gen2/Databricks cluster.

Please see the [Useful information](https://wandisco.github.io/wandisco-documentation/docs/troubleshooting/useful_info) section for additional commands and help.

## Prerequisites

* Azure VM instance set up and running, with root access available (instructions were tested on RHEL 7).

  (TBC) Minimum size VM recommendation = **Standard A4m v2 (4 vcpus, 32 GiB memory).**
* [Docker](https://docs.docker.com/install/) (v19.03.3 or higher), [Docker Compose](https://docs.docker.com/compose/install/) (v1.24.1 or higher), and [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed on instance.
* Administrator credentials for the HDP Ambari Manager and root access via terminal.
* Network connectivity to the Ambari Manager and NameNode.
* Credentials for accessing the Data Lake Storage Gen2 and Databricks cluster.
* Network connectivity to the Data Lake Storage Gen2 and Databricks cluster.

## Guidance

### Initial Setup

1. Clone the Fusion docker repository to your Azure VM instance:

   `git clone https://github.com/WANdisco/fusion-docker-compose.git`

2. Change to the repository directory:

   `cd fusion-docker-compose`

3. _(TBC if correct approach)_

   Switch to <demo> git branch:

   `git checkout features/livehive-merge`

4. Run the setup script:

   `./setup-env.sh`

5. Follow the prompts to configure your zones.

### Setup prompts

  _Zone type_

  * For the purposes of this quickstart, please enter `hdp` for the first zone type, and `adls2` for the second zone type.

  _Zone name_

  * If defining a zone name, please note that each zone must have a different name (i.e. they cannot match). Otherwise, press enter to leave as default.

  _Licenses_

  * Trial licenses will last 30 days and are limited to 1TB of replicated data. Press enter to leave as default trial license.

  _Docker hostname_

  * For the purposes of this quickstart, this should be changed to the IP address of your docker host.

  _Example entries for HDP_

  * HDP version: `2.6.5`

  * Hadoop NameNode IP/hostname: `namenode.example.com` - The value will be the hostname defined in the `fs.defaultFS` property in the HDFS config.

  * NameNode port: `8020` - The value will be the port defined in the `fs.defaultFS` property in the HDFS config.

  * NameNode Service Name: `<docker_IP_address>:8890` - This value should be changed to reference the docker host IP on port 8890.

  _Example entries for Live Hive_

  * Enter `livehive` for the HDP zone when prompted to select a plugin.

  * Hive Metastore hostname: `metastore.hostname.com` - The HDP cluster's Hive Metastore hostname, can be seen by hovering over the Hive Metastore in the Hive summary page.

  * Hive Metastore port: `9083` - This value can be left as default.

  _Example entries for ADLS Gen2_

  * HDI version: `3.6`

  * Storage account: `adlsg2storage`

  * Storage container: `fusionreplication`

  * Account key: `KEY_1_STRING` - the Primary Access Key is now referred to as "Key1" in Microsoft’s documentation. You can get the KEY from the Microsoft Azure storage account.

  * default FS: `abfss://fusionreplication@adlsg2storage.dfs.core.windows.net/` - press enter for the default value.

  * underlying FS: `abfs://fusionreplication@adlsg2storage.dfs.core.windows.net/` - press enter for the default value.

### Startup

After all the prompts have been completed, you will be able to start the containers.

1. Ensure that Docker is started:

   `systemctl status docker`

   If not, start the Docker service:

   `systemctl start docker`

2. Start the Fusion containers with:

   `docker-compose up -d`

3. If the Induction container comes up before all other containers, please run the previous command again to ensure the zones are inducted together.

   `docker-compose up -d`

4. Log in to the UI via a web browser with the VM's hostname and port 8081.

   `http://<docker_hostname/IP>:8081/`

5. Register your email address and password, and then use these to log in to the UI.

   You will be able to return to the UI later once some additional configuration has been completed.

### Live Hive config changes

1. Log into one of the containers for the HDP zone.

   You will first need to obtain a Container ID from the HDP zone, this will be a 12 digit hexadecimal string. The name of the image will appear much like this example - `fusion-docker-compose_fusion-ui-server-hdp_1`.

   `docker ps` _- obtain ID._

   `docker exec -u root -it $CONTAINER_ID /bin/bash`

2. Symlink the Live Hive config files to the Fusion Server config path:

   `ln -s /etc/wandisco/fusion/plugins/hive/* /etc/wandisco/fusion/server/`

3. Edit the UI properties file and adjust the following properties:

   `vi /opt/wandisco/fusion-ui-server/properties/ui.properties`

   Change:

   ```json
   user.username=
   user.password=
   manager.type=AMBARI
   ```

   To:

   ```json
   user.username=admin
   user.password=$2a$10$q2HYSQ25F6emHMP/9ssZHuQx6/kOGs5Y2TVa1lNiUyVcDaLqzo132
   manager.type=UNMANAGED_BIGINSIGHTS
   ```

   Once complete, save and quit the file (e.g. `:wq!`).

4. Add an additional property to the Live Hive config:

   `vi /etc/wandisco/fusion/plugins/hive/live-hive-site.xml`

   Add the following property and value below:

   ```json
     <property>
       <name>live.hive.cluster.delegation.token.delayed.removal.interval.in.seconds</name>
       <value>5</value>
     </property>
   ```

   Once complete, save and quit the file (e.g. `:wq!`).

5. Exit back into the docker host and restart the docker containers so that the configuration changes are picked up.

   `exit`

   `docker-compose restart`

6. Log into the Fusion UI for the HDP zone, and activate the Live Hive plugin.

   `http://<docker_hostname/IP>:8083`

   Username: `admin`
   Password: `admin`

   Proceed to the Settings tab and select the *Live Hive: Plugin Activation* option on the left-hand panel.

   Click on the *Activate* option.

### Install the Live Hiveserver2 template on the HDP cluster

1. Log into the Ambari Server via a terminal session.

2. Download the Live Hiveserver2 template stack from the docker host.

   `wget http://<docker_hostname/IP>:8083/ui/downloads/core_plugins/live-hive/stack_packages/live-hiveserver2-template-5.0.0.1.stack.tar.gz`

3. Decompress the stack to the Ambari services directory.

   `tar -xf live-hiveserver2-template-5.0.0.1.stack.tar.gz -C /var/lib/ambari-server/resources/stacks/HDP/2.6/services/`

4. Delete the compressed file afterwards.

   `rm -f live-hiveserver2-template-5.0.0.1.stack.tar.gz`

5. Restart the Ambari Server so that the new stack will be available to install.

   `ambari-server restart`

6. Log into the Ambari UI once it is available after the restart.

7. In the Dashboard, select to **Add Service** in the Actions.

8. Select the **Live Hiveserver2 Template** and click Next.

9. Ensure the **Live Hiveserver2 Template Master** is assigned to the host on which the **Hiveserver2** component is installed. Click Next once confirmed.

10. On the **Customize Services** page, click Next.

11. On the **Review** page, click Deploy. After the **Install, Start and Test** operation is complete, click Next.

12. On the **Summary** page, click Complete.

### Activate NameNode Proxy and Live Hive Proxy on the HDP cluster

1. Log into the Ambari UI for the HDP cluster.

2. Adjust a property in the HDFS config so that it references the NameNode Proxy.

   **HDFS -> Configs -> Filter for `fs.defaultFS`**

   Adjust the value of `fs.defaultFS` to:

   ```json
   hdfs://<docker_IP_address>:8890
   ```

   **Save** the config after making the adjustment.

3. Adjust two properties in the Hive config so that it references the Live Hive Proxy.

   **Hive -> Configs -> Filter for `hive.metastore.uris`**

   Adjust the value of `hive.metastore.uris` in the following sub-sections:

   _General_

   ```json
   thrift://<docker_IP_address>:9083
   ```

   _Advanced webhcat-site_

   ```json
   hive.metastore.local=false,hive.metastore.uris=thrift://<docker_IP_address>:9083,hive.metastore.sasl.enabled=false
   ```

   **Save** the config after making these adjustments.

4. *(TBC if this works or different approach required)*

   Add a property to the Hive config so that the Hive Metastore contacts the NameNode instead of the NameNode Proxy.

   **Hive -> Configs -> Filter for `Custom hivemetastore-site`**

   Add the following property and value below to this sub-section:

   _Type = hivemetastore-site.xml_

   ```json
   fs.defaultFS=<namenode_hostname_address>:8020
   ```

   **Save** the config after making the addition.

5. Restart the **HDFS** and **Hive** services, as well as any others that are designated with a stale configuration.

### Setup Databricks on ADLS Gen2 zone

1. Log into the Fusion UI for the ADLS Gen2 zone.

   `http://<docker_hostname/IP>:8583`

   Username: `admin`
   Password: `admin`

2. Enter the Databricks Configuration details on the Settings page.

   **Fusion UI -> Settings -> Databricks: Configuration**

   _Examples for Databricks details_

   * Databricks Service Address: `westeurope.azuredatabricks.net`

   * Bearer Token: `dapicd7689jkb25473c765ghty78bb299a83`

   * Databricks Cluster ID: `2233-255452-boned277`

   * Unique JDBC HTTP path: `sql/protocolv1/o/6987013384345789/2233-255452-boned277`

   Click **Update** once complete.

3. Log into one of the containers for the ADLS Gen2 zone.

   You will first need to obtain a Container ID from the adls2 zone, this will be a 12 digit hexadecimal string. The name of the image will appear much like this example - `fusion-docker-compose_fusion-ui-server-adls2_1`.

   `docker ps` _- obtain ID._

   `docker exec -u root -it $CONTAINER_ID /bin/bash`

4. Upload the Live Analytics "datatransformer" jar using a curl command.

   _Example_

   `curl -v -H "Authorization: Bearer dapicd7689jkb25473c765ghty78bb299a83"  -F contents=@/opt/wandisco/fusion/plugins/databricks/live-analytics-databricks-etl-5.0.0.0-SNAPSHOT.jar -F path="/datatransformer.jar" https://westeurope.azuredatabricks.net/api/2.0/dbfs/put`

   You will need to adjust the command so that your Bearer token and azuredatabricks URL is referenced.

5. Log into the Azure portal and Launch Workspace for your Databricks cluster.

6. On the left-hand panel, select **Clusters** and then select your interactive cluster.

7. Click on the **Libraries** tab, and select the option to **Install New**.

8. Select the following options for the Install Library prompt:

   * Library Source = `DBFS`

   * Library Type = `Jar`

   * File Path = `dbfs:/datatransformer.jar`

9. Select **Install** once the details are entered. Wait for the **Status** of the jar to display as **Installed** before continuing.

### Replication rules

1. TBA

## Advanced options

* This guide does not currently offer configuration of Fusion to a **Kerberized** HDP cluster.
* This guide does not currently offer configuration of Fusion to a NameNode HA HDP cluster.

Please contact [WANdisco](https://wandisco.com/contact) for further information on Fusion with docker.
