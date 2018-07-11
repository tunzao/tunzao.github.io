---
layout: post
title: The total number of locks exceeds the lock table size 
tags: [mysql]
categories: articles
comments: true
---

全表更新若干个字段信息，数据量不大，也就287338条，但是反复更新都以报错失败：`The total number of locks exceeds the lock table size`。

Google之，问题原因是`innodb_buffer_pool_size`的默认在只有8M太小，调大就好了，试图通过`SET GLOBAL innodb_buffer_pool_size = 1024 * 1024 * 64;`的方式调整(因为这样不用重启MySQL，而且也没有重启MySQL的权限)，因为不是动态变量，返回变量只读，只能通过修改my.cnf配置文件来实现了，在[mysqld]下新增`innodb_buffer_pool_size=64M`，重启MySQL。

然后问题就解决了，但是这个参数到底是干嘛的？lock table size 跟 `innodb_buffer_pool_size` 又有什么关系呢？

在参考链接里找到了答案，`innodb_buffer_pool_size`是用来指定InnodDB缓存表的数据和索引使用的内存大小，pool越大磁盘交互就会越少，性能也会越好，如果服务器是MySQL服务专用，竟然推荐设置为内存的80%，难怪线上MySQL服务的内存使用率一直稳定地维持在86%左右。InnoDB的行锁基于存储在buffer pool里的lock table来实现，有点没太读懂实现细节，虽然只是简短的一个where从句，直接贴上原话吧。

>“in Innodb row level locks are implemented by having special lock table, located in the buffer pool where small record allocated for each hash and for each row locked on that page bit can be set.”

(参考链接里作者对其所以然的追求真是让人敬佩啊)。

另外在重启数据库过程中，停止数据库失败了，错误信息是`Timeout error occurred trying to stop MySQL Daemon.`，最后暴力的执行`killall -9 mysqld`把MySQL给停了。那么为什么会报这个错呢？能通过参数增大timeout的值从而让MySQL正常停止吗？

*注: 数据库版本5.1.73-log*

参考

[MySQL Error 1206](https://mrothouse.wordpress.com/2006/10/20/mysql-error-1206/)

