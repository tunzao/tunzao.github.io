---
layout: post
title: Java的那些日志框架们
tags: [java, logging, slf4j]
categories: articles
comments: true
---

日志在排查线上问题、跟踪线上系统运行情况中发挥着重要作用。在Java应用的开发中，常见的日志框架有[JCL](https://commons.apache.org/proper/commons-logging/)（commons-logging），[slf4j](http://www.slf4j.org/)，[JUL](https://docs.oracle.com/javase/8/docs/api/java/util/logging/Logger.html)（java.util.logging），[log4j](http://logging.apache.org/log4j/1.2/)，[log4j2](https://logging.apache.org/log4j/2.x/)，[logback](http://logback.qos.ch/)等。这些日志框架大致可以分为两类，一类是日志门面（JCL、slf4j），定义日志的抽象接口；另一类是日志实现（JUL，log4j，log4j2，logback），负责真正地处理日志。为什么会有这么多的日志框架呢？从Java日志框架的发展史里大概可以一探究竟。

> Java日志框架的发展历史
>
> * log4j是Java社区最早的日志框架，推出后一度成为Java的事实日志标准，据说Apache曾建议Sun把log4j加入到Java标准库中，但是被Sun拒绝
> * 在Java1.4中，Sun在标准库中推出了自己的日志框架java.util.logging，功能相对简陋
> * 虽然JUL相对简陋，但还是有类库采用了它，这就出现了同一个项目中同时使用log4j和JUL要维护两套配置的问题，Apache试图解决这个问题，推出了JCL日志门面（接口），定义了一套日志接口，底层实现支持log4j和JUL，但是并没有解决多套配置的问题
> * log4j的主力开发Ceki Gülcü由于某些原因离开了Apache，创建了slf4j日志门面（接口），并实现了性能比log4j性能更好的logback（如果Ceki Gülcü没有离开Apache，这应该就是log4j2的codebase了）
> * Apache不甘示弱，成立了不兼容log4j 1.x的log4j2项目，引入了logback的特性（还酸酸地说解决了logback架构上存在的问题），但目前采用率不是很高

## 日志框架选择

那么面对这些日志框架，该如何选择呢？如果你是在开发一个新的项目（类库）而不是维护一个上古的遗留代码，那么在打印日志时推荐使用日志门面，秉承面向接口编程的思想，与具体的日志实现框架解耦，这样日后可以很容易地切换到其他的日志实现框架。

特别是当你的代码以SDK的方式提供给别人使用时，使用日志门面能避免使用方可能出现的日志框架冲突问题。如果你的SDK里使用了log4j，而使用方的应用里使用的logback，这时使用方就不得不分别针对log4j和logback维护两套日志配置文件，来确保所有日志正常的输出（slf4j提供了冲突解决方案，稍后在下文介绍）。

在目前已有的两个日志门面框架中，slf4j规避了JCL在部分场景下因为ClassLoader导致绑定日志实现框架失败的问题；能支持以上提到的所有日志实现框架；且slf4j支持占位符功能，在需要拼接日志的情况在接口层面就比JCL有更好的性能，所以推荐使用slf4j，下面简单多介绍下slf4j。

{% highlight java %}
// slf4j的占位符功能
LOGGER.info("hello {}", name);
{% endhighlight %}

## slf4j如何实现对log4j和JUL的支持

logback因为本身就实现了slf4j-api，所以天然就能很好地支持slf4j，但是log4j和JCL不同，早在slf4j之前就已经存在，他们可不是为了实现slf4j而设计的，那么如何实现slf4j和他们的绑定呢？答案就是适配器模式。如下图，slf4j分别为log4j和JCL实现了适配层`slf4-log4j12.jar`和`slf4j-jdk14.jar`，通过适配层把日志的处理转发给底层日志实现框架。

![concrete-bindings](/images/slf4j-concrete-bindings.png)

下面是使用log4j 1.x做为日志实现框架的maven依赖配置：
{% highlight xml %}
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.26</version>
</dependency>
<!-- slf4j-log4j12 依赖了log4j，不需要再显示地依赖log4j -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-log4j12</artifactId>
    <version>1.7.26</version>
</dependency>
{% endhighlight %}

## slf4j解决日志实现框架冲突

由于历史原因，总会遇到依赖的多个类库使用不同日志实现框架的情况，之前也提到了，为了确保日志正常输出，需要针对多个的日志实现框架维护多个配置文件。为了解决这个问题，slf4j再次基于适配器模式提供了解决方案，针对不同的日志实现框架实现了xxx-over-slf4j适配层，把对日志实现框架的调用转发到slf4j-api，再由slf4j把日志处理转发给日志实现框架。

![日志依赖冲突](/images/slf4j-legacy.png)

上图分别展示了把log4j，logback，JUL，JCL的调用分别转换成其中一种日志实现框架的示意图。假设项目依赖的SDK分别使用了log4j、JUL和JCL，打算把日志实现框架统一成log4j，maven依赖配置如下：

{% highlight xml %}
<dependency>
    <groupId>me.tunzao</groupId>
    <artifactId>classloader-common</artifactId>
    <version>1.0-SNAPSHOT</version>
    <exclusions>
        <!-- 排除对jcl的依赖 -->
        <exclusion>
            <artifactId>commons-logging</artifactId>
            <groupId>commons-logging</groupId>
        </exclusion>
    </exclusions>
</dependency>

<!-- 把对jcl的请求转发给slf4j -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>jcl-over-slf4j</artifactId>
    <version>1.7.26</version>
</dependency>

<!-- 把对jul的请求转发给slf4j -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>jul-to-slf4j</artifactId>
    <version>1.7.26</version>
</dependency>

<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.26</version>
</dependency>

<!-- slf4j-log4j12 依赖了log4j，不需要再显示地依赖log4j -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-log4j12</artifactId>
    <version>1.7.26</version>
</dependency>

{% endhighlight %}

需要注意的是log4j-over-slf4j.jar 和 slf4j-log4j12.jar 不能同时出现在classpath下，否则就会因为循环调用而堆栈溢出，同理jul-to-slf4j.jar和slf4j-jdk14.jar、jcl-over-slf4j.jar和slf4j-jcl.jar亦不能同时出现。

参考

[SLF4J user manual](http://www.slf4j.org/manual.html)

[Bridging legacy APIs](http://www.slf4j.org/legacy.html)

[Thoughts on Java logging and SLF4J](https://blog.frankel.ch/thoughts-on-java-logging-and-slf4j/)

[The State of Logging in Java](https://stackify.com/logging-java/)

[Java系统中常用日志框架](https://blog.csdn.net/xintonghanchuang/article/details/90752323)