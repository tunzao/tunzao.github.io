---
layout: post
title: 查找占用CPU高的Java线程
categories: articles
comments: true
excerpt_separator: <!--more-->
---

由于种种原因导致生产环境的应用CPU占用奇高, 这个时候就需要确定到底是哪些线程占用了较高的CPU, 然后再做针对性的优化,<!--more--> 可以使用jconsole/jvisualvm等工具通过jmx连接到线上环境的jvm查看线程内存信息. 然后由于诸多限制这种方案往往不可行(我猜). 这时就需要借助jvm提供的使用工具来定位问题了.

1. 首先使用`top`找出占用CPU较高的进程ID
![使用top查看占用CPU高的进程](/assets/img/highcpu/high-cpu-top.png)

2. 使用`top -H -p pid`查看该进程里占用CPU较高的线程ID
![查看占用CPU高的线程](/assets/img/highcpu/high-cpu-top-h.png)

3. 把得到的线程ID转成16进制(`echo 'obase=16;thread_id'|bc`)

4. 打印出jvm实例的线程堆栈(`jstack pid`)，在线程堆栈里找出线程ID对应的代码块，开始优化吧!
![查看占用CPU高的堆栈](/assets/img/highcpu/high-cpu-jstack.png)
