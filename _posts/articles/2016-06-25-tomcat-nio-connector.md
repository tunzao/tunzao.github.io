---
layout: post
title: Tomcat NIO Connector
tags: [tomcat]
categories: articles
comments: true
excerpt_separator: <!--more-->
---

Tomcat服务请求量巨大时connector线程数剧增。 Tomcat默认的connector是阻塞模式的(即BIO)， 每次请求都需要一个单独线程处理，另外对于`keep-alive`的HTTP请求，<!--more--> BIO的connector在完成一次请求后继续等待下一次请求， 如果已完成的请求没有设置`Connection: close`并且没有关闭连接， 这个connector线程就会等待`keep-alive`设置的超时时间，然后回到线程池，性能非常低（既然Tomcat提供了更高效的connector为什么还要把它设置成默认呢？即便是Tomcat7里也是如此）。为此Tomcat还提供了NIO的connector，基于 Java 的NIO特性实现一个线程处理多个连接的功能，这样在大量请求的时候就减缓了线程的上涨速度。另外在处理`keep-alive`的请求时，每当一个connector线程处理完请求后立即被放回线程池，避免了不必要的等待时间(`keep-alive`)。

启用NIO的方式是修改Tomcat的`server.xml`配置文件，把connector的protocol改为NIO：
{% highlight xml %}
<Connector connectionTimeout="20000" maxThreads="1000" port="8080"
protocol="org.apache.coyote.http11.Http11NioProtocol" redirectPort="8443"/>
{% endhighlight %}

Connector默认配置成HTTP/1.1的原因:
即便是配置成BIO，connector也不一定是BIO的，如果操作系统环境变量里配置了Tomcat native lib, Tomcat就会使用ARP connector。ARP使用操作系统的本地接口，性能和伸缩性上都会比使用Java的接口要好。

参考：

[Understanding the Tomcat NIO Connector and How to Configure It](https://dzone.com/articles/understanding-tomcat-nio)

[What is the difference between Tomcat's BIO Connector and NIO Connector?](http://stackoverflow.com/questions/11032739/what-is-the-difference-between-tomcats-bio-connector-and-nio-connector)

[Apache Tomcat Configuration Reference - The HTTP Connector](https://tomcat.apache.org/tomcat-6.0-doc/config/http.html)

[Configuring an HTTP connector](http://publib.boulder.ibm.com/wasce/V2.1.0/en/http-connector.html)
