---
title: 用dependency插件解决依赖包冲突
layout: post
tags: [maven]
categories: articles
comments: true
---

偶然翻阅了下 maven dependency 插件的官方文档，颇有收获，记录一下。可能有些标题党的嫌疑，并没有具体介绍怎么解决依赖冲突问题，不过既然你都打印出了依赖树，冲突关系已然在树中显示的清清楚楚了。

##依赖树
`dependency:tree` 大概是用的最多的功能，用来排查依赖冲突，没有指定任何参数执行时打印是所有依赖信息，信息量略大，可以通过`includes`参数指定想看哪些依赖，也可以通过`excludes`参数指定不想看的。`includes`和`excludes`可以配合使用。举个例子吧：

{% highlight bash %}
# 只想看依赖树中包含 groupId 为 javax.serlet 的枝干
mvn dependency:tree -Dincludes=javax.servlet
# 不想看依赖树中包含 groupId 为 javax.serlet 的枝干
mvn dependency:tree -Dexcludes=javax.servlet
{% endhighlight %}

参数的格式(pattern)定义如下:

`[groupId]:[artifactId]:[type]:[version]`

每个部分（冒号分割的部分）是支持`*`通配符的，如果要指定多个格式则可以用`,`分割，如：

{% highlight bash %}
mvn dependency:tree -Dincludes=javax.servlet,org.apache.*
{% endhighlight %}

默认情况下 `dependency:tree` 打印出来的是 maven
解决﻿了冲突后的树（解决冲突的策略是：就近原则，即离根近的依赖被采纳），通过指定 `-Dverbose`
参数则可以显示原始的依赖树，让你显式地看出某个包都在哪些枝干上出现了。

## 清空被本地仓库(purge-local-repository)
有时候打包时会遇到一些莫名其妙的问题，百思不得其解，但是清空本地仓库后问题就解决了（就像重启电脑一般神奇）。之前都是去本地私服目录把某个groupId对应的jar包都删了或者
把所有的都给删了，难免删了一些无辜的依赖，dependency
插件提供了一个goal可以方便的删除本地目录下该项目依赖的jar包：
{% highlight bash %}
mvn dependency:purge-local-repository
{% endhighlight %}

## 复制依赖或某些jar包到指定目录
使用 dependency 的 copy-depenecis goal 把依赖的jar复制到指定目录前，在pom文件配置如下：
{% highlight xml %}
<project>
[...]
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-dependency-plugin</artifactId>
                <version>2.10</version>
                <executions>
                    <execution>
                        <id>copy-dependencies</id>
                        <phase>package</phase>
                        <goals>
                            <goal>copy-dependencies</goal>
                        </goals>
                        <configuration>
                            <outputDirectory>/path/to/dest</outputDirectory>
                            <overWriteReleases>false</overWriteReleases>
                            <overWriteSnapshots>false</overWriteSnapshots>
                            <overWriteIfNewer>true</overWriteIfNewer>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
[...]
</project>
{% endhighlight %}
更多参数信息参见[dependency:copy-dependencies](https://maven.apache.org/plugins/maven-dependency-plugin/copy-dependencies-mojo.html)

如果只想复制极少的几个jar包到指定目录的话可以使用 `copy` goal:
{% highlight xml %}
<project>
[...]
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-dependency-plugin</artifactId>
                <version>2.10</version>
                <executions>
                    <execution>
                        <id>copy</id>
                        <phase>package</phase>
                        <goals>
                            <goal>copy</goal>
                        </goals>
                        <configuration>
                            <artifactItems>
                                <artifactItem>
                                    <groupId>junit</groupId>
                                    <artifactId>junit</artifactId>
                                    <version>3.8.1</version>
                                </artifactItem>
                            </artifactItems>
                            <outputDirectory>/path/to</outputDirectory>
                            <overWriteReleases>false</overWriteReleases>
                            <overWriteSnapshots>true</overWriteSnapshots>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
[...]
</project>
{% endhighlight %}

据说`analyze` goal 可以分析出声明的依赖中哪些未被使用，未被声明的包中哪些被依赖了，试了下好像并不是很好使。

参考：

[Apache Maven Dependency Plugin](https://maven.apache.org/plugins/maven-dependency-plugin/)

