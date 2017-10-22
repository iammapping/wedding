var OAuth = require('wechat-oauth');
var weixin = sails.config.weixin;

module.exports = {
	getClient: function() {
		if (!this.client) {
      this.client = new OAuth(weixin.appid, weixin.secret, function(openid, cb) {
        WxAccount.getToken(openid).nodeify(cb);
      }, function(openid, token, cb) {
        WxAccount.setToken(openid, token).nodeify(cb);
      });
    }

    return this.client;
	},
  getAuthUrl: function(state) {
    var url = this.getClient().getAuthorizeURL(weixin.redirectUri, state || '', 'snsapi_userinfo');
    return url.replace('#wechat_redirect', '&connect_redirect=1#wechat_redirect');
  },
  getUser: function(openID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.getClient().getUser({
        openid: openID,
        lang: 'zh_CN'
      }, function(err, user) {
        if (err) {
          return reject(err);
        }

        resolve(user);
      });
    });
  }
};
