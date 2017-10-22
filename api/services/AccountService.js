
module.exports = {
  getAccount: function(openID) {
    var self = this;
    return WxAccount.find({
      attributes: ['accountID', 'openID', 'nickName', 'sex', 'province', 'city', 'country', 'headImgUrl', 'privilege', 'lastCheckinStatus'],
      where: {
        openID: openID
      }
    }).then(function(account) {
      if (account && account.nickName) {
        return account.get();
      }

      return self.refreshAccountInfo(openID);
    });
  },

  refreshAccountInfo: function(openID) {
    return OAuthService.getUser(openID).then(function(user) {
      var account = WxAccount.build({
        openID: openID,
        nickName: user.nickname,
        sex: user.sex,
        province: user.province,
        city: user.city,
        country: user.country,
        headImgUrl: user.headimgurl,
        privilege: user.privilege
      });
      return WxAccount.upsert(account.get()).return(account.get());
    });
  },

  getSender: function(accountID) {
    return WxAccount.find({
      attributes: ['accountID', 'nickName', 'sex', 'province', 'city', 'country', 'headImgUrl'],
      where: {
        accountID: accountID
      }
    }).then(function(sender) {
      if (!sender || !sender.nickName) {
        throw new Error('sender not inited');
      }

      return sender;
    });
  },

  getLastCheckinStatus: function(accountID) {
    return WxAccount.find({
      attributes: ['lastCheckinStatus'],
      where: {
        accountID: accountID
      }
    }).then(function(a) {
      return a && a.lastCheckinStatus;
    });
  },

  getCandidates: function() {
    return WxAccount.findAll({
      attributes: ['accountID', 'nickName', 'headImgUrl'],
      where: {
        lastCheckinStatus: 'present'
      }
    });
  },
};
