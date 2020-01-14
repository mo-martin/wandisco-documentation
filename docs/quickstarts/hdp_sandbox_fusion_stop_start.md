---
id: hdp_sandbox_fusion_stop_start
title: How to safely shutdown and start up a WANdisco Fusion and Hortonworks Sandbox installation
sidebar_label: Stop & Start WANdisco Fusion and HDP Sandbox
---

This guide is for when you want to safely shutdown or start up a WANdisco Fusion and Hortonworks Sandbox installation.

All commands shown are to be run as root user.

## Shutting down

The steps should be carried out prior to shutting down the Docker host itself.

### Shutdown WANdisco Fusion

Follow the steps outlined below to safely shutdown Fusion.

1. Log in to the Docker host via a terminal session.

2. Switch to the fusion-docker-compose directory.

   `cd /path/to/fusion-docker-compose`

3. Stop all Fusion containers.

   `docker-compose stop`

   _Example output_

   ```text
   Stopping fusion_fusion-ihc-server-hdp_1     ... done
   Stopping fusion_sshd-hdp_1                  ... done
   Stopping fusion_fusion-ui-server-hdp_1      ... done
   Stopping fusion_fusion-livehive-proxy-hdp_1 ... done
   Stopping fusion_fusion-nn-proxy-hdp_1       ... done
   Stopping fusion_fusion-ihc-server-adls2_1   ... done
   Stopping fusion_fusion-ui-server-adls2_1    ... done
   Stopping fusion_fusion-server-hdp_1         ... done
   Stopping fusion_fusion-oneui-server_1       ... done
   Stopping fusion_debug_1                     ... done
   Stopping fusion_fusion-server-adls2_1       ... done
   ```

### Shutdown HDP Sandbox

Follow the steps outlined below to safely shutdown the HDP Sandbox.

1. Log in to the Ambari UI, and shutdown all services.

   **Ambari UI -> Services (...) -> Stop All -> CONFIRM STOP**

   Wait until all services have shutdown before continuing.

2. Log in to the Docker host via a terminal session.

3. Change to the 'wandocker' directory.

   `cd /path/to/wandocker`

4. Run the wandocker script to access the main menu.

   `./wandocker.sh -i hdp265_docker.ini`

5. Once in the wandocker main menu, select option `a` to **Toggle Advanced Options**.

6. Select option `8` to **Stop a Container**.

   Type the index number for the `/sandbox-hdp` container, and press enter.

   Wait until the `Container /sandbox-hdp stopped OK` line appears in the Event Log.

7. **Please note that this step is not required if you did not build local HDP repositories**

   Perform the same step above twice more except this time, select the `/repo_cache_host` and `/repo_host` containers (the order does not matter).

   Wait until the `Container /repo_cache_host stopped OK` and `Container /repo_host stopped OK` lines appear in the Event Log before continuing.

8. Press `q` to quit out of the wandocker main menu after completing this.

### Shutdown the Docker host

If desired, you can now shut down the Docker host.

## Starting up

Ensure the Docker host is started before continuing. The WANdisco Fusion containers must be started before the HDP sandbox as it will try to contact the Fusion containers when services are started.

### Starting WANdisco Fusion

Follow the steps outlined below to start up Fusion.

1. Log in to the Docker host via a terminal session.

2. Switch to the fusion-docker-compose directory.

   `cd /path/to/fusion-docker-compose`

3. Verify that the Fusion containers are stopped.

   `docker-compose ps`

   All containers should have an `Exit` state.

4. Start all Fusion containers.

   `docker-compose start`

   _Example output_

   ```text
   Starting fusion_fusion-ihc-server-hdp_1     ... done
   Starting fusion_sshd-hdp_1                  ... done
   Starting fusion_fusion-ui-server-hdp_1      ... done
   Starting fusion_fusion-livehive-proxy-hdp_1 ... done
   Starting fusion_fusion-nn-proxy-hdp_1       ... done
   Starting fusion_fusion-ihc-server-adls2_1   ... done
   Starting fusion_fusion-ui-server-adls2_1    ... done
   Starting fusion_fusion-server-hdp_1         ... done
   Starting fusion_fusion-oneui-server_1       ... done
   Starting fusion_debug_1                     ... done
   Starting fusion_fusion-server-adls2_1       ... done
   ```

### Starting HDP Sandbox

1. Log in to the Docker host via a terminal session.

2. Change to the 'wandocker' directory.

   `cd /path/to/wandocker`

3. Run the wandocker script to access the main menu.

   `./wandocker.sh -i hdp265_docker.ini`

4. Once in the wandocker main menu, select option `a` to **Toggle Advanced Options**.

5. Select option `7` to **Start a Container**.

6. **Please note that this step is not required if you did not build local HDP repositories**

   Type the index number for the `/repo_host` container and press enter.

   Wait until the `Container /repo_host started OK` line appears in the Event Log before continuing.

   Repeat the same step for the `/repo_cache_host` container and wait until the `Container /repo_cache_host started OK` line appears in the Event Log before continuing.

7. Select option `7` to **Start a Container**.

   Type the index number for the `/sandbox-hdp` container, and press enter.

   Wait until the `Container /sandbox-hdp started OK` line appears in the Event Log.

8. Select option `3a` to **Start Manager and agents (after powerdown etc)**.

   The following two lines (amongst others) will appear in the Event Log once the Ambari Server and Ambari Agent has started:

   ```text
   [/usr/sbin/ambari-server, start] on /sandbox-hdp Completed.
   [/usr/sbin/ambari-agent, start] on /sandbox-hdp Completed.
   ```

   Wait until Ambari UI is accessible on `http://<docker_IP_address>:8080` via a web browser before continuing.

9. Log into the Ambari UI and start all services.

   **Ambari UI -> Services (...) -> Start All -> CONFIRM START**

   Wait until all services have started before continuing.

10. Press `q` to quit out of the wandocker main menu after completing this.

## Troubleshooting

### Hiveserver2 down after HDP Sandbox is started

The Hiveserver2 component in the HDP sandbox may be down after starting the cluster. If so, try the following steps to start it back up.

1. On the docker host, change directory to the Fusion docker compose directory and restart the Fusion Server container for the HDP zone.

   `cd /path/to/fusion-docker-compose`

   `docker-compose restart fusion-server-hdp`

   Wait until the container has finished restarting before continuing.

2. Access the Ambari UI, and manually start the Hiveserver2 component.

   **Ambari UI -> Hive -> Summary -> Click on the "HIVESERVER2" written in blue text.**

3. Locate the HiveServer2 in the component list and click the `...` in the Action column. Select to **Start** the component in the drop-down list.
