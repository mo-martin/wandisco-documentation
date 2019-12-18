---
id: hdp_sandbox_lhv_client-adlsg2_lan_11-12-2019
title: Hortonworks (HDP) Sandbox with Live Hive to Azure Databricks with Live Analytics
sidebar_label: HDP Sandbox with Live Hive to Azure Databricks with Live Analytics
---

_THIS GUIDE IS WORK IN PROGRESS, PLEASE DO NOT FOLLOW ANYTHING HERE UNTIL THIS WARNING IS REMOVED_

[//]: <This quickstart is work in progress, and new items are still being added. The development approach is that all known workarounds/configuration steps will be kept in the document until we have fully confirmed their fix (see MTC label). At which point, they will be removed. The same will apply for configuration/installation steps when blueprints for HDP or Fusion have been completed (see DAP-144).>

Use this quickstart if you want to configure Fusion to connect to Hortonworks (HDP) and ADLS Gen2 storage/Databricks cluster. This guide will also include Live Hive on the HDP cluster, and Live Analytics on the ADLS Gen2/Databricks cluster.

Please see the [Useful information](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/troubleshooting/useful_info) section for additional commands and help.

## Prerequisites

[//]: <We are still working out the minimum VM requirements, at the moment, we are with Standard D8 v3 ones.>
[//]: <Issues with running out of disk space because of docker images filling up the root partition (see DAP-134). As such, we suggest adding a data disk for storage. Additional step is mentioned further down as to when this must be mounted with link to Microsoft documentation. If there is time, we could look to include all of these steps within this document.>

To complete this lab exercise, you will need:

* Azure VM server set up and running on CentOS-based 7.7 or higher (instructions were tested on this release).
  * (TBC) Minimum size VM recommendation = **Standard D8 v3 (8 vcpus, 32 GiB memory).**
  * A minimum of 100GB storage is required for the `/datadrive` partition. See the [Microsoft documentation](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/attach-disk-portal) for steps on how to attach a disk to a Linux VM.
  * Root access on server (this is normally available by default).
* Credentials for accessing the Data Lake Storage Gen2 and Databricks cluster.
* Network connectivity from the VM to the Data Lake Storage Gen2 and Databricks cluster.

###  Note on command line editing

The `vi` command line editor will be used in this lab, please see this [vi cheat sheet](https://ryanstutorials.net/linuxtutorial/cheatsheetvi.php) for guidance on how to use it.

## Preparation

All the commands within this guidance should be run as **root** user. To switch to this user, type `sudo -i` in the command line when logged in as the default Azure user (this will have been set during creation of the VM).

### Disable iptables and selinux

For the purposes of this lab, iptables and selinux will be disabled.

1. Log into the VM via a terminal session and switch to root user.

   `ssh <docker_host>`

   `sudo -i`

2. Run the commands below to stop and disable iptables.

   `systemctl stop firewalld`

   `systemctl disable firewalld`

3. Edit the selinux configuration file to disable it.

   `vi /etc/sysconfig/selinux`

   Change:

   `SELINUX=enforced`

   To:

   `SELINUX=disabled`

   Once complete, save and quit the file (e.g. `:wq!`).

4. If not already performed, please mount the `/datadrive` partition now as detailed in the [link](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/attach-disk-portal#connect-to-the-linux-vm-to-mount-the-new-disk) provided in the prerequisites.

5. The server will now need to be rebooted, run the command below to do this.

   `shutdown -r now`

   You will be automatically logged out of the server.

### Install utilities

1. Log into the VM via a terminal session and switch to root user.

   `ssh <docker_host>`

   `sudo -i`

[//]: <JDK dependency for the 'wandocker.run' script>

2. Run the command below to install Java 1.8 and Git.

   `yum install -y java-1.8.0-openjdk.x86_64 git`

3. Run the commands below to install [Docker](https://docs.docker.com/install/) (v19.03.5 or higher).

   `yum install -y yum-utils device-mapper-persistent-data lvm2`

   `yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo`

   `yum install docker-ce docker-ce-cli containerd.io` - answer `y` to any prompts.

4. Start the Docker service and verify that it is correctly installed.

   `systemctl start docker`

   `docker run hello-world` - This will print an informational message and exit if docker is running correctly.

   `systemctl enable docker` - This will enable docker to start up automatically on server reboot.

5. Install [Docker Compose for Linux](https://docs.docker.com/compose/install/#install-compose) (v1.25.0 or higher) by running the commands below.

   `curl -L "https://github.com/docker/compose/releases/download/1.25.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`

   `chmod +x /usr/local/bin/docker-compose`

   `ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose`

6. Verify that Docker Compose is correctly installed.

   `docker-compose --version`

   _Example output_
   ```json
   docker-compose version 1.25.0, build 1110ad01
   ```

### Prepare storage for docker images

[//]: <As referenced in prerequisites, these steps will prevent the root partition from filling up.>

The steps in this section can only be performed if docker is installed and the `/datadrive` partition was created as per the prerequisites.

1. Copy the contents of the Docker directory whilst retaining permissions.

   `cp -Rp /var/lib/docker /datadrive/`

2. Delete the original directory and creating a symlink to the new location.

   `rm -rf /var/lib/docker`

   `ln -s /datadrive/docker /var/lib/docker`

## Installation

### Initial Setup for HDP Sandbox - WiP

[//]: <DAP-142>

[//]: <These steps are being performed using the 'wandocker.run' script. This script allows for the creation of a custom network name, as well as selecting existing ones. It is also using Ambari 2.7.3, which will allow us to export blueprints via the UI when we have configured everything on the cluster. There is also expansion planned to the script capabilities (on the side) for multiple node HDP clusters, so that future testing could be done with NameNode HA.>

1. Download the HDP sandbox script.

   `wget wandocker.run`

2. Run the script and change directory.

   `./wandocker.run`

   `cd wandocker`

[//]: <DAP-151 workaround>

3. Edit the `hdp265_docker.ini` file to change port 9083 to 9084 in order to resolve a port conflict.

   `vi hdp265_docker.ini`

   Change:

   `ports=8080,8088,8042,8020,9083,50010,50070`

   To:

   `ports=8080,8088,8042,8020,9084,50010,50070`

   Once complete, save and quit the file (e.g. `:wq!`).

4. Run the wandocker script.

   `./wandocker.sh -i hdp265_docker.ini`

5. Choose Option 1 to set up all the required images for the HDP sandbox and repository.

   `1` - Build All Images (Repo, Agent, Server)

   This may take some time so feel free to take a 15-20min break at this point.

   Once the stream has finished, press enter to return to the Main Menu.

6. Select option 2 to create the HDP repository.

   `2` - Create and start Local Repo Container

   Press `n` to create a new network.

   Type `fusion-docker-compose_fusion` as the new network name, followed by enter.

7. Select option 3 to create the HDP sandbox.

   `3` - Create and start Sandbox Container(s)

   Enter the appropriate number to use the `fusion-docker-compose_fusion` network (previously created for the HDP repository).

   Before continuing, wait until the Ambari UI is accessible on `http://<docker_IP_address>:8080` before continuing (you do not need to log in at this time). It will take a few minutes until the UI is available.

8. Install the Cluster blueprint by selecting option 4.

   `4` - Install Cluster from Blueprint

9. Log into the Ambari UI.

   Username = `admin`
   Password = `admin`

   Two automated jobs will automatically be started for installing and starting components, observable in **Background Operations**. Wait until these are complete before continuing (~10mins).

### Adjust default Hive Metastore port and Tez application memory

[//]: <DAP-151 workaround.>

_If this section, select to **Proceed anyway** if prompted by Ambari due to any warnings after saving config._

1. Adjust two properties in the Hive config so that it references the `9084` port.

   **Hive -> Configs -> Filter for "hive.metastore.uris"**

   Adjust the value of `hive.metastore.uris` from port 9083 to 9084 in the following sub-sections:

   _General_

   ```json
   thrift://manager:9084
   ```

   _Advanced webhcat-site_

   ```json
   hive.metastore.local=false,hive.metastore.uris=thrift://manager:9084,hive.metastore.sasl.enabled=false
   ```

2. Adjust one additional property in the Hive config that sets the bind port for the Metastore.

   **Hive -> Configs -> Filter for "hive-env template"**

   Find the line below in the text window, and adjust the port number.

   Change:

   `export METASTORE_PORT=9083`

   To:

   `export METASTORE_PORT=9084`

3. **Save** the Hive config after making these adjustments.

[//]: <This is required due to hitting issues when running insert into tables in Hive sessions. The current default Yarn max container size is smaller than the Tez application memory size, so adjusting this property prevents errors during insert. See https://techtalks.tech/knowledge-base/tuning-tez-for-hive-optimizing-tez/ for info. This can be removed once baked into blueprint.>

4. Adjust the maximum memory value for applications in Tez.

   **Tez -> Configs -> Filter for "tez.am.resource.memory.mb"**

   Change:

   `tez.am.resource.memory.mb = 8192`

   To:

   `tez.am.resource.memory.mb = 5120`

5. **Save** the Tez config after making this adjustment.

6. **Restart** the Tez and Hive service (in that order) after completing this.

### Add temporary entry to hosts file

[//]: <This is required to get the Fusion docker setup script to pass verification when entering the HDP NameNode/Metastore hostnames. It is removed after the setup script is done.>

1. On the docker host, edit the hosts file so that the correct hostname variables will be set during the Fusion setup.

   `vi /etc/hosts`

   Add an additional line as below:

   `127.0.0.1   manager fusion-nn-proxy-hdp fusion-server-hdp fusion-livehive-proxy-hdp`

   Once complete, save and quit the file (e.g. `:wq!`).

### Initial Setup for Fusion

1. Clone the Fusion docker repository to your Azure VM instance:

   `cd ~`

   `git clone -b features/livehive-merge https://github.com/WANdisco/fusion-docker-compose.git`

2. Change to the repository directory:

   `cd fusion-docker-compose`

3. Run the setup script:

   `./setup-env.sh`

4. Follow the prompts to configure your zones, see the next section below for guidance on this.

### Setup prompts

  _Zone type_

  * For the purposes of this quickstart, please enter `hdp` for the first zone type, and `adls2` for the second zone type.

  _Zone name_

  * If defining a zone name, please note that each zone must have a different name (i.e. they cannot match). Otherwise, press enter to leave as default.

  _Licenses_

  * Trial licenses will last 30 days and are limited to 1TB of replicated data. Press enter to leave as default trial license.

  _Docker hostname_

  * For the purposes of this quickstart, this can be changed to the IP address of your docker host.

  _Entries for HDP_

  * HDP version: `2.6.5`

  * Hadoop NameNode IP/hostname: `manager` - The value will be the hostname defined in the `fs.defaultFS` property in the HDFS config, but does not include the `hdfs://` prefix or port `8020`.

  * NameNode port: `8020` - The value will be the port defined in the `fs.defaultFS` property in the HDFS config.

  * NameNode Service Name: `manager:8020` - The value will be the hostname and port combined in the `fs.defaultFS` property in the HDFS config, but not including the `hdfs://` prefix.

  _Entries for Live Hive_

  * Enter `livehive` for the HDP zone when prompted to select a plugin.

  * Hive Metastore hostname: `manager` - The HDP cluster's Hive Metastore hostname, can be seen by hovering over the Hive Metastore in the Hive summary page. As this is a one node cluster, the value will be the same as the NameNode.

[//]: <DAP-151 workaround.>

  * Hive Metastore port: `9084` - Please type `9084` and press enter.

  _Entries for ADLS Gen2_

  * HDI version: `3.6`

  Please ensure to enter your details for the **Storage account**, **Storage container** and **Account Key** values so that they match your account in Azure. The examples shown below are for guidance only.

  * Storage account: `adlsg2storage`

  * Storage container: `fusionreplication`

  * Account key: `KEY_1_STRING` - the Primary Access Key is now referred to as "Key1" in Microsoft’s documentation. You can get the Access Key from the Microsoft Azure storage account under the **Access Keys** section.

  * default FS: `abfss://fusionreplication@adlsg2storage.dfs.core.windows.net/` - press enter for the default value.

  * underlying FS: `abfs://fusionreplication@adlsg2storage.dfs.core.windows.net/` - press enter for the default value.

  * Enter `NONE` for the adls2 zone when prompted to select a plugin.

At this point, the setup prompts will be complete and the script will exit out with an informational message. Please ignore this for now and continue following the steps below.

### Remove temporary entry to hosts file

1. Edit the hosts file as the additional entry is no longer required and will create problems with the internal network if not removed.

   `vi /etc/hosts`

   Remove the line below:

   `127.0.0.1   manager fusion-nn-proxy-hdp fusion-server-hdp fusion-livehive-proxy-hdp`

   Once complete, save and quit the file (e.g. `:wq!`).

### Startup

After all the prompts have been completed, you will be able to start the containers.

1. Ensure that Docker is started:

   `systemctl status docker`

   If not, start the Docker service:

   `systemctl start docker`

2. Start the Fusion containers with:

   `docker-compose up -d`

## Configuration

### Live Hive config changes

1. Log into one of the containers for the HDP zone.

   `docker exec -it fusion-docker-compose_fusion-ui-server-hdp_1 bash`

2. Add an additional property to the Live Hive config:

   `vi /etc/wandisco/fusion/plugins/hive/live-hive-site.xml`

   Add the following property and value below:

   ```json
     <property>
       <name>live.hive.cluster.delegation.token.delayed.removal.interval.in.seconds</name>
       <value>5</value>
     </property>
   ```

   Once complete, save and quit the file (e.g. `:wq!`).

3. Exit back into the docker host and restart the Fusion containers so that the configuration changes are picked up.

   `exit`

   `docker-compose restart`

4. Log into the Fusion UI for the HDP zone, and activate the Live Hive plugin.

   `http://<docker_IP_address>:8083`

   Username: `admin`
   Password: `admin`

   Proceed to the Settings tab and select the *Live Hive: Plugin Activation* option on the left-hand panel.

   Click on the *Activate* option. Wait for the **Reload this window** message to appear and refresh the page.

### Install Fusion Client on HDP nodes

[//]: <INC-681 workaround>

1. Log into the Ambari Server container on the docker host.

   `docker exec -it manager bash`

2. Download the Fusion Client stack package located here:

   `wget http://fusion-ui-server-hdp:8083/ui/downloads/stack_packages/fusion-hcfs-hdp-2.6.5-2.14.2.2.stack.tar.gz`

3. Decompress the stack to the Ambari services directory.

   `tar -xf fusion-hcfs-hdp-2.6.5-2.14.2.2.stack.tar.gz -C /var/lib/ambari-server/resources/stacks/HDP/2.6/services/`

4.  Delete the compressed file afterwards.

    `rm -f fusion-hcfs-hdp-2.6.5-2.14.2.2.stack.tar.gz`

5. Restart the Ambari Server so that the new stack will be available to install.

   `ambari-server restart`

6. Log back into the Ambari UI once it is available after the restart.

   Username = `admin`
   Password = `admin`

7. In the Dashboard, select to **Add Service** in the Actions.

8. Select the checkbox for **Wandisco Fusion** and click Next.

9. Ensure the **Client** is assigned to all nodes. Click Next once confirmed.

10. On the **Customize Services** page, provide two configuration values as guided below:

    WANDISCO FUSION -> Advanced fusion-client-config -> Provide the value of `fusion.ui.server.url` as `http://<docker_IP_address>:8083`.

    HDFS -> Advanced -> Advanced core-site -> Provide the value of `hadoop.proxyuser.*` as `hdfs`.

    Click Next once complete.

    _Select to **Proceed anyway** if prompted by Ambari due to any warnings._

11. On the **Review** page, click Deploy. After the **Install, Start and Test** operation is complete, click Next.

12. On the **Summary** page, click Complete.

### Install the Live Hiveserver2 template on the HDP cluster

[//]: <DAP-137 referenced for this work>

1. Log into the Ambari Server container on the docker host (or return to the terminal session if you are still logged into the manager container).

   `docker exec -it manager bash`

2. Download the Live Hiveserver2 template stack from the docker host.

   `wget http://fusion-ui-server-hdp:8083/ui/downloads/core_plugins/live-hive/stack_packages/live-hiveserver2-template-5.0.0.1.stack.tar.gz`

3. Decompress the stack to the Ambari services directory.

   `tar -xf live-hiveserver2-template-5.0.0.1.stack.tar.gz -C /var/lib/ambari-server/resources/stacks/HDP/2.6/services/`

4. Delete the compressed file afterwards.

   `rm -f live-hiveserver2-template-5.0.0.1.stack.tar.gz`

5. Restart the Ambari Server so that the new stack will be available to install.

   `ambari-server restart`

   Once the Ambari Server has finished restarting, exit the container:

   `exit`

6. Log back into the Ambari UI once it is available after the restart.

   Username = `admin`
   Password = `admin`

7. In the Dashboard, select to **Add Service** in the Actions.

8. Select the checkbox for **Live Hiveserver2 Template** and click Next.

9. Ensure the **Live Hiveserver2 Template Master** is assigned to the host on which the **Hiveserver2** component is installed. Click Next once confirmed.

10. On the **Customize Services** page, click Next.

    _Select to **Proceed anyway** if prompted by Ambari due to any warnings._

11. On the **Review** page, click Deploy. After the **Install, Start and Test** operation is complete, click Next.

12. On the **Summary** page, click Complete.

### Activate Fusion Client on the HDP cluster

[//]: <INC-681 workaround due to Fusion Client requirements for Hadoop services.>

_If this section, select to **Proceed anyway** if prompted by Ambari due to any warnings after saving config._

1. On the Ambari UI, add the following properties to the HDFS config so that the Fusion Client is used on the cluster.

   **HDFS -> Configs -> Advanced -> Custom core-site**

   Click **Add Property ...** and add the following below in **Bulk property add mode**.

   ```json
   fs.fusion.underlyingFs=hdfs://manager:8020
   fs.hdfs.impl=com.wandisco.fs.client.FusionHdfs
   fusion.client.ssl.enabled=false
   fusion.http.authentication.enabled=false
   fusion.http.authorization.enabled=false
   fusion.server=fusion-server-hdp:8023
   ```

   Select **Add** and then **Save** the HDFS config.

2. Add the following entry to the YARN config.

   **YARN -> Configs -> Advanced -> Advanced yarn-log4j**

   Add the following two new lines to the bottom of the text window.

   ```json
   log4j.logger.com.wandisco.fusion.client.BypassConfiguration=OFF
   log4j.logger.com.wandisco.fs.client=OFF
   ```

   **Save** the YARN config afterwards.

3. Adjust the following property in MapReduce2.

   **MapReduce2 -> Configs -> Filter for "mapreduce.application.classpath"**

   Append the following onto the very end of the property:

   `:/opt/wandisco/fusion/client/lib/*`

   The final value should look similar to below:

   ```json
   $PWD/mr-framework/hadoop/share/hadoop/mapreduce/*:$PWD/mr-framework/hadoop/share/hadoop/mapreduce/lib/*:$PWD/mr-framework/hadoop/share/hadoop/common/*:$PWD/mr-framework/hadoop/share/hadoop/common/lib/*:$PWD/mr-framework/hadoop/share/hadoop/yarn/*:$PWD/mr-framework/hadoop/share/hadoop/yarn/lib/*:$PWD/mr-framework/hadoop/share/hadoop/hdfs/*:$PWD/mr-framework/hadoop/share/hadoop/hdfs/lib/*:$PWD/mr-framework/hadoop/share/hadoop/tools/lib/*:/usr/hdp/${hdp.version}/hadoop/lib/hadoop-lzo-0.6.0.${hdp.version}.jar:/etc/hadoop/conf/secure:/usr/hdp/current/ext/hadoop/*:/opt/wandisco/fusion/client/lib/*
   ```

   **Save** the MapReduce2 config afterwards.

4. Adjust the following property in Tez.

   **Tez -> Configs -> Filter for "tez.cluster.additional.classpath.prefix"**

   Append the following onto the very end of the property:

   `:/opt/wandisco/fusion/client/lib/*`

   The final value should look similar to below:

   ```json
   /usr/hdp/${hdp.version}/hadoop/lib/hadoop-lzo-0.6.0.${hdp.version}.jar:/etc/hadoop/conf/secure:/opt/wandisco/fusion/client/lib/*
   ```

   **Save** the Tez config afterwards.

5. Add the following entry to the Slider config.

   **Slider -> Configs -> Advanced slider-env: slider-env template**

   Add the following new line to the bottom of the text window:

   ```json
   export SLIDER_CLASSPATH_EXTRA=$SLIDER_CLASSPATH_EXTRA:`for i in /opt/wandisco/fusion/client/lib/*;do echo -n "$i:" ; done`
   ```

   **Save** the Slider config afterwards.

### Activate Live Hive Proxy on the HDP cluster

1. On the Ambari UI, adjust two properties in the Hive config so that it references the Live Hive Proxy.

   **Hive -> Configs -> Filter for "hive.metastore.uris"**

   Adjust the value of `hive.metastore.uris` in the following sub-sections:

   _General_

   ```json
   thrift://fusion-livehive-proxy-hdp:9083
   ```

   _Advanced webhcat-site_

   ```json
   hive.metastore.local=false,hive.metastore.uris=thrift://fusion-livehive-proxy-hdp:9083,hive.metastore.sasl.enabled=false
   ```

2. Adjust a property so that the Live Hive Proxy will handle both data and metadata changes.

   **Hive -> Configs -> Filter for "hive-env template"**

   Add the following three new lines to the bottom of the text window.

   ```json
   if [ "$SERVICE" = "metastore" ]; then
     export FUSION_REPLICATION_DISABLED=true # Set by WANdisco for use with live hive proxy
   fi
   ```

3. **Save** the Hive config after making these adjustments.

   _Select to **Proceed anyway** if prompted by Ambari due to any warnings._

### Restart required services

1. On the Ambari UI, select the option to **Restart All Required** services.

   **Ambari UI -> Services -> Select the "..." for the drop-down list -> Restart All Required -> Confirm Restart All**

2. Select to **Restart All** for the Spark2 service as well.

   **Spark2 -> Actions -> Restart All -> Confirm Restart All**

   You do not have to wait for the previous operation to finish to initiate this. The Spark2 restart job will be queued and started automatically once the Restart All Required has completed.

3. After all the HDP cluster services have finished restarting, return to the docker host terminal and restart the Fusion containers:

   `docker-compose restart`

### Setup Databricks on ADLS Gen2 zone

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

   `curl -v -H "Authorization: Bearer <bearer_token>"  -F contents=@/opt/wandisco/fusion/plugins/databricks/live-analytics-databricks-etl-5.0.0.0.jar -F path="/datatransformer.jar" https://<databricks_service_address>/api/2.0/dbfs/put`

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

   Once complete, exit the container:

   `exit`

5. Log into the Azure portal and Launch Workspace for your Databricks cluster.

6. On the left-hand panel, select **Clusters** and then select your interactive cluster.

7. Click on the **Libraries** tab, and select the option to **Install New**.

8. Select the following options for the Install Library prompt:

   * Library Source = `DBFS`

   * Library Type = `Jar`

   * File Path = `dbfs:/datatransformer.jar`

9. Select **Install** once the details are entered. Wait for the **Status** of the jar to display as **Installed** before continuing.

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

   * Description = `testing` _- this field is optional_

   Click **Create rule** once complete.

5. Both rules should now display on the **Replication** tab in the Fusion UI.

### Test replication

Prior to performing these tasks, the Databricks cluster must be in a **running** state. Please access the Azure portal and check the status of the cluster. If it is not running, select to start the cluster and wait until it is **running** before continuing.

1. On the docker host, log into a HDP cluster node.

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

   Please note that running an 'insert into table' for the first time on the HDP cluster will take a longer period of time than normal (i.e. up to 5 minutes). Further jobs will complete at a much faster rate.

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
