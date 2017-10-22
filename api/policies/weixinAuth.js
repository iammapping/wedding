var Promise = require('bluebird');

module.exports = function(req, res, next) {
	if (!req.isWeixin) {
		return res.redirect('/notweixin');
	}

  return Promise.try(function() {
    var openID = req.cookies.openID || sails.config.weixin.testOpenID;
    if (!openID) {
      throw new Error('noOpenID');
    }

    return AccountService.getAccount(openID).then(function(account) {
      req.wxAccount = account;
    });
  }).then(function() {
    return next();
  }, function(err) {
    // TODO: log error
    return res.redirect(OAuthService.getAuthUrl(req.query.state));
  });
};
