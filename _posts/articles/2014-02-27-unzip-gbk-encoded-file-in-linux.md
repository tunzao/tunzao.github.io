---
layout: post
title: Linux下解压zip中文乱码问题
tags: [zip, linux]
---
遇此问题良久了，就是在该死的Windows上压缩的zip文件，在linux解压中文就乱码了，  
之前只好弱弱地只在Windows下查看，好麻烦。终于忍不住google了一下，如下：

给`unzip`添加`-O CP936`参数，具体参数含义我就不解释了（我也不知道）
懒人啊，还是添加一个alias吧：
{% highlight bash %}
alias unzip_gbk='unzip -O CP936'
{% endhighlight %}

[参考](http://note.ninehills.info/linux-gbk.html)

