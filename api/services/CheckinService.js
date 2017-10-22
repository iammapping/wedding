
module.exports = {
  checkin: function(accountID, status) {
    var checkin = {
      accountID: accountID,
      status: status
    };

    return AccountService.getLastCheckinStatus(accountID).then(function(lastCheckinStatus) {
      if (status == lastCheckinStatus) {
        return checkin;
      }

      return CheckinStatus.create(checkin).tap(function(checkin) {
        return WxAccount.update({
          lastCheckinStatus: status
        }, {
          where: {
            accountID: accountID
          }
        });
      }).tap(function(checkin) {
        return FeedService.createCheckinFeed(accountID, checkin.status);
      });
    });
  }
};
