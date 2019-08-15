---
layout: post 
title: ProxyJump
tags: [ssh]
categories: articles
comments: true
---

为了安全起见，线上机器一般不会允许用户通过ssh直接登录，而是需要通过堡垒机（跳板机）跳转到目标线上机器，这样方便对权限控制的管理和访问操作的审计。不知道公司用的是哪款堡垒机产品，选择目标机器的过程异常繁琐。查看`ssh`的手册（manual）看到了`-J`选项，可以通过该选项指定ProxyJump然后直接登录到目标机器，命令如下:

{% highlight shell %}

ssh -J user@jump.tunzao.me:80 user2@a.tunzao.me

{% endhighlight %}

不过要scp文件到目标机器上就有点困难了（可以通过`-o`选项指定ssh_option，但是还没弄明白怎么指定），而且每次登录都输这么长一串字符串实在是难以忍受，减少敲击次数的一个方案是`alias`，另一个方案是编辑`~/.ssh/config`文件配置ProxyJump，指定某些机器通过堡垒机登录，格式如下：

{% highlight config %}
### 堡垒机
Host jump
  HostName jump.tunzao.me
  Port 80
  User user

### 目标机器，通过堡垒机登录
Host a
  HostName a.tunzao.me
  ProxyJump  jump
{% endhighlight %}

这样就能通过 `ssh user2@a` 登录 `a.tunzao.me` 了，同时也能通过 `scp afile.txt user2@a:~` 拷贝文件到 `a.tunzao.me` 上。Host指令后的 `jump` 同时可以用作ssh的别名，如果要使用用户 `user` 登录到 `jump.tunzao.me` 直接执行 `ssh jump` 即可。

参考:

[SSH jump host](https://wiki.gentoo.org/wiki/SSH_jump_host)

[OpenSSH/Cookbook/Proxies and Jump Hosts](https://en.wikibooks.org/wiki/OpenSSH/Cookbook/Proxies_and_Jump_Hosts#Passing_Through_One_or_More_Gateways_Using_ProxyJump)
