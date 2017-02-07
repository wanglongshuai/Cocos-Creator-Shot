# Cocos Creator 实现截图

## 前言

Cocos Creator 现在还不是很完善，假如截图截得是部分节点，所截图对象会跑到左下角，官方提出的将 ` renderTexture ` 添加到场景中去,防止截屏时元素移动，亲测这样虽然截图时对象不会移动但是截得图有问题。

## 一、具体步骤

### 1、更改被截图对象的锚点

经过测试，` RenderTexture ` 截图的时候会将被截图的对象移到整个场景的左下角，然后根绝设置的 ` size ` ，以左下角为坐标原点截取，坐标系的锚点是（0，0）。

所以，**假如被截图对象的锚点为（0.5，0.5），则只能截取右上角的1/4。遂将被截图对象的锚点设置为（0，0）。**

### 2、添加一个虚假被截图对象

经过测试，我发现被截图对象被隐藏后，只要不在本次刷新界面的时机被激活，比如在下次刷新界面的时候激活，则会恢复到原位（这个激活操作是必须做的，否则被移动的被截图对象也不会恢复到原位！）。

基于这个测试结果，我的思路是：**代替原被截图对象，放置一个虚假精灵，在截图的时候将截取的图显示在这个虚假精灵中，替换原被截图对象，同时隐藏被截图对象。这样就看不到被移动的被截图对象了。然后在一个合适的时机，再激活真实被截图对象，隐藏虚假被截图对象。**

### 3、正式截图

#### ① 设置三个对象如下代码：

```
    properties: {

        // 被截图对象 
        cocos: cc.Sprite,
        // 显示截图的精灵
        show: cc.Sprite,
        // 被截图对象的虚假替身
        cocosImage: cc.Sprite,
    },
    
```

需要的注意的是：本例中虚假替身本身是在被截图的对象的位置的，所以后续不需要设置位置。

#### ② 截图核心代码：

```
shot: function () {

        // 注意，EditBox，VideoPlayer，Webview 等控件无法被包含在截图里面
        // 因为这是 OpenGL 的渲染到纹理的功能，上面提到的控件不是由引擎绘制的
        
        if (CC_JSB) {

            // 创建 renderTexture
            var renderTexture = cc.RenderTexture.create(195, 270);
            
            //实际截屏的代码
            renderTexture.begin();
            this.cocos._sgNode.visit();
            renderTexture.end();

            // 获取SpriteFrame
            var nowFrame = renderTexture.getSprite().getSpriteFrame();

            // 赋值给需要截图的精灵
            this.show.spriteFrame = nowFrame;

            // 显示虚假的代替精灵
            this.cocosImage.node.active = true;
            this.cocosImage.spriteFrame = nowFrame;

            // 翻转得到的纹理
            var action = cc.flipY(true);
            this.show.node.runAction(action);
            
            var action1 = cc.flipY(true);
            this.cocosImage.node.runAction(action1);

            // 隐藏被截图的对象
            this.cocos.node.active = false;
        }
    },

```
需要注意的：

i **` RenderTexture ` 得到的纹理是上下翻转的，所以需要相应翻转回来！**假如不坐旋转就会如下图：

![](http://7xoqko.com1.z0.glb.clouddn.com/daoli.png)

ii 想要截全屏，只要使用 ` Canvas ` 的节点即可，全屏的情况下不需要考虑虚假节点直接截取即可，记得将初始化 ` RenderTexture ` 时，传入的 ` size ` 为全屏的大小。

正常截图完后的图如下：

![](http://7xoqko.com1.z0.glb.clouddn.com/zhengli.png)

### 4、显示原图

之前也说了，需要在合适时机，激活被截图对象，并隐藏虚假被截图对象，代码如下：

```
this.cocos.node.active = true;
this.cocosImage.node.active = false

```

## 二、其他事项

1、如果待截图的场景中含有 ` mask `，请使用下面注释的语句来创建 ` renderTexture `。

```
var renderTexture = cc.RenderTexture.create(640,960, cc.Texture2D.PIXEL_FORMAT_RGBA8888, gl.DEPTH24_STENCIL8_OES);

```

2、把 ` renderTexture ` 添加到场景中去，否则截屏的时候，场景中的元素会移动。(确实不移动了，但是截部分节点得图时有问题，假如哪位童鞋测试没问题，希望能联系我...)

```
this.node.parent._sgNode.addChild(renderTexture);

```

3、把 ` renderTexture ` 设置为不可见，可以避免截图成功后，移除  ` renderTexture ` 造成的闪烁

```
renderTexture.setVisible(false);

```

4、保存所截的图，并且打印其地址

```
// 保存截图到本地
renderTexture.saveToFile("demo.png", cc.IMAGE_FORMAT_PNG, true, function () {
               
            });

// 打印本地的地址   
cc.log(jsb.fileUtils.getWritablePath());

```

## 三、Demo

[点击进入Demo](https://github.com/wanglongshuai/Cocos-Creator-Shot)

## 四、嘿嘿！你懂得！

本文首发于我的[个人博客](http://www.wanglongshuai.com)，希望大家多多支持！



