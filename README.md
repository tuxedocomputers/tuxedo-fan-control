# TuxedoFanControl

# Induction
The TUXEDO Fan Control is a Application and Daemon for controlling the fans of CPU and GPU of your TUXEDO Notebook device.

User Manual: [user_manual.md](./docs/user/user_manual.md)   
Dev Manual: [dev_manual.md](./docs/dev/dev_manual.md)

## Development

### Dependencies
- Node.js (Version >=10)
- gcc
- NVIDIA SMI for Controlling the NVIDIA GPU Fan (Only need at devices with nvidia graphic cards)
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
3. Build the Project:
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
sudo apt install output/build/*.deb
```
