---
layout: post
title: Ubuntu命令行切换鼠标左右键
---

话不多说，让我们开始切换：  
首先让我们把鼠标切换到反手(这里之所以用***反手***一词，是因为有人可能是左撇子，有人是右撇子「还有右撇子？」):  
	`xmodmap -e  'pointer = 3 2 1'`  
请拿出你的小鼠标摇一摇点一点，  
是不是已经切换到***反手***了捏？！  
好的，那让我们再切换回来：  
`xmodmap -e 'pointer = 1 2 3'`  
请再次猛烈的点击一次！  
是不是又肥来了？！

不过每次切换都要输入***29***个字符,雅蠛蝶！  
那就给他们起个小昵称嘛！
{% highlight bash %}
# filename .bashrc
alias mr="xmodmap -e 'pointer = 3 2 1'"
alias ml="xmodmap -e 'pointer = 1 2 3'"
{% endhighlight %}
***   
好吧，被你们识破了，我是左撇子！

[参考资料](http://www.douban.com/note/220045599/)
