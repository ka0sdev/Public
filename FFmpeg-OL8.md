### How to: Install FFmpeg on Oracle Linux 8

This short guide will teach you how to install FFmpeg on Oracle Linux 8, as by default EPEL repositories are not available on any Linux distribution including **OL8**.

#### Pictures will be added soonish.


### Steps
___

- First we need to install and register the EPEL repositories, which will ultimately allow us to install FFmpeg once we have completed our prerequisites.


#### Install and register EPEL repository by running following in your terminal:
```
sudo dnf install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
```

#### Update Dandified YUM (Package Installer):
```
sudo dnf update
```
Please beware that this process may take quite a while. 

#### Check if EPEL is added to repolist.
```
sudo dnf repolist
```
You should be able to see: *epel* and *epel-modular*. If not, repeat the first step again.

Usually we require Powertools in order to install **FFmpeg**, this is usually shipped along with the EPEL and EPEL-modular repositories, however due to Oracle removing subscription-manager, we do not have Foreman Kello or Satellite access, so we need to work-around this. 

I discovered after digging through every repo available on OL8, that powertools is in fact available, however Oracle decided to call this: **ol8_codebuilder_ready**. This repo is disabled by default, and this is also why we cant get FFmpeg straight away, due to missing dependencies from powertools.

#### Check the state of ol8_codeready_builder:
```
sudo dnf repolist all
```
This will output every single repo available on the system, as well as their current activation state.

#### Enable ol8_codeready_builder:
```
sudo dnf config-manager --set-enabled ol8_codeready_builder
```
For reference you can run *dnf repolist all* again to check that is has been activated.

Now that we have enabled the ol8_codeready_builder we have access to all the dependency tools which is required by FFmpeg.

#### Install FFmpeg
```
sudo dnf install ffmpeg
```
A lot of tools is getting installed along with FFmpeg, so it might take a little while, once its done, you can run: **ffmpeg** (ffmpeg -version) which should now output information about FFmpeg. 

#### Congratulations, you have successfully installed FFmpeg on your Oracle Cloud instance!


