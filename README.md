# 婚礼互动，让你们的婚礼飞起来

## 缘起

这个项目就是在我婚礼前一个月左右，心血来潮，想在婚礼上搞点事情，给大家留个深刻的印象。最终婚礼上的反响还不错，近期想着与其让这个项目尘封，倒不如开源出来，祝愿所有的 forker 有情人终成眷属。



## 介绍

项目分为微信端和大屏端。微信端可以作为电子请柬提前分享给大家，部署的服务器域名最好有备案，不然容易被屏蔽。大屏端是放在婚礼现场的大屏幕上，现场的宾客可以刷弹幕上墙，并且有照片播放页，迎宾页，抽奖页面。另外微信端也作为现场互动的入口，扫码签到可参与抽奖，发弹幕送祝福上大屏幕。

微信端 `/`：

![微信端](http://self-storage.b0.upaiyun.com/2017/10/22/150866684532177784.png)



大屏端 `/wall` (上下方向键切换不同屏)：

![大屏端欢迎页](http://self-storage.b0.upaiyun.com/2017/10/22/150867322395988694.png)



## 安装

下载本项目

```
> git clone https://github.com/iammapping/wedding
```

到项目根目录初始化：`npm install`

安装 sails

```
> npm install sails -g
```

启动：`sails lift`，生产环境加上 `--prod` 参数。



## 配置

**配置微信公众号**

```javascript
> vi config/weixin.js
module.exports.weixin = {
  // 微信公众号相关设置
  appid: 'xxx',
  secret: 'xxx',
  // 微信公众号设置的回调地址
  redirectUri: 'http://xxx/home/resolve'
};
```

**配置数据库**

导入表结构

```
mysql> create database wedding;
mysql> source wedding.sql;
```

修改连接参数（使用 Sequelize 替代了 Sails 框架中默认的 Waterline）

```javascript
> vi config/connections.js
sequelizeServer: {
  user: 'xxx',
  password: 'xxx',
  database: 'wedding',
  options: {
  dialect: 'mysql',
  dialectOptions: {
    charset: 'utf8mb4'
  },
  host: '127.0.0.1',
  port: 3306,
  logging: true,
  timezone: "+08:00",
  }
}
```


**修改图片素材**

微信端在 `views/homepage.ejs` 中修改，公告也在此文件修改
```html
<img class="disable-tilt" src="/images/1-740.jpg" data-width="1500" data-height="1000" data-center-offset="740" />
...
```

* data-width：图片宽度
* data-height：图片高度
* data-center-offset：图片主体中线 x 轴位置




大屏端在 `assets/styles/wall.css` 中修改
```css
#slide1 {
  background-image: url(/images/1-740.jpg);
}
...
```

**修改背景音乐**

在 `assets/js/home.js` 中修改
```javascript
PM.bgm = new PM.BGM($('#bgm-audio'), {
  src: '/audios/pm_bgm2.mp3',
  autoplay: false
});
```


**修改地图位置**

在 `assets/js/pm.js` 中修改
```javascript
var map = new AMap.Map('pnl-map',{
  zoom: 17,
  center: [115.977634, 29.709759]
});
var marker = new AMap.Marker({
  position: map.getCenter()
});
marker.setMap(map);

// 设置label标签
marker.setLabel({
  offset: new AMap.Pixel(-75, -30),
  content: "PM Infinity婚礼于10月5日晚"
});
```

`center` 修改中心坐标，`content` 修改坐标说明的文字。

**修改婚礼日期**

在 `assets/js/home.js` 中修改

```javascript
var remainDays = Math.floor((new Date(2016, 9, 5) - new Date())/(24*3600*1000));
```

**彩蛋**

在链接中加上 `?state=present` 可以直接签到在现场，可用于婚礼现场扫码签到。



## 微信调试

**1. 申请开发测试号**

不管公众号账号主体是个人还是企业，都可以通过[接口测试号申请](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421137522)，申请好后可以拿到测试的 `appID` 和 `appsecret`。

扫码关注测试公众号，只有加入了测试用户列表才有相关的接口权限。

**2. 设置网页服务授权的回调域名**

在*体验接口权限表 > 网页服务 > 网页帐号 >网页授权获取用户基本信息*，修改授权页面回调域名，如：`127.0.0.1:1337`

**3. 修改项目中的配置文件**

```javascript
module.exports.weixin = {
  // 微信公众号相关设置
  appid: '第 1 步拿到的 appID',
  secret: '第 1 步拿到的 appsecret',
  // 微信公众号设置的回调地址
  redirectUri: 'http://第 2 步设置的回调域名/home/resolve'
};
```

**4. 使用微信 web 开发者工具测试**

下载[微信web开发者工具](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1455784140)，微信(账号需已关注测试公众号)扫码登录该工具，然后在地址栏打开 `http://127.0.0.1:1337`，如果能正常授权并打开微信端首页，那就大功告成啦。👏

微信手机端实测(前提是手机电脑在同一局域网)，将第 2 - 4 步中的本地 ip 修改为你电脑的局域网 ip，然后在微信手机端访问这个 ip，如：`http://192.168.13.14:1337`。




## 致谢

感谢媳妇的支持，感谢大家的祝福。

感谢项目中使用的所有开源项目和服务：

* Mysql、Nodejs、Sails、Sequelize、Bluebird、wechat-oauth
* WeUI、jQuery、jquery.fullPage、slick、CommentCoreLibrary(CCL弹幕)、高德地图、iconfont


## License

Copyright 2017 iammapping

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

