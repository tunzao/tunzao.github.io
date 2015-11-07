---
layout: post
title: Shell书签功能
tags: [linux, shell, jump]
---

使用shell时总会有些经常访问的目录，老是`cd`来`cd`去的实在是麻烦，
这不，总会有些大牛闲着木事解放我们的双手，利用软连接实现shell下的书签(类似浏览器)。

{% highlight bash %}
export MARKPATH=$HOME/.marks
function jump { 
    cd -P "$MARKPATH/$1" 2>/dev/null || echo "No such mark: $1"
}
function mark { 
    mkdir -p "$MARKPATH"; ln -s "$(pwd)" "$MARKPATH/$1"
}
function unmark { 
    rm -i "$MARKPATH/$1"
}
function marks {
    ls -l "$MARKPATH" | sed 's/  / /g' | cut -d' ' -f9- | sed 's/ -/\t-/g' && echo
}
{% endhighlight %}

把以上代码放到`.zshrc`或者`.bashrc`里，使用方法：  
把当前目录加到书签`mark your_mark_name`  
显示所有书签： `marks`  
跳转到指定书签： `jump your_mark_name`  
删除指定标签： `unmark your_mark_name`

以下代码给`jump`,`unmark`增加按Tab提示功能：


{% highlight bash %}
#zsh
function _completemarks {
  reply=($(ls $MARKPATH))
}

compctl -K _completemarks jump
compctl -K _completemarks unmark
{% endhighlight %}

{% highlight bash %}
#bash
_completemarks() {
	local curw=${COMP_WORDS[COMP_CWORD]}
	local wordlist=$(find $MARKPATH -type l -printf "%f\n")
	COMPREPLY=($(compgen -W '${wordlist[@]}' -- "$curw"))
	return 0
}

complete -F _completemarks jump unmark
{% endhighlight %}

PS: zsh用户福音，如果你在使用[oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh), 你只需要启用`jump`插件就行了。

参考:[Quickly navigate your filesystem from the command-line](http://jeroenjanssens.com/2013/08/16/quickly-navigate-your-filesystem-from-the-command-line.html)
