---
id: hdp_sandbox_lhv_client-adlsg2_lan
title: Hortonworks (HDP) Sandbox to Azure Databricks with LiveAnalytics
sidebar_label: HDP Sandbox to Azure Databricks with LiveAnalytics
---

_THIS GUIDE IS WORK IN PROGRESS, PLEASE DO NOT FOLLOW ANYTHING HERE UNTIL THIS WARNING IS REMOVED_

[//]: <This quickstart is work in progress, and new items are still being added. The development approach is that all known workarounds/configuration steps will be kept in the document until we have fully confirmed their fix (see MTC label). At which point, they will be removed. The same will apply for configuration/installation steps when blueprints for HDP or Fusion have been completed (see DAP-144).>

Use this quickstart if you want to configure Fusion to replicate from a Hortonworks (HDP) Sandbox to an Azure Databricks cluster.

This will involve the use of Live Hive for the HDP cluster, and the Databricks Delta Lake plugin for the Azure Databricks cluster. These two products form the LiveAnalytics solution.

What this guide will cover:

- Installing WANdisco Fusion using the [docker-compose](https://docs.docker.com/compose/) tool.
- Integrating WANdisco Fusion with Azure Databricks.
- Performing a sample data migration.

Please see the [shutdown and start up](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/hdp_sandbox_fusion_stop_start) guide for when you wish to safely shutdown or start back up the installation.

## Prerequisites

[//]: <We are still working out the minimum VM requirements, at the moment, we are working with Standard D8 v3.>

To complete this quickstart, you will need:

* Azure VM created and started. See the [Azure VM creation](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/preparation/azure_vm_creation) guide for steps to create an Azure VM.
  * Minimum size VM recommendation = **Standard D8 v3 (8 vcpus, 32 GiB memory).**
  * CentOS-based 7.7 (or higher) or UbuntuLTS 18.04. Instructions are provided for these releases.
  * A minimum of 128GB storage. The [Azure VM creation](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/preparation/azure_vm_creation) guide includes this by default.
  * Root access on server (this is normally available by default).
* Azure VM prepared for Fusion installation, see [Azure VM preparation](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/preparation/azure_vm_prep) guide for all required steps.

## Installation

Please log into your VM prior to starting these steps. All the commands within this guidance should be run as **root** user.

### Setup Fusion

[//]: <Still not determined as to where the users will pull the fusion-docker-compose repository. We will need to provide pre-baked config files so that the only entries required will be the ADLS Gen2 details.>

1. (**TBC - branch name**) Clone the Fusion docker repository to your Azure VM instance:

   `git clone https://github.com/WANdisco/fusion-docker-compose.git`

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

### Startup Fusion

After all the prompts have been completed, you will be able to start the containers.

1. Ensure that Docker is started:

   `systemctl status docker`

   If not, start the Docker service:

   `systemctl start docker`

2. Start the Fusion containers with:

   `docker-compose up -d`

## Configuration

### Live Hive configuration and activation

1. Log into the Fusion UI for the HDP zone, and activate the Live Hive plugin.

   `http://<docker_IP_address>:8083`

   Username: `admin`
   Password: `admin`

   Proceed to the Settings tab and select the *Live Hive: Plugin Activation* option on the left-hand panel.

   Click on the *Activate* option. Wait for the **Reload this window** message to appear and refresh the page.

### Setup Databricks
[//]: <> (Host live-analytics-databricks-etl-6.0.0.1.jar externally - cuts the steps right down)

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

3. Download Jar file from Repo

   https://github.com/mo-martin/wandisco-documentation/raw/hdp-adls-quickstart-refinements/docs/quickstarts/resources/live-analytics-databricks-etl-6.0.0.1.jar

[//]: <DAP-135 workaround>

4. Log into the Azure portal and Launch Workspace for your Databricks cluster.

5. On the left-hand panel, select **Clusters** and then select your interactive cluster.

6. Click on the **Libraries** tab, and select the option to **Install New**.

7. Select the following options for the Install Library prompt:

   * Library Source = `Upload`

   * Library Type = `Jar`

   * File Path = Find save location of `datatransformer.jar` from step 3.

8. Select **Install** once the details are entered. Wait for the **Status** of the jar to display as **Installed** before continuing.

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

   * Zones = `adls2, sandbox-hdp` _- Leave as default._

   * Priority Zone = `sandbox-hdp` _- Leave as default._

   * Rule Name = `warehouse`

   * Path for adls2 = `/apps/hive/warehouse`

   * Path for hdp = `/apps/hive/warehouse`

   Click **Add** after entering the Rule Name and Paths.

   * Advanced Options: Preserve Origin Block Size = `true` _- click the checkbox to set this to true._

   Click **Create rules (1)** once complete.

4. Create a new Hive rule using the UI with the following properties:

   On the Replication tab, select to **+ Create** a replication rule again.

   * Type = `Hive`

   * Database name = `*`

   * Table name = `*`

   * Description = `Testing` _- this field is optional_

   Click **Create rule** once complete.

5. Both rules should now display on the **Replication** tab in the Fusion UI.

### Test replication

Prior to performing these tasks, the Databricks cluster must be in a **running** state. Please access the Azure portal and check the status of the cluster. If it is not running, select to start the cluster and wait until it is **running** before continuing.

1. On the **Docker host:**

    a. Clone the sample-data Repo

    `git clone https://github.com/pivotalsoftware/pivotal-samples.git /tmp/`

    b. Copy the previously cloned Repo, into the docker_sandbox-hdp_1 container:

    `docker cp /tmp/pivotal-samples/ docker_sandbox-hdp_1:/tmp/`

2. Login to the **docker_sandbox-hdp_1** container and place data into hdfs:

    a. Login to the docker_sandbox-hdp_1 container:

    `docker exec -it docker_sandbox-hdp_1 bash`

    b. Switch to the hdfs user

    `sudo -iu hdfs`

    c. Change directory into the pivotal sample's repo

    `cd /tmp/pivotal-samples/sample-data`

    d. Create directory within hdfs for the sample data

    `hdfs dfs -mkdir -p /retail_demo/customer_addresses_dim/`

    e. Place the sample data into hdfs, so that it can be accessed by Hive

    `hdfs dfs -put customer_addresses_dim.tsv.gz /retail_demo/customer_addresses_dim/`

3. Run beeline and use the `!connect` string to start a Hive session via the Hiveserver2 service.

   `beeline`

   `!connect jdbc:hive2://sandbox-hdp:2181/;serviceDiscoveryMode=zooKeeper;zooKeeperNamespace=hiveserver2`

   The above connection string can also be found on the Ambari UI under **Hive -> Summary -> HIVESERVER2 JDBC URL**.

   When prompted for a username and password, enter the following:

   `Enter username: hdfs`

   `Enter password: ` _- leave blank and press enter._

4. Create a database to use that will match the regex for the Hive replication rule created earlier in the Fusion UI.

   `CREATE DATABASE IF NOT EXISTS retail_demo;`

5. Create a table inside of the database that points to the data previously uploaded.

     ```
     CREATE TABLE retail_demo.customer_addresses_dim_hive
      (
        Customer_Address_ID  bigint,
        Customer_ID          bigint,
        Valid_From_Timestamp timestamp,
        Valid_To_Timestamp   timestamp,
        House_Number         string,
        Street_Name          string,
        Appt_Suite_No        string,
        City                 string,
        State_Code           string,
        Zip_Code             string,
        Zip_Plus_Four        string,
        Country              string,
        Phone_Number         string
      )
        ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
        STORED AS TEXTFILE
        LOCATION '/retail_demo/customer_addresses_dim/';
     ```


6. Create a second database and table that we can migrate the uploaded data into.

    a. Create Database:

    `CREATE DATABASE IF NOT EXISTS databricksdemo;`


    b. Create Table:

        ```
        CREATE TABLE databricksdemo.customer_addresses_dim_hive
         (
            Customer_Address_ID  bigint,
            Customer_ID          bigint,
            Valid_From_Timestamp timestamp,
            Valid_To_Timestamp   timestamp,
            House_Number         string,
            Street_Name          string,
            Appt_Suite_No        string,
            City                 string,
            State_Code           string,
            Zip_Code             string,
            Zip_Plus_Four        string,
            Country              string,
            Phone_Number         string
         ) stored as ORC;
        ```

7. Now insert data into the table above by running the following:

    `insert into databricksdemo.customer_addresses_dim_hive select * from retail_demo.customer_addresses_dim_hive where state_code ='CA';`


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

 8. Verify the above data has been placed correctly by running:
    `select * from databricksdemo.customer_addresses_dim_hive;`


### Setup Databricks Notebook to view Data.

  1. Navigate to your Azure Databricks Home page - The url is dependent on location, however if you are based in west Europe, you can visit https://westeurope.azuredatabricks.net.

  2. Create a Cluster Notebook:

      a. Click Workspace on the left hand side > click the drop down arrow > Create > Notebook > Name: WD-demo Language: SQL Cluster:(Choose cluster made earlier)

  3. You should now see a blank notebook.

      a. Inside the 'Cmd 1' box add the query

      `select * from databricksdemo.customer_addresses_dim_hive;`

      b. Click 'Run Cell' (looks like a play button in the top right of that box)

  4. Wait for the query to return, then select the drop down graph-type and Choose Map

  5. Under the Plot Options > remove all Keys > click and drag 'state_code' from the 'All fields' box, into the 'Keys' box.

  6. Click Apply.

  7. You should now see a plot of USA with colour shading - dependent on the population density.

## Advanced options

* This guide does not currently offer configuration of Fusion to a **Kerberized** HDP cluster.
* This guide does not currently offer configuration of Fusion to a NameNode HA HDP cluster.

Please contact [WANdisco](https://wandisco.com/contact) for further information on Fusion with docker.
