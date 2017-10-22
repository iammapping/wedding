var hash = require('../lib/hash');

module.exports = {
  attributes: {
    accountID: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    openID: {
      type: Sequelize.STRING(50),
      allowNull: false,
      set: function(val) {
        this.setDataValue('openID', val);
        this.setDataValue('accountID', hash.crc32(val));
      }
    },
    nickName: Sequelize.STRING(50),
    sex: Sequelize.INTEGER.UNSIGNED,
    province: Sequelize.STRING(20),
    city: Sequelize.STRING(20),
    country: Sequelize.STRING(20),
    headImgUrl: Sequelize.STRING(300),
    privilege: Sequelize.JSON,
    accessToken: Sequelize.STRING(200),
    refreshToken: Sequelize.STRING(200),
    expireIn: Sequelize.INTEGER.UNSIGNED,
    tokenTime: Sequelize.DATE,
    lastCheckinStatus: {
      type: Sequelize.ENUM,
      values: ['coming', 'absent', 'present']
    }
  },
  options: {
    tableName: 'wx_accounts',
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    updatedAt: 'lastUpdateTime',
    createdAt: 'createTime',
    classMethods: {
      getToken: function(openID) {
        return this.find({
          where: {
            openID: openID
          }
        }).then(function(account) {
          if (!account) {
            return null;
          }

          return {
            openid: account.openid,
            access_token: account.accessToken,
            refresh_token: account.refreshToken,
            create_at: account.tokenTime,
            expires_in: account.expireIn
          };
        });
      },
      setToken: function(openID, token) {
        var account = this.build({
          openID: openID,
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          expireIn: token.expires_in,
          tokenTime: token.create_at
        });
        return this.upsert(account.get());
      }
    }
  }
};
