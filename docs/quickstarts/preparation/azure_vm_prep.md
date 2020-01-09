---
id: azure_vm_prep
title: Preparing an Azure Linux VM for a Fusion installation
sidebar_label: Azure VM preparation
---

_THIS GUIDE IS WORK IN PROGRESS, PLEASE DO NOT FOLLOW ANYTHING HERE UNTIL THIS WARNING IS REMOVED_

This quickstart helps you prepare an Azure Linux VM suitable for a Fusion installation using docker. It walks you through:

* Disabling firewall and selinux/apparmor for the Fusion installation to complete.
* Installation of utilities.
* Verification of available storage for docker images.

## Prerequisites

[//]: <Issues with running out of disk space because of docker images filling up the root partition (see DAP-134). As such, we suggest adding a data disk for storage.>

* Azure VM created and started. See the [Azure VM creation](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/preparation/azure_vm_creation) guide for steps to create an Azure VM.
  * CentOS-based 7.7 (or higher) or UbuntuLTS 18.04. Instructions are provided for these releases.
  * A minimum of 128GB storage. The [Azure VM creation](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/preparation/azure_vm_creation) guide includes this by default.
  * Root access on server (this is normally available by default). All the commands given here should be run as **root** user.
* Access to your company's VPN or similar if required.

## Preparation

### Disable firewall and selinux/apparmor

To install Fusion, firewall and selinux must be disabled.

1. Log in to the VM via a terminal session and run the commands below to stop and disable iptables.

   _RHEL/CentOS_

   `systemctl stop firewalld`

   `systemctl disable firewalld`

   _Ubuntu_

   **Not required on Ubuntu.**

2. Disable selinux/apparmor.

   _RHEL/CentOS_

   In `/etc/sysconfig/selinux`, `SELINUX=disabled`.

   _Ubuntu_

   `systemctl stop apparmor`

   `systemctl disable apparmor`

3. The server will now need to be rebooted.

### Install utilities

1. Log in to the VM via a terminal session again.

[//]: <JDK dependency for the 'wandocker.run' script>

2. Run the command below to install Java 1.8 and Git.

   _RHEL/CentOS_

   `yum install -y java-1.8.0-openjdk.x86_64 git`

   _Ubuntu_

   `apt-get update && apt install -y openjdk-8-jdk git`

3. Run the commands below to install [Docker](https://docs.docker.com/install/) (v19.03.5 or higher).

   _RHEL/CentOS_

   `yum install -y yum-utils device-mapper-persistent-data lvm2`

   `yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo`

   `yum install -y docker-ce docker-ce-cli containerd.io`

   _Ubuntu_

   `apt install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common`

   `curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -`

   `add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"`

   `apt-get update && apt install -y docker-ce docker-ce-cli containerd.io`

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
   docker-compose version 1.25.0, build 0a186604
   ```

### Verify storage for docker images

Verify that there is a minimum of 100GB disk space available in the `/var/lib/docker` directory.

   `df -h /var/lib/docker`

   _Example output_

   ```bash
   Filesystem      Size  Used Avail Use% Mounted on
   /dev/sda1       124G  2.1G  122G   2% /
   ```
