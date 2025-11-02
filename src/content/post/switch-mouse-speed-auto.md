---
title: "多蓝牙鼠标切换时自动更新系统灵敏度"
description: "AI coding 成功案例"
publishDate: "05 Sep 2025"
updatedDate: "08 Sep 2025"
tags: ["auto", "折腾"]
---

## 前置

- 多个鼠标
- 有桌面系统的 Linux 系统
    - Windows 不知有没有这种接口

## 背景

直接放上我给 Gemini 2.5 Pro 的前半段提示词：

> 我有两个鼠标分别放在 宿舍和教学楼。它们自身灵敏度不同，所以笔记本电脑的鼠标灵敏度调节必须来回切换才能达到我的顺手需求。我现在想做个自动化脚本控制

其实构想起来还是很简单的，无非是*先确认蓝牙型号，如果是需要调整的蓝牙鼠标则调节灵敏度*。所以我也向 AI 提供了我的思路

> 思路如下
> 1. 监测鼠标型号/mac地址（不知道是持续扫描，还是蓝牙连接事件触发）
> 2. 通过某个系统接口调节灵敏度，但是不知道是哪个接口

可以看到我一开始的思路构想还是非常清晰的，只不过对实现细节没有了解；后续 AI 也是从头到尾都完全按照我的思路去实现。

## 实现

### 初步方案

一开始它以为我的鼠标是有线的，纠正以后大概是这么三步

#### 确认鼠标的 MAC 地址和名称

前者可使用
```bash
bluetoothctl devices
```
后者
```bash
xinput list
```
:::tip
`bluetoothctl` 顾名思义，是蓝牙控制台。

`xinput` 则是控制 *X 输入设备*的控制台。至于什么是 X 输入设备，这已超出本文的关注点，简单提几句：
有一种显示架构叫 X Window System （即 X11 / X），为了接收物理硬件（如键鼠）的输入，在软件层面实现了 X 输入设备这个对象——一种抽象
:::

本文为了方便，就把宿舍和教学楼的鼠标分别这么称呼：
- d:o:r:m, dorm
- t:e:a:c, teac

#### 确定最适合的灵敏度

`xinput` 既然对物理硬件实现抽象，那么自然有硬件对应的软件属性。在我的需求中，硬件灵敏度被抽象为 `libinput Accel Speed`，这是一个 [-1, 1] 间的浮点数，查看和设置的方法分别是

```bash
xinput list-props "dorm" | grep -i "libinput Accel Speed"

# libinput Accel Speed (345):     0.792357

xinput set-prop "dorm" "libinput Accel Speed" 0.8
```
这就解决了我的第二个疑问，即如何调节灵敏度。

一开始的灵敏度不顺手的话，可以通过二分尝试找到最优解；我偷了个懒，直接在系统设置的 GUI 界面用滑条调出来了。

最终的灵敏度确定为：
- dorm: 0.80
- teac: -0.20

做完上面两步，我们才能开始和系统打交道：

#### 创建事件驱动规则

至于第一个疑问，Linux 有一个服务 `udev` 监测设备状态——那么自然是事件驱动型了，触发事件是**蓝牙连接**。`udev` 支持自己创建事件驱动的规则，[文档里](https://man.archlinux.org/man/udev.7) 写的非常详细了。

在 `/etc/udev/rules.d` 下创建规则文件 `99-bluetooth-mouse.rules`。这个文件名是 AI 给我起的、我直接用了，但文档好像没提到文件名的影响；

> A matching rule may ..... or **run a specified program as part of the event handling**.

看来我们目前在正确的道路上。接着看看 AI 说什么：

```txt
# filepath: /etc/udev/rules.d/99-bluetooth-mouse.rules
# 规则1: 宿舍蓝牙鼠标
ACTION=="add", SUBSYSTEM=="input", ATTR{uniq}=="d:o:r:m", ENV{DISPLAY}=":0", ENV{XAUTHORITY}="/home/你的用户名/.Xauthority", RUN+="/bin/sh -c 'echo /usr/bin/xinput set-prop \"dorm\" \"libinput Accel Speed\" 0.80 | at now + 2 seconds'"

# 规则2: 教学楼蓝牙鼠标
ACTION=="add", SUBSYSTEM=="input", ATTR{uniq}=="t:e:a:c", ENV{DISPLAY}=":0", ENV{XAUTHORITY}="/home/你的用户名/.Xauthority", RUN+="/bin/sh -c 'echo /usr/bin/xinput set-prop \"teac\" \"libinput Accel Speed\" -0.20 | at now + 2 seconds'"
```

前面应该是一些匹配事件所用的（后面有印证），关键点在于 RUN 里的命令
```bash
/bin/sh -c 'echo /usr/bin/xinput set-prop \"dorm\" \"libinput Accel Speed\" 0.80 | at now + 2 seconds'
```

- `/usr/bin/xinput set-prop \"dorm\" \"libinput Accel Speed\" 0.80` 就是设置鼠标灵敏度的核心命令；
- `| at now + 2 seconds`
at 是一个控制**命令**执行时刻的程序，和 cron 有点像但 at 只运行一次。命令需要通过管道符传给 at。

#### 该实现的大致思路

那么这个规则的意思就是：

当

- udev 检测到有设备加入
- 且设备 ATTR{uniq} 属性为我们想要的鼠标 MAC 地址

就执行

- 设置两个环境变量
- 运行上面指令
    - 指令会在 udev 接收到加入信号后 2s 执行
    - 设置该鼠标的灵敏度为给定值

这就是一开始我给 AI 定的大致思路.

:::important
每次修改 udev 规则以后，都需要重载一下 udev 规则
```bash
sudo udevadm control --reload-rules
```
:::

听起来非常完美。但是，

### debug

#### 验证事件监听生效

为了测试，我将原来连接的 dorm 鼠标电源关闭，teac 打开（这两个都早已配对+信任，自动连接的），预期是 -0.20

> libinput Accel Speed (345):     0.800000
> 并没有调整。

AI 率先发现了可能的问题：可能根本没有匹配成功。为此它指引了一些本地化操作，确认我所用的匹配属性是对的
```bash
udevadm monitor --environment --udev

UDEV  [9655.227205] add      /devices/virtual/misc/uhid/... (input)
ACTION=add
DEVPATH=/devices/virtual/misc/uhid/...
SUBSYSTEM=input
PRODUCT=....
NAME="teac" ###
PHYS="...."
UNIQ="t:e:a:c" ###
```
并建议我改用 `ATTRS{name}="teac"` 规则来匹配。
注意这里 ACTION SUBSYSTEM NAME UNIQ 等，和我们所写的（硬编码）匹配规则一一对应。
~~你参数多，读的文档和 issues 多，信你~~ 调节失败了。

我又在 RUN 的指令里加上日志，进一步验证了事件的匹配成功
```bash
/bin/sh -c 'echo \"Rule triggered for mouse at $(date)\" >> /tmp/udev_test.log; echo /usr/bin/xinput set-prop \"teac\" \"libinput Accel Speed\" -0.20 | at now + 2 seconds'"
```

> 当我在两个鼠标间切换时，日志有显示新的连接信号，但是灵敏度并没有调节

#### 修改调节灵敏度命令

> `udev` 规则在 `root` 环境下运行。你设置的 `ENV{DISPLAY}` 和 `ENV{XAUTHORITY}` 变量对于 `RUN` 命令本身是可见的，但当你通过管道 | 将 xinput 命令交给 at 服务去延迟执行时，这些环境变量并不会被传递过去。at 会在一个非常干净、最小化的环境中执行任务，它不知道要操作哪个图形界面，所以 xinput 命令虽然被执行了，但因为它找不到目标显示器，所以静默失败了。
>
> 解决方案：放弃 at，直接执行文件脚本

1. 专用的设置灵敏度的脚本文件。
```sh
#!/bin/bash
# /usr/local/bin/set-mouse-speed.sh
########## 最终版本 ##########

DEVICE_NAME="$1"
SENSITIVITY="$2"
USERNAME="icydesert"

# 等待属于用户的桌面会话就绪（区别于锁屏）
sleep 5

# --- 智能查找用户图形环境 ---
get_user_env() {
    local user_pid
    user_pid=$(pgrep -u "$USERNAME" -f "gnome-shell" | head -n 1)
    if [ -n "$user_pid" ]; then
        # 智能确定环境变量
        export DISPLAY=$(grep -z DISPLAY /proc/"$user_pid"/environ | tr -d '\0' | sed 's/DISPLAY=//')
        export XAUTHORITY=$(grep -z XAUTHORITY /proc/"$user_pid"/environ | tr -d '\0' | sed 's/XAUTHORITY=//')
    else
        # 如果找不到，则使用备用方案
        export DISPLAY=:0
        export XAUTHORITY="/home/$USERNAME/.Xauthority"
    fi
}

# 设置环境变量
get_user_env

# 以用户身份，使用找到的环境变量来执行 xinput
sudo -u "$USERNAME" DISPLAY=$DISPLAY XAUTHORITY=$XAUTHORITY /usr/bin/xinput set-prop "$DEVICE_NAME" "libinput Accel Speed" "$SENSITIVITY"
### 当然，还得给此文件执行权限
```

脚本里最关键的前置就是 `sleep 5`。因为各个图形会话相互独立，在锁屏会话设置的灵敏度**不会共享给桌面会话**，所以**必须**等待我输入密码、进入桌面以后，才能执行智能函数。

 `sudo -u "$USERNAME"` 可以确保脚本在我的用户环境下执行。


2. 修改规则集。监测到事件后，只需要执行上面脚本。
```txt
# filepath: /etc/udev/rules.d/99-bluetooth-mouse.rules
# teaching building, older one: CD23 C
ACTION=="add", SUBSYSTEM=="input", ATTRS{name}=="teac", RUN+="/usr/local/bin/set-mouse-speed.sh 'teac' '-0.20'"

# dorm, newer one: CD23 SE
ACTION=="add", SUBSYSTEM=="input", ATTRS{name}=="dorm", RUN+="/usr/local/bin/set-mouse-speed.sh 'dorm' '0.80'"
```

......好吧，你读的源码多，看上去也没什么问题。

#### 黎明前的黑暗

> 现在鼠标动不了了 xinput list-props "teac"   
> unable to find device teac

> 两个鼠标都连接不上电脑蓝牙

> 好的，情况比预想的要严重。这表明蓝牙服务本身可能进入了一个不稳定的状态。

......这个「好的」听起来有点幸灾乐祸了。幸好可以用 sudo systemctl restart bluetooth 重置服务状态，恢复原样。

#### 茅「塞」顿开

> 鼠标完全不动并且 xinput 找不到设备，这说明我们的 udev 规则可能干扰了设备的正常初始化过程
>
> udev 的 RUN 命令默认是阻塞的。我们的脚本里有一个 `sleep 2`，这可能导致 udev 的设备处理流程被卡住了 2 秒。对于某些系统和设备，这个延迟可能过长，导致后续的初始化步骤（比如在 X server 中注册设备）失败或超时

为此我们需要让脚本后台执行。脚本本身是没问题的（业务逻辑），需要改动的是触发脚本方，即规则集，使其启动的进程后台执行：

```txt
# filepath: /etc/udev/rules.d/99-bluetooth-mouse.rules
######### 最终脚本 #########
# teaching building
ACTION=="add", SUBSYSTEM=="input", ATTRS{name}=="teac", RUN+="/bin/sh -c '/usr/local/bin/set-mouse-speed.sh \teac\" -0.20 &'"

# dorm, newer one
ACTION=="add", SUBSYSTEM=="input", ATTRS{name}=="dorm", RUN+="/bin/sh -c '/usr/local/bin/set-mouse-speed.sh \"dorm\" 0.80 &'"
```
此处 `&` 表示该脚本会后台执行；同时，它会立即返回结果，不阻塞 udev 的后续识别。

完成！

### 讨论

脚本依赖于 `sleep 5` 前置，坏消息是这***十分灵车***，好消息是灵车是摇摇车。只要我登进系统发现鼠标还是不好使，再断开重新连接就行。因为这是个人脚本所以我对有感操作比较无感，这就是工程的魅力（

另外同样由于上面所说的会话独立原因，else 分支实际上是无效的。~~懒得改了~~