---
layout: post
title: Ubuntu 12.04 vim 无系统剪切板
tags: [vim, 系统剪切板, 12.04]
---

#Ubuntu 12.04 vim 无系统剪切板
突然间发现我的vim系统剪切板不能用了，  
之前还写过一篇[日志][vim-paste]介绍剪切板来着呢，  
执行`:reg`确实没了`"+`系统剪切板，那就修复之：

{% highlight bash %}
sudo apt-get install vim-gnome
{% endhighlight %}

默认情况下命令行下的vim是没有剪切板的，
这个也很好理解，命令行里根本就没有`Ctrl+C`,`Ctrl+V`的操作。


[参考](http://www.liurongxing.com/ubuntu-system-vim-to-use-the-system-clipboard.html)

[vim-paste]: /2014/02/16/vim-paste/
