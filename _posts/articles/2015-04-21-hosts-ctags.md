---
layout: post
title: 给hosts文件生成ctags文件
tags: [linux, ctags]
categories: articles
comments: true
---
经常编辑hosts文件，
定位具体位置的时候以前用搜索功能，但是域名相似的配置实在太多，不能立即跳转到指定地方，
其实已经把`hosts`划分成若干组，但是某些组的组名里还是包含了其他域名的关键字,
其实可以起个完全不包含的别名啊，但是可读性不好,
厌倦了搜索，于是想到了 `tags`。简单了搜索了下好像没有生成`hosts`文件`tags`文件的工具，还是自己手动生成之。


`{tagname} {TAB} {tagfile} {TAB} {tagaddress} {term} {field} ..  `

上面这是tags文件里一条tag的格式，我在 `.vimrc` 里设置了 `expandtab`, 导致输入不了tab，有没有选项在编辑特定文件时不`expandtab`呢？哦， `set noexpandtab`

    新建如下记录：

    abc|hosts|  /^#*abc*$/;"|   c 

    然后就能跳转到相应组了

