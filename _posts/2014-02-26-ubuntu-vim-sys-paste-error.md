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
sudo apt-get install vim-scripts vim-gnome vim-gtk
{% endhighlight %}

[参考](http://www.liurongxing.com/ubuntu-system-vim-to-use-the-system-clipboard.html)

[vim-paste]: http://tunzao.github.io/2014/02/16/vim-paste/
