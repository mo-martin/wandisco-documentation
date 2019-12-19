---
id: azure_vm_creation
title: Creating an Azure Linux VM for a Fusion installation
sidebar_label: Azure VM creation
---

_THIS GUIDE IS WORK IN PROGRESS, PLEASE DO NOT FOLLOW ANYTHING HERE UNTIL THIS WARNING IS REMOVED_

Use this quickstart if you want to create an Azure Linux VM that will be suitable for a Fusion installation.

This guide will include:

* Creating an [Azure Linux VM template](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/create-ssh-secured-vm-from-template) script.
* Creating a [cloud-init](https://cloudinit.readthedocs.io/en/latest/topics/examples.html) template to initialise the VM.
* How to use the Azure Linux VM template script.
  * Logging into the VM for the first time.

## Prerequisites

* The [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) setup on your operating system with the ability to run `az login` on your terminal.
* Connectivity from your operating system to Azure (via your company's VPN if required).

###  Note on command line editing

The `vi` command line editor will be used in this lab, please see this [vi cheat sheet](https://ryanstutorials.net/linuxtutorial/cheatsheetvi.php) for guidance on how to use it.

## Creating the Azure VM template

1. Open a terminal session on your system.

2. Create a script that will contain the template options that are required for the VM.

   `vi create_docker_vm.sh`

   Enter insert mode (`i`) and copy & paste the text below into the terminal.

   ```bash
   #!/usr/bin/env bash
   GROUP=''
   RG=''
   VNET=''
   VM_NAME=''
   ADMIN_USERNAME=''
   TYPE=''
   DISK=''
   IMAGE=''

   print_usage() {
     echo "Usage: ./create_docker_vm.sh -g AZ-USER-GROUP -r AZ-RESOURCE-GROUP -v AZ-VNET -n VM-NAME -u VM-USERNAME -t VM-TYPE -d VM-DISK-SIZE (GB) -i OPERATING-SYSTEM"

     echo "Example: ./create_docker_vm.sh -g DEV -r DEV-john.smith1 -v DEV-westeurope-vnet -n johnsmith-docker -u john -t Standard_D8_v3 -d 128 -i UbuntuLTS"
   }
   #Setup of env
   while getopts "g:G:r:R:v:V:n:N:u:U:t:T:d:D:i:I:hH*" opt; do
     case $opt in
       g|G) GROUP="${OPTARG}" ;;
       r|R) RG="${OPTARG}" ;;
       v|V) VNET="${OPTARG}" ;;
       n|N) VM_NAME="${OPTARG}" ;;
       u|U) VM_USERNAME="${OPTARG}" ;;
       t|T) TYPE=${OPTARG} ;;
       d|D) DISK=${OPTARG} ;;
       i|I) IMAGE=${OPTARG} ;;
       h|H) print_usage exit 1;;
       *) print_usage
          exit 1 ;;
     esac
   done

   #VM Characteristics
   SUBNETID=$(az network vnet subnet show -g $GROUP -n default --vnet-name $VNET |grep addressPrefix -a3 |grep -i id | awk '{print $2}' | tr -d [\",])

   echo "Parameters"
   echo "Group: $GROUP"
   echo "Resource Group: $RG"
   echo "VNET: $VNET"
   echo "VM Name: $VM_NAME"
   echo "VM Username: $VM_USERNAME"
   echo "VM Type: $TYPE"
   echo "Disk Size: $DISK GB"
   echo "Image (OS): $IMAGE"
   echo "Subnet ID: $SUBNETID"

   az vm create \
       --resource-group $RG \
       --name $VM_NAME \
       --image $IMAGE \
       --size $TYPE \
       --admin-username $VM_USERNAME \
       --generate-ssh-keys \
       --storage-sku Standard_LRS \
       --os-disk-size-gb $DISK \
       --custom-data cloud-init.txt \
       --subnet $SUBNETID \
       --public-ip-address ""
   ```

3. Exit insert mode (`esc`) and save & quit the file (`:wq`).

## Create the cloud-init template

1. Create a script that will contain initialisation settings for the VM.

   `vi cloud-init.txt`

   Please ensure the text file is named correctly as above, as it is referenced explicitly within the Azure VM template script (`--custom-data`).

   Enter insert mode (`i`) and copy & paste the text below into the terminal.

   ```text
   #cloud-config

   package_update: true

   disk_setup:
       ephemeral0:
           table_type: mbr
           layout: [66, [33, 82]]
           overwrite: True
   fs_setup:
       - device: ephemeral0.1
         filesystem: ext4
       - device: ephemeral0.2
         filesystem: swap
   mounts:
       - ["ephemeral0.1", "/mnt"]
       - ["ephemeral0.2", "none", "swap", "sw", "0", "0"]

   bootcmd:
       - [ sh, -c, 'sudo echo GRUB_CMDLINE_LINUX="cgroup_enable=memory swapaccount=1" >> /etc/default/grub' ]
       - [ sh, -c, 'sudo update-grub' ]
       - [ cloud-init-per, once, mymkfs, mkfs, /dev/vdb ]

   system_info:
       default_user:
           groups: [docker]
   ```

2. Exit insert mode (`esc`) and save & quit the file (`:wq`).

## Use the Azure template script to create the VM

### Define required variables

Collect all required variables before running the script.

|Variable|Flag|Example|Description|
|---|---|---|---|
|Group|`-g`|`GRP`|The [Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-whatis) group to use. **Must already exist**.|
|Resource Group|`-r`|`GRP-my.name1`|The [Azure Resource group](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-overview#resource-groups) to use. **Must already exist**.|
|VNET|`-v`|`GRP-westeurope-vnet`|The [Azure Virtual Network](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview) to use. **Must already exist**.|
|VM Name|`-n`|`docker_host01`|Define the Virtual Machine name in Azure.|
|VM Username|`-u`|`vm_user`|Define the username to access the Virtual Machine with.|
|VM Type|`-t`|`Standard_D8_v3`|Define the Virtual Machine size from the [Azure templates](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/sizes).|
|Disk Size|`-d`|`128`|Define the disk space on the Virtual Machine in GigaBytes (GB).|
|Image (OS)|`-i`|`UbuntuLTS`|Define the Virtual Machine's Operating System from the [Azure images](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/cli-ps-findimage).|

**Further Information**

* [VM Type](https://docs.microsoft.com/en-us/cli/azure/vm?view=azure-cli-latest#az-vm-list-sizes)

You can discover a list of available VM types/sizes by running the following command:

`az vm list-sizes --location <vm_location>`

Variable required = `"name"`.

* [Image (OS)](https://docs.microsoft.com/en-us/cli/azure/vm/image?view=azure-cli-latest#az-vm-image-list)

You can discover a list of available VM images (OS) by running the following command:

`az vm image list [--all] [--location]`

Variable required = `"urnAlias"`.

### Run the script

1. Make the script executable.

   `chmod +x create_docker_vm.sh`

2. Run the script using the variables collected in the previous sub-section.

   `./create_docker_vm.sh -g GRP -r GRP-my.name1 -v GRP-westeurope-vnet -n docker_host01 -u vm_user -t Standard_D8_v3 -d 100 -i UbuntuLTS`

   _Example output_

   ```text
   Parameters
   Group: GRP
   Resource Group: GRP-my.name1
   VNET: GRP-westeurope-vnet
   VM Name: docker_host01
   VM Username: vm_user
   VM Type: Standard_D8_v3
   Disk Size: 128 GB
   Image (OS): UbuntuLTS
   Subnet ID: /subscriptions/3842fefa-7697-4e7d-b051-a5a3ae601030/resourceGroups/GRP/providers/Microsoft.Network/virtualNetworks/GRP-westeurope-vnet/subnets/default
   {
     "fqdns": "",
     "id": "/subscriptions/3842fefa-7697-4e7d-b051-a5a3ae601030/resourceGroups/GRP-my.name1/providers/Microsoft.Compute/virtualMachines/docker_host01",
     "location": "westeurope",
     "macAddress": "00-0D-3A-3A-9D-52",
     "powerState": "VM running",
     "privateIpAddress": "172.10.1.10",
     "publicIpAddress": "",
     "resourceGroup": "GRP-my.name1",
     "zones": ""
   }
   ```

### Log into the VM

Log into the Azure VM after it is has finished deployment.

_Example_

`ssh vm_user@172.10.1.10`

## Next steps

To prepare your VM for a Fusion installation, see the [Azure VM preparation](https://wandisco.github.io/wandisco-documentation/docs/quickstarts/preparation/azure_vm_prep) guide.
