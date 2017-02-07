cc.Class({
    extends: cc.Component,

    properties: {

        // 被截图对象 
        cocos: cc.Sprite,
        // 显示截图的精灵
        show: cc.Sprite,
        // 被截图对象的虚假替身
        cocosImage: cc.Sprite,
    },

    shot: function () {

        // 注意，EditBox，VideoPlayer，Webview 等控件无法被包含在截图里面
        // 因为这是 OpenGL 的渲染到纹理的功能，上面提到的控件不是由引擎绘制的
        
        if (CC_JSB) {

            // 创建 renderTexture
            var renderTexture = cc.RenderTexture.create(195, 270);
            
            //实际截屏的代码
            renderTexture.begin();
            //this.richText.node 是我们要截图的节点，如果要截整个屏幕，可以把 this.richText 换成 Canvas 切点即可
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

    resetPostion: function () {
        
        this.cocos.node.active = true;
        this.cocosImage.node.active = false
    },

    // called every frame
    update: function (dt) {

    //   this.cocos.node.position = this.cacheP;
    },
});
