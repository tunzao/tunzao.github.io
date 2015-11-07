---
layout: post 
title: 使用 Maven Profile 和 Filtering 打各种环境的包
---

~~hello~~

每个项目都会有多套运行环境（开发，测试，正式等等），不同的环境配置也不尽相同（如jdbc.url)，借助Jenkins和自动部署提供的便利，我们可以把不同环境的配置文件单独抽离出来，打完包后用对应环境的配置文件替换打包后的文件，其实maven已经给我们提供了替换方案：`profile + filtering`

## Filtering
Filtering 是 maven 的 resource 插件 提供的功能，作用是用环境变量、pom文件里定义的属性和指定配置文件里的属性替换属性(`*.properties`)文件里的占位符(`${jdbc.url}`)，具体使用如下：
在`src/main/resources`目录有个配置文件`jdbc.properties`，内容如下：
{% highlight properties %}
jdbc.url=${pom.jdbc.url}
jdbc.username=${pom.jdbc.username}
jdbc.passworkd=${pom.jdbc.password}
{% endhighlight %}
配置 resource 插件，启用filtering功能并添加属性到pom:
{% highlight xml %}
<project>
    ...
    <!-- 用pom里定义的属性做替换 -->  
    <properties>
        <pom.jdbc.url>jdbc:mysql://127.0.0.1:3306/dev</pom.jdbc.url>
        <pom.jdbc.username>root</pom.jdbc.username>
        <pom.jdbc.password>123456</pom.jdbc.password>
    </properties>
    <build>
      ...
        <!-- 可以把属性写到文件里,用属性文件里定义的属性做替换 -->
        <filters>
            <filter>src/main/filters.properties</filter>
        </filters>
        <resources>
          <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
          </resource>
        </resources>
        ...
    </build>
    ...
</project>
{% endhighlight %}

编译包后 ` target` 目录下的 `jdbc.properties` :
{% highlight properties %}
jdbc.url=jdbc:mysql://127.0.0.1:3306/dev
jdbc.username=root
jdbc.passworkd=123456
{% endhighlight %}

## Profile 简介
> 什么是profile？`<profile>`就像`<dependencies>`一样是pom文件里的一个xml元素，在profile里几乎可以定义所有在pom里的定义的内容（`<dependencies>`，`<properties>`，插件配置等等，不过不能再定义他自己了）。当一个profile被激活时，它定义的`<dependencies>`，`<properties>`等就会覆盖掉原pom里定义的相同内容，从而可以通过激活不同的profile来使用不同的配置。

{% highlight xml %}
<!-- profile 的感性认识 -->
<project>
    ...
    <profiles>
      <profile>
        <id>dev</id>
        <properties>
            <active.profile>dev</active.profile>
            <pom.jdbc.url>jdbc:mysql://127.0.0.1:3306/dev</pom.jdbc.url>
        </properties>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
        <dependencies>
            <dependency>
                <groupId>org.springframework</groupId>
                <artifactId>spring-context</artifactId>
                <version>3.2.4.RELEASE</version>
            </dependency>
        <dependencies>
      </profile>
    </profiles>
    <dependencies>
        <dependency>
            <groupId>log4j</groupId>
            <artifactId>log4j</artifactId>
            <version>1.2.14</version>
        </dependency>
    </dependencies>
    ...
</project>
{% endhighlight %}

## Profile 如何配置
可以在两个位置配置profile：`settings.xml` 和 `pom.xml`

1. `settings.xml`里定义的profile是全局的，对所有的项目都可用，在里面定义的配置项也稍微少了些，只能定义远程服务器的信息和属性信息(`<repositories>`,`<pluginRepositories>`, `<properties>`)。*这些信息在`pom.xml`里也是可以定义的。*

2. `pom.xml`里可以定义的配置如下：

> - `<repositories>`
 - `<pluginRepositories>`
 - `<dependencies>`
 - `<plugins>`
 - `<properties>`
 - `<modules>`
 - `<reporting>`
 - `<dependencyManagement>`
 - `<distributionManagement>`
 - 以及build下的：
>  `<defaultGoal>`
`<resources>`
`<testResources>`
`<finalName>`

*如果profile被激活，profile里的配置和原pom的配置会做覆盖合并。*

## 如何激活Profile
可以通过多种方式激活profile（显式的，隐式的）
### 显式的激活
通过maven 的`-P`参数激活指定的profile，参数的值是profile的id,多个profile以逗号分割,如果不想激活某个默认的profile，就在它的id前加个`!` 

`mvn -U clean package -Ptest,local,!ignore`

*IDEA里则可以在 Maven Projects 里直接勾选想要激活的profile*

### 隐式的激活

配置profile时，可以在 `<profile>` 的 `<activation>` 元素下配置隐式激活的信息。

#### 默认激活

- `pom.xml`文件里

{% highlight xml %}
<!-- 默认激活 -->
<profiles>
  <profile>
    <activation>
        <activeByDefault>true</activeByDefault>
    </activation>
  </profile>
</profiles>
{% endhighlight %}

- `settings.xml`文件里则是通过`<activeProfiles>`来配置默认激活的profile列表

{% highlight xml %} 
<activeProfiles>
    <activeProfile>artifactory</activeProfile>
</activeProfiles>
{% endhighlight %}

#### 根据操作系统类型激活

{% highlight xml %}
<profiles>
    <profile>
        <activation>
            <os>
                <!-- 不必指定所有信息 -->
                <name>linux</name>
                <family>unix</family>
                <arch>amd64</arch>
                <version>3.19.0-30-generic</version>
            </os>
      </activation>
    </profile>
</profiles>
{% endhighlight %}

关于OS值的更多信息可以参考[这里](http://maven.apache.org/enforcer/enforcer-rules/requireOS.html)

#### 根据JDK版本激活
{% highlight xml %}
<!-- 如果jdk的版本为1.8则激活该profile -->
<profiles>
  <profile>
    <activation>
      <jdk>1.8</jdk>
    </activation>
    </profile>
</profiles>
{% endhighlight %}
也可以通过`[1.6,1.8)`匹配多个jdk版本，关于匹配模式的详细信息可以参考[这里](http://maven.apache.org/enforcer/enforcer-rules/versionRanges.html)

#### 根据环境变量激活
{% highlight xml %}
<!-- 如果环境变量里有`debug`且它的值为` true`则激活 -->
<!-- 也可以不指定`<value>`元素, 则只有环境变量里有`debug`就激活 -->
<profiles>
  <profile>
    <activation>
      <property>
        <name>debug</name>
        <value>true</value>
      </property>
    </activation>
  </profile>
</profiles>
{% endhighlight %}
`mvn -U clean package -Ddebug=true`

#### 通过判断文件是否存在激活
{% highlight xml %}
<profiles>
  <profile>
    <activation>
      <file>
        <missing>/path/to/missing/file</missing>
        <exists>/path/to/exists/file</exists>
      </file>
    </activation>
    ...
  </profile>
</profiles>
{% endhighlight %}

不同类型的隐式激活方式可以组合使用，如根据同时指定根据操作系统类型和JDK版本来激活profile，只有但两个条件都匹配是才激活之。

## Filtering + Profile
思路：在不同的profile里配置不同的属性(properties),然后激活相应的profile，用其中的属性去替换jdbc.properties里的占位符。
继续使用介绍Filtering时的例子，现在添加三个profile配置，分别对应开发，测试，正式环境。
修改后的pom文件如下：
{% highlight xml %}
<project>
...
<build>
    <filters>
        <filter>src/main/filters-${active.profile}.properties</filter>
    </filters>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
                <filtering>true</filtering>
        </resource>
    </resources>
</build>
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <active.profile>dev</active.profile>
        </properties>
        <!-- 把当前profile设置为默认profile，可以同时这是多个为默认-->
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
    </profile>
    <profile>
        <id>test</id>
        <properties>
            <active.profile>test</active.profile>
        </properties>
    </profile>
    <profile>
        <id>product</id>
        <properties>
            <active.profile>product</active.profile>
        </properties>
    </profile>
...
</project>
{% endhighlight %}

然后在`src/main`下新建三个文件：`filters-dev.properties`,`filters-test.properties`,`filters-product.properties`,文件内容如下（以`filters-dev.properties`为例):

{% highlight properties %}
pom.jdbc.url=jdbc:mysql://127.0.0.1:3306/dev
pom.jdbc.username=root
pom.jdbc.password=123456
{% endhighlight %}

用 dev profile 打开发包`mvn clean package -Pdev`, 打包后`jdbc.properties`文件内容如下：

{% highlight properties %}
jdbc.url=jdbc:mysql://127.0.0.1:3306/dev
jdbc.username=root
jdbc.password=123456
{% endhighlight %}

如果不同的运行环境只是属性值的不同，用上面的 `profile + filtering` 进行下变量替换可以很好的满足打包需求，如果不是简单的替换（如log4j.xml，开发环境只要输出到标准输出，测试和线上环境则还需要打到文件且文件的位置和策略也不相同），这个就需要借助maven 的 ant 插件。`src/main/resources`目录下有三个log4j的配置文件,分别对应三个运行环境:

<pre>
resources
├── log4j-product.xml
├── log4j-test.xml
└── log4j.xml
</pre>

配置如下profile:

{% highlight xml %}
<profiles>
        <profile>
            <id>dev</id>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
            <build>
                <resources>
                    <resource>
                        <directory>src/main/resources</directory>
                        <excludes>
                            <exclude>config.*.properties</exclude>
                            <exclude>log4j-*.xml</exclude>
                        </excludes>
                    </resource>
                </resources>
            </build>
        </profile>
        <profile>
            <id>test</id>
            <build>
                <plugins>
                    <plugin>
                        <artifactId>maven-antrun-plugin</artifactId>
                        <executions>
                            <execution>
                                <phase>test</phase>
                                <goals>
                                    <goal>run</goal>
                                </goals>
                                <configuration>
                                    <tasks>
                                        <delete file="${project.build.outputDirectory}/log4j.xml"/>
                                        <delete file="${project.build.outputDirectory}/log4j-product.xml"/>
                                        <move file="${project.build.outputDirectory}/log4j-test.xml"
                                              tofile="${project.build.outputDirectory}/log4j.xml"/>
                                    </tasks>
                                </configuration>
                            </execution>
                        </executions>
                    </plugin>
                </plugins>
            </build>
        </profile>
        <profile>
            <id>product</id>
            <properties>
                <active.profile>product</active.profile>
            </properties>
            <build>
                <plugins>
                    <plugin>
                        <artifactId>maven-antrun-plugin</artifactId>
                        <executions>
                            <execution>
                                <phase>test</phase>
                                <goals>
                                    <goal>run</goal>
                                </goals>
                                <configuration>
                                    <tasks>
                                        <delete file="${project.build.outputDirectory}/log4j.xml"/>
                                        <delete file="${project.build.outputDirectory}/log4j-test.xml"/>
                                        <move file="${project.build.outputDirectory}/log4j-product.xml"
                                              tofile="${project.build.outputDirectory}/log4j.xml"/>
                                    </tasks>
                                </configuration>
                            </execution>
                        </executions>
                    </plugin>
                </plugins>
            </build>
        </profile>
{% endhighlight %}

参考：

[用 maven filter 管理不同环境的配置文件](http://www.cnblogs.com/1si2/p/maven_filter.html)

[Apache Maven 使用 profile 和 filtering 实现多种环境下的资源配置管理](http://archboy.org/2012/05/21/apache-maven-profile-filtering-multiple-build-environments/)

[Introduction to Build Profiles](http://maven.apache.org/guides/introduction/introduction-to-profiles.html)
