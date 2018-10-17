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

1. Install NodeJS 10
2. Clone the Repo
```sh
$ git clone https://github.com/tuxedocomputers/tuxedo-fan-control
```
3. Build the Project
```sh
npm run build
```


### Create Packages (deb, snap, AppImage, rpm, tar.gz)
```sh
npm run build && npm run pack
```

or for productive environment

```sh
npm run build:prod && npm run pack:prod
```
