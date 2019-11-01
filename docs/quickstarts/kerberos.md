---
id: kerberos
title: Kerberos integration with Fusion
sidebar_label: Kerberos integration with Fusion
---

_THIS GUIDE IS WORK IN PROGRESS, PLEASE DO NOT FOLLOW ANYTHING HERE UNTIL THIS WARNING IS REMOVED_

**This guide should only be followed if you have already completed one of the quickstarts (e.g. [Hortonworks (HDP) to ADLS Gen2](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/hdp-adlsg2)).**

If Kerberos authentication is enabled on a cluster, you will need to follow the guidance below to enable Fusion to function correctly.

## Limitations

* The Kerberos principal to be used with Fusion must be headless, which means it cannot be mapped to a hostname.

  _Example of a headless principal:_ `fusion@REALM.COM`

  _Example of a service/host principal:_ `fusion/hostname@REALM.COM`

  We are working to include an option for a service/host principal as soon as possible.

## Prerequisites

* Root access to the Kerberos KDC or cluster manager.
* The Kerberos keytab and principal to be used with Fusion has already been created.
* Appropriate [auth_to_local](https://web.mit.edu/kerberos/krb5-latest/doc/admin/conf_files/krb5_conf.html#realms) rule set up for the principal to be used with Fusion. This must align to a superuser (e.g. `hdfs`).

  _Example_

  `RULE:[1:$1@$0](fusion@REALM.COM)s/.*/hdfs/`

* Appropriate proxyuser rules must exist in the HDFS config (`core-site.xml`) for the Fusion user. In the example below, the Fusion user is `hdfs`:

  _Example_

  `hadooop.proxyuser.hdfs.groups=*`

  `hadooop.proxyuser.hdfs.hosts=*`

## Guidance

1. Transfer the keytab and `krb5.conf` to the Fusion docker host from the Kerberos KDC or a node that contains the required files. This can be done by copying the files to your local machine, and then copying them to the Fusion docker host.

   _Example for local transfer_

   Open a terminal session and download the required files from the KDC/node via SCP to your local machine.

   `scp $HOSTNAME:/etc/krb5.conf .`

   `scp $HOSTNAME:/etc/security/keytabs/fusion.keytab .`

   Once obtained locally, transfer the files to the Fusion docker host.

   `scp krb5.conf $DOCKER_HOST:~`

   `scp fusion.keytab $DOCKER_HOST:~`

2. Obtain the HDFS client config from the cluster manager.

   Cluster Manager UI -> HDFS -> Actions -> Download Client Configs/Configuration

3. Transfer the Client config to the Fusion docker host.

   `scp HDFS_CLIENT-configs.tar.gz $DOCKER_HOST:~`

4. Log into the Fusion docker host, and transfer the Kerberos files to the docker container.

   Firstly, obtain a container ID for one of the required zone containers (e.g `hdp` or `cdh`). The files will be transferred to persistent storage directory that will be shared amongst all containers for the specified zone (in this example, it will be `/etc/hadoop`).

   `docker ps`
   *- Obtain ID from a container in the required zone.*

   Transfer the `krb5.conf` and keytab to the container.

   `docker cp krb5.conf $CONTAINER_ID:/etc/hadoop/krb5.conf`
   `docker cp fusion.keytab $CONTAINER_ID:/etc/hadoop/fusion.keytab`

5. Decompress the HDFS Client config and transfer the relevant files to the docker container.

   `tar -xf HDFS_CLIENT-configs.tar.gz`

   `docker cp core-site.xml $CONTAINER_ID:/etc/hadoop/conf/core-site.xml`

   `docker cp hdfs-site.xml $CONTAINER_ID:/etc/hadoop/conf/hdfs-site.xml`

6. Log into the docker container as **root**, and add additional properties to the `core-site.xml` file.

   `docker exec -it -u root $CONTAINER_ID /bin/bash`

   `vi /etc/hadoop/conf/core-site.xml`

   First, add the following properties as they are displayed below:

   ```json
       <property>
         <name>fusion.client.ssl.enabled</name>
         <value>false</value>
       </property>

       <property>
         <name>fusion.handshakeToken.dir</name>
         <value>/wandisco/handshake_tokens</value>
       </property>

       <property>
         <name>fusion.http.authentication.enabled</name>
         <value>false</value>
       </property>

       <property>
         <name>fusion.http.authorization.enabled</name>
         <value>false</value>
       </property>

       <property>
         <name>fusion.keytab</name>
         <value>/etc/hadoop/fusion.keytab</value>
       </property>

       <property>
         <name>fusion.replicated.dir.exchange</name>
         <value>/wandisco/exchange_dir</value>
       </property>
   ```

   Next, add the following properties below but adjust the values (prefixed with `$`) so that they are correct for your environment:

   ```json
       <property>
        <name>fs.fusion.underlyingFs</name>
        <value>hdfs://$CLUSTER_NAMESERVICE</value>
       </property>

       <property>
         <name>fusion.principal</name>
         <value>$FUSION_PRINCIPAL@REALM.COM</value>
       </property>

       <property>
         <name>fusion.server</name>
         <value>$DOCKER_HOSTNAME:8023</value>
       </property>
   ```

   Once complete, save and quit the file.

7. Exit the docker container to return to the Fusion docker host.

8. Add an additional entry to the Fusion Server and IHC Server configuration in the docker compose file for the zone.

   `cd /path/to/fusion-docker-compose`

   `vi docker-compose.zone-<a/b>.yml`

    ```json
    command:
      - /bin/sh
      - -c
      - /etc/alternatives/jre/bin/java -Djava.net.preferIPv4Stack=true -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=${LOG_DIR} -Xms4g -Xmx16g -DihcDistroLogFile=/var/log/fusion/ihc/server/fusion-ihc-${DISTRO}.log -Dlog4j.configurationFile=/etc/wandisco/fusion/ihc/server/${DISTRO}/log4j2.xml -Dlogback.configurationFile=/etc/wandisco/fusion/ihc/server/${DISTRO}/logback.xml -Djava.security.krb5.conf=/etc/hadoop/krb5.conf com.wandisco.fs.ihc.server.IhcMain /etc/wandisco/fusion/ihc/server/${DISTRO}

    command:
      - /bin/sh
      - -c
      - /etc/alternatives/jre/bin/java -Djava.net.preferIPv4Stack=true -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=${LOG_DIR} -Xms4g -Xmx16g -XX:GCLogFileSize=100M -XX:NumberOfGCLogFiles=10 -XX:+UseGCLogFileRotation -Xloggc:/var/log/fusion/server/gc.log.20190723_144947 -XX:+UseG1GC -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps -XX:+PrintGCDetails -XX:+PrintFlagsFinal -Djava.util.logging.config.file=/etc/wandisco/fusion/server/logger.properties -DFUSION_DUMP_DIR=${LOG_DIR} -Dlog4j.configurationFile=/etc/wandisco/fusion/server/log4j2.xml -Dlogback.configurationFile=/etc/wandisco/fusion/server/logback.xml -Djava.security.krb5.conf=/etc/hadoop/krb5.conf com.wandisco.fs.server.FusionMain /etc/wandisco/fusion/server/application.properties
    ```

9. Restart the container services via docker compose.

   `docker-compose restart`
