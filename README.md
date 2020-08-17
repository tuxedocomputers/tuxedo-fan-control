# TuxedoFanControl

# Obsolete
### TuxedoFanControl has been replaced by [TUXEDO Control Center](https://github.com/tuxedocomputers/tuxedo-control-center).

# Introduction
The TUXEDO Fan Control is a Application and Daemon for controlling the fans of CPU and GPU of your TUXEDO Notebook device. Do not run the TUXEDO Fan Control on other hardware - we are not giving any warranty.

User Manual: [user_manual.md](./docs/user/user_manual.md)   
Dev Manual: [dev_manual.md](./docs/dev/dev_manual.md)

# Supported Platforms
Currently we support the follow platforms:
- TUXEDO Budgie
- Ubuntu LTS 18.04
- openSUSE Leap 15.1


All other platforms are not tested and we are not giving any warranty.

# Config

## TUXEDO_FAN_TABLE_FILE
It is possible to set a external fantables.json via the environment variable
**TUXEDO_FAN_TABLE_FILE** (use absolute file paths).

**IMPORTANT: Wrong or to low values can overheat the hardware and damage the system!**

Example see: [fantables.json](./src/data/fantables.json)

## Development

### Dependencies
- Node.js (Version >=10)
- gcc
- Xvfb (X Window Virtual Framebuffer)

### Build from source

1. Install NodeJS 10:

On Ubuntu, follow these instructions:

Install curl:

```sh
sudo apt install curl
```

The curl package is most likely installed by default. Then proceed to add the required repository and proceed:

`curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -`

Now, you may proceed with installing nodejs and build-essential packages:

`sudo apt install nodejs autoconf automake build-essential gcc g++ make rpm`


2. Clone the Repo:
```sh
$ git clone https://github.com/tuxedocomputers/tuxedo-fan-control
```

3. Install the Node dependencies
```sh
npm install
```

4. Build the Project:
```sh
npm run build
```

### Create Packages (deb, snap, AppImage, rpm, tar.gz)
```sh
npm run build && npm run pack
```

or for production environment:

```sh
npm run build:prod && npm run pack:prod
```

#### To install the derived packages:

You will find all artifacts under the `output/build` directory.
To install, for instance, on Ubuntu, run:

```sh
sudo dpkg -i output/build/*.deb
```

You can also use `gdebi` provided by `gdebi-core` for the same task:

```sh
sudo apt install gdebi-core
sudo gdebi output/build/*.deb
```
