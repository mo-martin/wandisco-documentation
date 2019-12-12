---
id: azure_vm_prep
title: Preparing an Azure Linux VM for Fusion installation
sidebar_label: Azure VM preparation
---

_THIS GUIDE IS WORK IN PROGRESS, PLEASE DO NOT FOLLOW ANYTHING HERE UNTIL THIS WARNING IS REMOVED_

Use this quickstart if you want to prepare an Azure Linux VM for a Fusion installation using docker.

This guide will include:

* Disabling firewall and selinux for the Fusion installation to complete.
* Installation of utilities.
* Verification of available storage for docker images.

## Prerequisites

[//]: <Issues with running out of disk space because of docker images filling up the root partition (see DAP-134). As such, we suggest adding a data disk for storage.>

* Azure VM created and started. See the [Azure VM creation](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/preparation/azure_vm_creation) guide for steps to create an Azure VM.
  * Running CentOS-based 7.7 or higher (instructions were tested on this release).
  * A minimum of 100GB storage available.
  * Root access on server (this is normally available by default).

###  Note on command line editing

The `vi` command line editor will be used in this lab, please see this [vi cheat sheet](https://ryanstutorials.net/linuxtutorial/cheatsheetvi.php) for guidance on how to use it.

## Preparation

All the commands within this guidance should be run as **root** user. To switch to this user, type `sudo -i` in the command line when logged in as the default Azure user (this will have been set during creation of the VM).

### Disable firewall and selinux

For the purposes of the Fusion installation, firewall and selinux will be disabled.

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

4. The server will now need to be rebooted, run the command below to do this.

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

### Verify storage for docker images

The steps in this section can only be performed if docker is installed and the `/var` partition was created as per the prerequisites.

1. Verify that there is a minimum of 100GB disk space available in the `/var/lib/docker` directory.

   `df -h /var/lib/docker`

   _Example output_

   ```bash
   Filesystem                 Size  Used Avail Use% Mounted on
   overlay                    128G   18G  118G   4% /
   ```
