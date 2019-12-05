---
id: hdp_lhv_client-adlsg2_lan
title: Hortonworks (HDP) with Live Hive & Client to ADLS Gen2 with Live Analytics
sidebar_label: Hortonworks (HDP) with Live Hive & Client to ADLS Gen2 with Live Analytics
---

_THIS GUIDE IS WORK IN PROGRESS, PLEASE DO NOT FOLLOW ANYTHING HERE UNTIL THIS WARNING IS REMOVED_

Use this quickstart if you want to configure Fusion to connect to Hortonworks (HDP) and ADLS Gen2 storage/Databricks cluster. This guide will also include Live Hive on the HDP cluster, and Live Analytics on the ADLS Gen2/Databricks cluster.

Please see the [Useful information](https://wandisco.github.io/wandisco-documentation/docs/troubleshooting/useful_info) section for additional commands and help.

## Prerequisites

To complete this lab exercise, you will need:

* Azure VM instance set up and running, with root access available (instructions were tested on RHEL 7).
  * (TBC) Minimum size VM recommendation = **Standard A4m v2 (4 vcpus, 32 GiB memory).**

    A mininum of 100GB storage is required for the `/var` partition.
  * [Docker](https://docs.docker.com/install/) (v19.03.3 or higher), [Docker Compose](https://docs.docker.com/compose/install/) (v1.24.1 or higher), and [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed on instance.
  * `wget`, `tar` and `unzip` utilities installed on the instance, including a CLI text editor (such as `vi`).
* Administrator credentials for the HDP Ambari Manager and root access via terminal.
* Network connectivity to the Ambari Manager and NameNode.
* Credentials for accessing the Data Lake Storage Gen2 and Databricks cluster.
* Network connectivity to the Data Lake Storage Gen2 and Databricks cluster.

## Guidance

All the commands within this guidance should be run as **root** user. To switch to this user, type `sudo -i` in the command line when logged in as the default Azure user (this will have been set during creation of the VM).

### Initial Setup

1. Clone the Fusion docker repository to your Azure VM instance:

   `git clone -b features/livehive-merge https://github.com/WANdisco/fusion-docker-compose.git`

2. Change to the repository directory:

   `cd fusion-docker-compose`

3. Edit the Common configuration file for the purposes of this demo:

   `vi common.conf`

   Change:

   ```json
   # save versions
   save_var FUSION_BASE_VERSION           "2.14.2.1" "$SAVE_ENV"
   save_var FUSION_IMAGE_RELEASE          "3594"     "$SAVE_ENV"
   save_var FUSION_NN_PROXY_VERSION       "4.0.0.6"  "$SAVE_ENV"
   save_var FUSION_NN_PROXY_IMAGE_RELEASE "3594"     "$SAVE_ENV"
   save_var FUSION_ONEUI_VERSION          "1.0.0"    "$SAVE_ENV"
   save_var FUSION_LIVEHIVE_VERSION       "5.0.0.0"  "$SAVE_ENV"
   ```

   To:

   ```json
   # save versions
   save_var FUSION_BASE_VERSION           "2.14.2.1" "$SAVE_ENV"
   save_var FUSION_IMAGE_RELEASE          "3600"     "$SAVE_ENV"
   save_var FUSION_NN_PROXY_VERSION       "4.0.0.6"  "$SAVE_ENV"
   save_var FUSION_NN_PROXY_IMAGE_RELEASE "3600"     "$SAVE_ENV"
   save_var FUSION_ONEUI_VERSION          "1.0.0"    "$SAVE_ENV"
   save_var FUSION_LIVEHIVE_VERSION       "5.0.0.1"  "$SAVE_ENV"
   ```

   Once complete, save and quit the file (e.g. `:wq!`).

4. Run the setup script:

   `./setup-env.sh`

5. Follow the prompts to configure your zones, see the next section below for guidance on this.

### Setup prompts

  _Zone type_

  * For the purposes of this quickstart, please enter `hdp` for the first zone type, and `adls2` for the second zone type.

  _Zone name_

  * If defining a zone name, please note that each zone must have a different name (i.e. they cannot match). Otherwise, press enter to leave as default.

  _Licenses_

  * Trial licenses will last 30 days and are limited to 1TB of replicated data. Press enter to leave as default trial license.

  _Docker hostname_

  * For the purposes of this quickstart, this can be changed to the IP address of your docker host.

  _Example entries for HDP_

  * HDP version: `2.6.5`

  * Hadoop NameNode IP/hostname: `namenode.example.com` - The value will be the hostname defined in the `fs.defaultFS` property in the HDFS config, but not including the `hdfs://` prefix.

  * NameNode port: `8020` - The value will be the port defined in the `fs.defaultFS` property in the HDFS config.

  * NameNode Service Name: `<namenode_hostname>:8020` - Press adjust this property so that it references the HDP cluster's NameNode hostname on port 8020.

  _Example entries for Live Hive_

  * Enter `livehive` for the HDP zone when prompted to select a plugin.

  * Hive Metastore hostname: `metastore.hostname.com` - The HDP cluster's Hive Metastore hostname, can be seen by hovering over the Hive Metastore in the Hive summary page.

  * Hive Metastore port: `9083` - This value can be left as default.

  _Example entries for ADLS Gen2_

  * HDI version: `3.6`

  * Storage account: `adlsg2storage`

  * Storage container: `fusionreplication`

  * Account key: `KEY_1_STRING` - the Primary Access Key is now referred to as "Key1" in Microsoft’s documentation. You can get the Access Key from the Microsoft Azure storage account under the **Access Keys** section.

  * default FS: `abfss://fusionreplication@adlsg2storage.dfs.core.windows.net/` - press enter for the default value.

  * underlying FS: `abfs://fusionreplication@adlsg2storage.dfs.core.windows.net/` - press enter for the default value.

  * Enter `NONE` for the adls2 zone when prompted to select a plugin.

### Startup

After all the prompts have been completed, you will be able to start the containers.

1. Perform a docker image pull of specific images to be used for this quickstart:

   ```json
   docker image pull registry.wandisco.com:8423/wandisco/fusion-ui-server-hcfs-azure-hdi-3.6:2.14.2.1-3594
   docker image tag registry.wandisco.com:8423/wandisco/fusion-ui-server-hcfs-azure-hdi-3.6:2.14.2.1-3594 wandisco/fusion-ui-server-hcfs-azure-hdi-3.6:2.14.2.1-3600
   docker image pull registry.wandisco.com:8423/wandisco/fusion-server-hcfs-azure-hdi-3.6:2.14.2.1-3594
   docker image tag registry.wandisco.com:8423/wandisco/fusion-server-hcfs-azure-hdi-3.6:2.14.2.1-3594 wandisco/fusion-server-hcfs-azure-hdi-3.6:2.14.2.1-3600
   docker image pull registry.wandisco.com:8423/wandisco/fusion-ihc-server-hcfs-azure-hdi-3.6:2.14.2.1-3594
   docker image tag registry.wandisco.com:8423/wandisco/fusion-ihc-server-hcfs-azure-hdi-3.6:2.14.2.1-3594 wandisco/fusion-ihc-server-hcfs-azure-hdi-3.6:2.14.2.1-3600
   ```

2. Ensure that Docker is started:

   `systemctl status docker`

   If not, start the Docker service:

   `systemctl start docker`

3. Start the Fusion containers with:

   `docker-compose up -d`

4. If the Induction container comes up before all other containers, please run the previous command again to ensure the zones are inducted together.

   `docker-compose up -d`

### Live Hive config changes

1. Log into one of the containers for the HDP zone.

   You will first need to obtain the name of a suitable container, this can be done by running the command below.

   `docker-compose ps` _- obtain list of container names._

   Utilise a container name from the HDP zone in the command below, for example, `fusion-docker-compose_fusion-ui-server-hdp_1`.

   `docker exec -it fusion-docker-compose_fusion-ui-server-hdp_1 bash`

2. Symlink the Live Hive config files to the Fusion Server config path:

   `ln -s /etc/wandisco/fusion/plugins/hive/* /etc/wandisco/fusion/server/`

   You will see the following error message afterwards, please ignore as it is benign:

   ```json
   ln: failed to create symbolic link ‘/etc/wandisco/fusion/server/logger.properties’: File exists
   ```

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
   user.password=$2a$10$jQH1VJ/zBByUD8d0prf0A.Uh9FDKuW/AWUUEayefsP/owiIuFrRAW
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

5. Exit back into the docker host and restart the Fusion containers so that the configuration changes are picked up.

   `exit`

   `docker-compose restart`

6. Log into the Fusion UI for the HDP zone, and activate the Live Hive plugin.

   `http://<docker_hostname/IP>:8083`

   Username: `admin`
   Password: `wandisco`

   Proceed to the Settings tab and select the *Live Hive: Plugin Activation* option on the left-hand panel.

   Click on the *Activate* option.

7. Log out of the UI afterwards by clicking on the **admin** text on the top-right of the UI and selecting **Log out** on the dropdown.

### Install Fusion Client on HDP nodes

1. Log into the Ambari Server via a terminal session.

2. Download the Fusion Client stack package located here:

   `wget http://<docker_hostname/IP>:8083/ui/downloads/stack_packages/fusion-hcfs-hdp-2.6.5-2.14.2.1.stack.tar.gz`

3. Decompress the stack to the Ambari services directory.

   `tar -xf fusion-hcfs-hdp-2.6.5-2.14.2.1.stack.tar.gz -C /var/lib/ambari-server/resources/stacks/HDP/2.6/services/`

4.  Delete the compressed file afterwards.

    `rm -f fusion-hcfs-hdp-2.6.5-2.14.2.1.stack.tar.gz`

5. Restart the Ambari Server so that the new stack will be available to install.

   `ambari-server restart`

6. Log into the Ambari UI once it is available after the restart.

7. In the Dashboard, select to **Add Service** in the Actions.

8. Select the **Wandisco Fusion Client** and click Next.

9. Ensure the **Wandisco Fusion Client** is assigned to all nodes. Click Next once confirmed.

10. On the **Customize Services** page, insert the URL for the Wandisco Fusion UI for the HDP zone - `http://<dockerip>:8083`. Click Next once complete.

    _Please ignore any Recommended Changes if they are suggested by Ambari. This can be done by unticking the checkbox left of the Property column header, and clicking OK._

11. On the **Review** page, click Deploy. After the **Install, Start and Test** operation is complete, click Next.

12. On the **Summary** page, click Complete.

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

    _Please ignore any Recommended Changes if they are suggested by Ambari. This can be done by unticking the checkbox left of the Property column header, and clicking OK._

11. On the **Review** page, click Deploy. After the **Install, Start and Test** operation is complete, click Next.

12. On the **Summary** page, click Complete.

### Activate Fusion Client on the HDP cluster

1. Log into the Ambari UI for the HDP cluster.

2. Add the following properties to the HDFS config so that the Fusion Client is used on the cluster.

   **HDFS -> Configs -> Advanced -> Custom core-site**

   Click **Add Property ...** and add the following below in **Bulk property add mode**.

   ```json
   fs.fusion.underlyingFs=hdfs://<namenode_hostname>:8020
   fs.hdfs.impl=com.wandisco.fs.client.FusionHdfs
   fusion.client.ssl.enabled=false
   fusion.http.authentication.enabled=false
   fusion.http.authorization.enabled=false
   fusion.replicated.dir.exchange=/wandisco/exchange_dir
   fusion.server=<docker_hostname/IP>:8023
   hadoop.proxyuser.hdfs.hosts=<docker_hostname/IP>
   hadoop.proxyuser.hdfs.groups=*
   ```

   Please ensure to adjust the `<namenode_hostname>` and `<docker_hostname/IP>` values to your environment.

   Select **Add** and then **Save** the HDFS config.

3. Adjust the following property in YARN.

   **YARN -> Configs -> Advanced -> Advanced yarn-log4j**

   Add the following two new lines to the bottom of the text window.

   ```json
   log4j.logger.com.wandisco.fusion.client.BypassConfiguration=OFF
   log4j.logger.com.wandisco.fs.client=OFF
   ```

   **Save** the YARN config afterwards.

4. Adjust the following property in MapReduce2.

   **MapReduce2 -> Configs -> Filter for "mapreduce.application.classpath"**

   Append the following onto the very end of the property:

   `:/opt/wandisco/fusion/client/lib/*`

   The final value should look similar to below:

   ```json
   $PWD/mr-framework/hadoop/share/hadoop/mapreduce/*:$PWD/mr-framework/hadoop/share/hadoop/mapreduce/lib/*:$PWD/mr-framework/hadoop/share/hadoop/common/*:$PWD/mr-framework/hadoop/share/hadoop/common/lib/*:$PWD/mr-framework/hadoop/share/hadoop/yarn/*:$PWD/mr-framework/hadoop/share/hadoop/yarn/lib/*:$PWD/mr-framework/hadoop/share/hadoop/hdfs/*:$PWD/mr-framework/hadoop/share/hadoop/hdfs/lib/*:$PWD/mr-framework/hadoop/share/hadoop/tools/lib/*:/usr/hdp/${hdp.version}/hadoop/lib/hadoop-lzo-0.6.0.${hdp.version}.jar:/etc/hadoop/conf/secure:/usr/hdp/current/ext/hadoop/*:/opt/wandisco/fusion/client/lib/*
   ```

   **Save** the MapReduce2 config afterwards.

5. Adjust the following property in Tez.

   **Tez -> Configs -> Filter for "tez.cluster.additional.classpath.prefix"**

   Append the following onto the very end of the property:

   `:/opt/wandisco/fusion/client/lib/*`

   The final value should look similar to below:

   ```json
   /usr/hdp/${hdp.version}/hadoop/lib/hadoop-lzo-0.6.0.${hdp.version}.jar:/etc/hadoop/conf/secure:/opt/wandisco/fusion/client/lib/*
   ```

   **Save** the Tez config afterwards.

### Activate Live Hive Proxy on the HDP cluster

1. Log into the Ambari UI for the HDP cluster.

2. Adjust two properties in the Hive config so that it references the Live Hive Proxy.

   **Hive -> Configs -> Filter for "hive.metastore.uris"**

   Adjust the value of `hive.metastore.uris` in the following sub-sections:

   _General_

   ```json
   thrift://<docker_IP_address>:9083
   ```

   _Advanced webhcat-site_

   ```json
   hive.metastore.local=false,hive.metastore.uris=thrift://<docker_IP_address>:9083,hive.metastore.sasl.enabled=false
   ```

3. Adjust a property so that the Live Hive Proxy will handle both data and metadata changes.

   **Hive -> Configs -> Filter for "hive-env template"**

   Add the following three new lines to the bottom of the text window.

   ```json
   if [ "$SERVICE" = "metastore" ]; then
     export FUSION_REPLICATION_DISABLED=true # Set by WANdisco for use with live hive proxy
   fi
   ```

4. **Save** the Hive config after making these adjustments.

### Restart required services

1. Restart the **HDFS**, **YARN**, **MapReduce2**, **Tez** and **Hive** services in that order.

   If any other services are designated with a stale configuration, please restart them as well.

2. After all the HDP cluster services have finished restarting, log onto the docker host and restart the Fusion containers:

   `docker-compose restart`

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

   _Ensure to change the above examples to match your Databricks details._

   Click **Update** once complete.

3. Log into one of the containers for the ADLS Gen2 zone.

   `ssh <docker_hostname/IP>`

   `cd fusion-docker-compose`

   You will first need to obtain the name of a suitable container, this can be done by running the command below.

   `docker-compose ps` _- obtain list of container names._

   Utilise a container name from the ADLS Gen2 zone in the command below, for example, `fusion-docker-compose_fusion-ui-server-adls2_1`.

   `docker exec -u root -it fusion-docker-compose_fusion-ui-server-adls2_1 bash`

4. Upload the Live Analytics "datatransformer" jar using a curl command.

   _Example_

   * Bearer Token: `dapicd7689jkb25473c765ghty78bb299a83`
   * Databricks Service Address: `westeurope.azuredatabricks.net`

   `curl -v -H "Authorization: Bearer dapicd7689jkb25473c765ghty78bb299a83"  -F contents=@/opt/wandisco/fusion/plugins/databricks/live-analytics-databricks-etl-5.0.0.0.jar -F path="/datatransformer.jar" https://westeurope.azuredatabricks.net/api/2.0/dbfs/put`

   You will need to adjust the command so that your Bearer Token and Databricks Service Address is referenced.

5. Log into the Azure portal and Launch Workspace for your Databricks cluster.

6. On the left-hand panel, select **Clusters** and then select your interactive cluster.

7. Click on the **Libraries** tab, and select the option to **Install New**.

8. Select the following options for the Install Library prompt:

   * Library Source = `DBFS`

   * Library Type = `Jar`

   * File Path = `dbfs:/datatransformer.jar`

9. Select **Install** once the details are entered. Wait for the **Status** of the jar to display as **Installed** before continuing.

10. Log out of the UI afterwards by clicking on the **admin** text on the top-right of the UI and selecting **Log out** on the dropdown.

## Replication

In this section, follow the steps detailed to perform live replication of HCFS data and Hive metadata from the HDP cluster to the Azure Databricks cluster.

### Create replication rules

1. Log into the Fusion UI for the HDP zone.

   `http://<docker_hostname/IP>:8083`

   Username: `admin`
   Password: `wandisco`

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

   * Description = `testing` _- this field is optional_

   Click **Create rule** once complete.

5. Both rules should now display on the **Replication** tab in the Fusion UI.

### Test replication

Prior to performing these tasks, the Databricks cluster must be in a **running** state. Please access the Azure portal and check the status of the cluster. If it is not running, select to start the cluster and wait until it is **running** before continuing.

1. Log into a HDP cluster node with the Hive client available.

   You can confirm the Hive client is installed by switching to the `hdfs` user and running `hive` on the command line.

   `ssh <hdp-cluster-node>`

   `su - hdfs`

   `hive`

   After running the Hive command as the `hdfs` user, you will now be inside a Hive interactive session.

2. Create a database to use that will match the regex for the Hive replication rule created earlier in the Fusion UI.

   `hive> create database test01;`

3. Create a table inside of the database.

   `hive> use test01;`

   `hive> create table table01(id int, name string) stored as ORC;`

4. Insert data inside of the table.

   `hive> insert into table01 values (1,'words');`

   This will now launch a Hive job that will insert the data values provided in this example. If this is successful, you will see **SUCCEEDED** written in the STATUS column.

### Verify replication

1. To verify the data values inside of the table on the **HDP** zone, run the command below when still logged into the Hive interactive session:

   `hive> select * from table01;`

   The output will be similar to that of below:

   ```json
   OK
   1       words
   Time taken: X seconds, Fetched: 1 row(s)
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

## Advanced options

* This guide does not currently offer configuration of Fusion to a **Kerberized** HDP cluster.
* This guide does not currently offer configuration of Fusion to a NameNode HA HDP cluster.

Please contact [WANdisco](https://wandisco.com/contact) for further information on Fusion with docker.
