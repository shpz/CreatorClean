# 支持我

插件永久免费，不需要捐钱，只需要支付宝扫描以下二维码领取红包即可

![image](https://raw.githubusercontent.com/shpz/CreatorClean/master/red.png)

# 写在前边

插件前身是一段扫描指定目录图片资源的代码，用于项目瘦身

现在还记得当初手动删无用图片资源（1000+）

一上午就在回想资源有没用，删资源，删错了回退![image](https://raw.githubusercontent.com/shpz/CreatorClean/master/emoji2.jpg)

后来索性做成了一个Creator插件一劳永逸

（世界就是我们懒人创造的，哼）

# 插件功能

![image](http://imgcdn.store.cocos.com/uploads/launcher/source/user/1397846/icon/store_cocos_com_wrench_229939_crop_1515922221.png!175x175)

资源整理工厂

自动扫描Creator工程 assets目录下所有没有用到的图片

插件现在支持扫描：

AnimationClip(.anim)中用到的图片

场景(.fire)上Component、Button和Sprite挂载的图片

Prefab(.prefab)上Component、Button和Sprite挂载的图片

如发现支持其他支持可以告诉我一声...  : )

定位资源，统计未使用资源数量，可忽略resources目录， 可自定义忽略目录或字段

**以及毁天灭地的一键清除功能(！！！慎用)**

# 插件安装

### 通过拓展商店安装（推荐）

打开Creator

拓展 -> 拓展商店 找到资源整理工厂，下载后选择安装目录，全局目录可以所有项目通用，项目目录则只有该项目能用

![image](https://raw.githubusercontent.com/shpz/CreatorClean/master/use1.png)

### 通过Github拉取

git clone https://github.com/shpz/CreatorClean.git

在项目工程里有个packages，在这打开git命令行，把上边这段命令复制到命令行里，回车

![image](https://raw.githubusercontent.com/shpz/CreatorClean/master/use2.png)

# 插件使用

![image](https://raw.githubusercontent.com/shpz/CreatorClean/master/use3.png)

插件的制作过程蕴含着我无数的心血和爱，所以插件非常容易上手，爱！![image](https://raw.githubusercontent.com/shpz/CreatorClean/master/emoji.jpg)

插件左上从左到右分别是刷新，一键删除和无用资源统计，插件加载完成默认刷新一次

往下是忽略resources目录开关，因为resources里一般是动态加载的资源，默认勾选，不需要的自行取消

输入框可以输入自定义忽略的目录或字段，图片资源URL包含字段的话将不会出现在未使用资源清单里

目录为URL形式，如果不清楚文件夹或资源的URL可以在Creator里右键目标资源选显示uuid和目录(其实就是在项目工程里的目录)

输入框内用英文逗号 “,” 分割，单个字段请尽量详细

然后是资源清单区，会显示所有未使用图片资源的路径，操作下边的按钮可以对单个资源定位和删除

左下角是可爱的作者的github链接

# 还有一点点

插件用到的css和html使用了部分官方的另一个插件的资源，表示感谢

@Jare 和 @C姐 给我了我不少帮助，表示感谢

关于插件的反馈请提交到github或[论坛讨论帖](http://forum.cocos.com/t/topic/55439/17)，表示感谢

插件完全由作者自己开发，并保证持续更新和永久免费，对支持我的用户表示感谢