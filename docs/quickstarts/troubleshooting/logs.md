---
id: logs
title: Logs
sidebar_label: Logs
---

## Logs

The log files for Fusion are split into the various components that make up a Fusion installation. For any one zone, this would include the following:

* Fusion Server
* Fusion IHC Server
* Fusion UI Server

For Hadoop zones (i.e. CDH or HDP), an additional component will be included:

* Fusion NameNode Proxy

There is also one component that is not linked to a specific zone:

* Fusion OneUI

All of these components are split into their specific containers, as shown below from an example output of the `docker ps` command:

```json
CONTAINER ID        IMAGE                                                   COMMAND                  CREATED             STATUS              PORTS                                                                              NAMES
c55861163580        wandisco/fusion-ui-server-cdh-6.2.0:2.14.2.1-3594       "/usr/bin/entrypoint…"   21 hours ago        Up 52 minutes       0.0.0.0:8083->8083/tcp, 0.0.0.0:8443->8443/tcp                                     fusion-docker-compose_fusion-ui-server-cdh_1
6df49aab8679        wandisco/fusion-ihc-server-cdh-6.2.0:2.14.2.1-3594      "/usr/bin/entrypoint…"   21 hours ago        Up 52 minutes       0.0.0.0:7000->7000/tcp, 0.0.0.0:9001->9001/tcp                                     fusion-docker-compose_fusion-ihc-server-cdh_1
8383f3ead7b5        wandisco/fusion-nn-proxy-cdh-6.2.0:4.0.0.6-3594         "/usr/bin/entrypoint…"   21 hours ago        Up 52 minutes       0.0.0.0:8890->8890/tcp                                                             fusion-docker-compose_fusion-nn-proxy-cdh_1
62f5f31e5933        wandisco/fusion-ihc-server-s3-asf-2.8.0:2.14.2.1-3594   "/usr/bin/entrypoint…"   21 hours ago        Up 52 minutes       0.0.0.0:7500-7501->7500-7501/tcp, 0.0.0.0:9501->9501/tcp                           fusion-docker-compose_fusion-ihc-server-s3_1
e61981d914d5        wandisco/fusion-ui-server-s3-asf-2.8.0:2.14.2.1-3594    "/usr/bin/entrypoint…"   21 hours ago        Up 52 minutes       0.0.0.0:8583->8583/tcp, 0.0.0.0:8943->8943/tcp                                     fusion-docker-compose_fusion-ui-server-s3_1
293aa53b4032        wandisco/fusion-server-s3-asf-2.8.0:2.14.2.1-3594       "/usr/bin/entrypoint…"   21 hours ago        Up 52 minutes       0.0.0.0:8523-8524->8523-8524/tcp, 0.0.0.0:8582->8582/tcp, 0.0.0.0:8584->8584/tcp   fusion-docker-compose_fusion-server-s3_1
9ecd39131497        wandisco/fusion-oneui:1.0.0                             "/bin/sh -c '/etc/al…"   21 hours ago        Up 52 minutes       0.0.0.0:8081->8080/tcp                                                             fusion-docker-compose_fusion-oneui-server_1
38c8258e709f        wandisco/fusion-server-cdh-6.2.0:2.14.2.1-3594          "/usr/bin/entrypoint…"   21 hours ago        Up 52 minutes       0.0.0.0:8023-8024->8023-8024/tcp, 0.0.0.0:8082->8082/tcp, 0.0.0.0:8084->8084/tcp   fusion-docker-compose_fusion-server-cdh_1
f711d5adc3bb        ubuntu                                                  "tail -f /dev/null"      21 hours ago        Up 52 minutes                                                                                          fusion-docker-compose_debug_1
```

You can log into a container and view the logs for a specific component in a zone. For example, if you are wanting to view the Fusion Server's logs for the CDH zone, you would run the following command:

`docker exec -u root -it 38c8258e709f /bin/bash`

Once inside, you can access the log directory for the Fusion Server.

`cd /var/log/fusion/server`

### Log locations

For each component, there is a different log directory. The list below highlights the log directory for each component in their individual containers:

_Fusion Server:_
`/var/log/fusion/server/`

_Fusion IHC Server:_
`/var/log/fusion/ihc/server/`

_Fusion UI Server:_
`/var/log/fusion/ui/`

_Fusion NameNode Proxy:_
`/var/log/fusion/plugins/live-nn/`

_Fusion OneUI:_
`/var/log/fusion/oneui/`

### Debug container

There is an additional debug container that is started alongside the rest of the Fusion containers (example below).

```json
CONTAINER ID        IMAGE                                                   COMMAND                  CREATED             STATUS              PORTS                                                                              NAMES
f711d5adc3bb        ubuntu                                                  "tail -f /dev/null"      21 hours ago        Up 52 minutes                                                                                          fusion-docker-compose_debug_1
```

This container holds all the Fusion log files for each component. You can log into this container to view any log file of the Fusion component in either zone.

`docker exec -u root -it f711d5adc3bb /bin/bash`

You will be logged inside of the `/debug` directory by default, which contains directories that reference each Fusion component in their specific zone:

 _Example of a CDH to S3 environment_
 ```text
 root@f711d5adc3bb:/debug# ls -l
 drwxr-xr-x 7 1000 1000 70 Nov 13 18:28 ihc-server-cdh
 drwxr-xr-x 7 1000 1000 70 Nov 13 18:28 ihc-server-s3
 drwxr-xr-x 7 1000 1000 70 Nov 13 18:28 npx-cdh
 drwxr-xr-x 3 root root 19 Nov 13 18:28 oneui-server
 drwxr-xr-x 7 1000 1000 70 Nov 13 18:28 server-cdh
 drwxr-xr-x 7 1000 1000 70 Nov 13 18:28 server-s3
 drwxr-xr-x 7 1000 1000 70 Nov 13 18:28 ui-server-cdh
 drwxr-xr-x 7 1000 1000 70 Nov 13 18:28 ui-server-s3
 ```

The log locations for each component are slightly different to that of the individual containers.

_Fusion Server:_
`/debug/server-<zone_name>/server/`

_Fusion IHC Server:_
`/debug/ihc-server-<zone_name>/ihc/server/`

_Fusion UI Server:_
`/debug/ui-server-<zone_name>/ui/`

_Fusion NameNode Proxy:_
`/debug/npx-<zone_name>/plugins/live-nn/`

_Fusion OneUI:_
`/debug/oneui-server/oneui/`

### Viewing log files

#### Individual containers

If logged into a container for a specified component, you can view a log file using the standard `vi`, `less` or `more` commands.

_Example for the Fusion Server container_

`vi /var/log/fusion/server/fusion-server.log`

#### Debug container

If logged into the debug container, you can only view a log file using the `more` command.

_Example of `more` command for the Fusion Server log in debug container_

`more /debug/server-<zone_name>/server/fusion-server.log`

The `vim` and `less` commands are not available by default, however, they can be installed using the following method:

1. Log into the debug container.

   `docker ps` _- obtain debug container ID_

   `docker exec -u root -it <DEBUG_CONTAINER_ID> /bin/bash`

2. Install the `vi` and `less` packages using the Ubuntu package manager.

   `apt-get update`

   `apt install vim less`

You can now view the log files using any of the `vim`, `less` or `more` commands.

_Example for `vim` for the Fusion Server log in debug container_

`vim /debug/server-<zone_name>/server/fusion-server.log`

### Obtaining log files

You can copy log files to your Docker host from the containers using a `docker cp` command.

_Example to copy Fusion Server log from debug container to docker host_

`docker ps` _- obtain debug container ID_

`docker cp <DEBUG_CONTAINER_ID>:/debug/server-<zone_name>/server/fusion-server.log .`

The command above will copy the file to your current working directory on the docker host. The file can then be transferred to your local machine if desired.
