---
layout: post
title: Ubuntu 12.04 创建wifi分享
---
如果你曾想过要用12.04建立个wifi分享的话，  
你应该了解到，  
直接通过右上角的网络管理新建的ad-hoc很多安卓设备没法识别。  
所以你需要一款名为[ap-hotspot](http://www.ubuntuupdates.org/package/webupd8/raring/main/base/ap-hotspot)的软件协助  
1.安装：  
{% highlight bash %}
sudo add-apt-repository ppa:nilarimogard/webupd8  
sudo apt-get update  
sudo apt-get install ap-hotspot  
{% endhighlight %}
但是由于Ubuntu 14.04的bug(Linux Mint 17 好像也有这个bug)，需要降级`hostapd`,
首先卸载有bug的`hostapd`:
{% highlight bash %}
sudo apt-get remove hostapd
{% endhighlight %}
然后安装低版本的`hostapd`:
{% highlight bash %}
#64位
cd /tmp && wget http://archive.ubuntu.com/ubuntu/pool/universe/w/wpa/hostapd_1.0-3ubuntu2.1_amd64.deb && sudo dpkg -i hostapd*.deb && sudo apt-mark hold hostapd
{% endhighlight %}
{% highlight bash %}
#32位
cd /tmp && wget http://archive.ubuntu.com/ubuntu/pool/universe/w/wpa/hostapd_1.0-3ubuntu2.1_i386.deb && sudo dpkg -i hostapd*.deb && sudo apt-mark hold hostapd
{% endhighlight %}
不过我在Mint上卸载`hostapd`的时候系统自动把`ap-hotspot`也给卸了，再安装一下就好了。

2.使用
{% highlight bash %}
ap-hotspot configure    # 配置wifi
ap-hotspot start        # 启动wifi
sudo ap-hotspot stop    # 关闭wifi
sudo ap-hotspot debug   # 调试
sudo ap-hotspot restart # 重启
{% endhighlight %}

也许是人品差了一点点，  安装配置启动完毕后，  虽然搜到了wifi但是却连接不上，  
执行`sudo ap-hotspot debug`时有如下错误信息：  

`dnsmasq: failed to create listening socket for 127.0.0.1: Address already in use ...fail!` 

解决方案：  
* 编辑 `/etc/NetworkManager/NetworkManager.conf `  
* 注释掉：`dns=dnsmasq`  （前面加#号注释）  
* 重启network-manager(`sudo restart network-manager`)  
* 编辑 `/etc/dnsmasq.conf`  
* 添加： `listen-address=127.0.0.1`  
* 重启dnsmasq (`sudo /etc/init.d/dnsmasq restart`)  
* 可能会报错：`dnsmasq: unknown interface wlan0`但是好像也没啥影响。  

##### **参考**  
[ap-hotspot安装配置](http://unix.stackexchange.com/questions/80042/ubuntu-12-04-hotspot-wifi-network-not-visible-to-android-4-1-2)  
[启动ad-hotspot错误解决方案](http://askubuntu.com/questions/191226/dnsmasq-failed-to-create-listening-socket-for-port-53-address-already-in-use)  
[Create Wifi Hotspot in Ubuntu Laptop For Android Phones](http://ubuntuhandbook.org/index.php/2014/02/wifi-hotspot-ubuntu-laptop-android/)
