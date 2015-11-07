---
layout: post
title: Java双括号语法
tags: [java]
categories: articles
comments: true
---

第一次接触双括号语法是使用mybatis，代码如下：

{% highlight java %}
return new SQL() { {
    SELECT("count(*)") ;
    FROM("user");
    WHERE("status=#{status}");
}}.toString();
{% endhighlight %}

第一眼感觉是神奇，至少在之前还木有见过这种用法，  
有种似曾相识的感觉，也曾偶尔给它一瞬间的思考：这是什么意思呢？   
没做深入思考的情况下我想应该是类似于静态代码块吧？  
嗯，这个解释很是合理，于是乎就没再深入思考。

后来，来了一位初入江湖的新同事看到了这段代码，问我什么意思？  
“我想应该是静态代码块吧？！”  
但是随即查看了下`SELECT`方法，它并不是静态的！！！  
终于在疑惑了数天之后忍不住google了一下（其实当时没有google是因为不知道用什么关键字，这次我用的关键字是[java new 两层大括号])。  
搜索结果了大都是某某人翻译的某某人的一篇文章，  
虽然有些文章里也提到了`new Runnable`的例子，但总感觉不是那么浅显易懂，如果把代码分解成如下应该就容易理解多了。

{% highlight java %}
class MySQL extends SQL {
    // Non-static instance initialization
    {
        SELECT("count(*)") ;
        FROM("user");;
        WHERE("status=#{status}");
    }
}
return new MySQL().toString();
{% endhighlight %}

其中 `SELECT` 在`SQL`的父类中定义， 长这样的:  
{% highlight java %}
public T SELECT(String columns) {
    this.sql.statementType = SQLStatement.StatementType.SELECT;
    this.sql.select.add(columns);
    return getSelf();
}
{% endhighlight %}


打完收工，希望很浅显易懂!

参考：  
Thinking in Java 之 Initialization & Cleanup  
[Java技巧之双括弧初始化](http://www.iteye.com/topic/418542)  
[再谈Java双括弧技巧：不规范的语法？](http://developer.51cto.com/art/200908/143644.htm)  

[java new 两层大括号]:(https://www.google.com/search?newwindow=1&safe=off&q=java%20new%20%E4%B8%A4%E5%B1%82%E5%A4%A7%E6%8B%AC%E5%8F%B7&oq=java%20new%20%E4%B8%A4%E5%B1%82%E5%A4%A7%E6%8B%AC%E5%8F%B7&gs_l=serp.12...0.0.0.352130.0.0.0.0.0.0.0.0..0.0....0...1c..51.serp..0.0.0.KXvsxL6S9qs)
