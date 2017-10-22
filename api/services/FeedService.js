var AccountService = require('./AccountService');
var Promise = require('bluebird');

module.exports = {
  createWishFeed: function(accountID, msg) {
    return AccountService.getSender(accountID).then(function(sender) {
      return Feeds.create({
        accountID: accountID,
        nickName: sender.nickName,
        headImgUrl: sender.headImgUrl,
        msgType: Feeds.getMsgTypeID('wish'),
        msg: msg
      });
    });
  },
  createCheckinFeed: function(accountID, checkinStatus) {
    return AccountService.getSender(accountID).then(function(sender) {
      var msg = CheckinStatus.getCheckinMsg(checkinStatus);
      if (!msg) {
        return Promise.resolve();
      }

      return Feeds.create({
        accountID: accountID,
        nickName: sender.nickName,
        headImgUrl: sender.headImgUrl,
        msgType: Feeds.getMsgTypeID('checkin'),
        msg: msg
      });
    });
  },
  createReactionFeed: function(accountID, reaction) {
    return AccountService.getSender(accountID).then(function(sender) {
      // TODO: convert reaction to emoji msg

      return Feeds.create({
        accountID: accountID,
        nickName: sender.nickName,
        headImgUrl: sender.headImgUrl,
        msgType: Feeds.getMsgTypeID('reaction'),
        msg: msg
      });
    });
  },
  getLastFeeds: function(lastID, limit) {
    lastID = parseInt(lastID);
    limit = parseInt(limit) || 20;

    var opt = {
      attributes: ['id', 'accountID', 'nickName', 'headImgUrl', 'msgType', 'msg', 'createTime'],
      where: {
        visible: 1
      },
      order: 'id DESC'
    };

    if (lastID) {
      opt.where.id = {'$gt': lastID};
    } else {
      opt.limit = limit;
    }

    return Feeds.findAll(opt);
  }
};
