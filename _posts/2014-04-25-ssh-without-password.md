---
layout: post
title: SSH无密码登陆
tags: ssh
---
#SSH无密码登陆

这方面的文章网上写的也是异常泛滥了，  
那我为啥还要冗余的写上一篇?  
难不成这篇文章有不同于乌合之众的独特见解。  
如果你真的一不小心本着这个主题来到这篇日志那可就失望大发了。  
仅仅是一篇笔记而已，没有独特见解。


原理就是在本机生成密钥对，然后把公钥上传到目标服务器的目标位置：  
{% highlight bash %} 
ssh-keygen -t rsa   #生成密钥对 
scp ~/.ssh/id_rsa.pub user@remote:~     # 公钥复制到目标服务器 
{% endhighlight %}  
然后登陆远程服务器,把公钥追加到~/.ssh/authorized_keys   
{% highlight bash %} 
cat ~/id_rsa.pub ~/.ssh/authorized_keys 
{% endhighlight %}  
最后删除`id_rsa.pub`,测试吧。  
