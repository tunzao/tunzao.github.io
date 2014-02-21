---
layout: post
title: Ubuntu 12.04 创建wifi分享
---
#Ubuntu 12.04 创建wifi分享
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

