var _ = require('lodash');
var MsgTypes = {
  'wish': 1,
  'checkin': 2,
  'reaction': 3
};

module.exports = {
  attributes: {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      primaryKey: true
    },
    accountID: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false
    },
    nickName: Sequelize.STRING(50),
    headImgUrl: Sequelize.STRING(300),
    msgType: {
      type: Sequelize.INTEGER.UNSIGNED,
      defaultValue: MsgTypes['wish']
    },
    msg: {
      type: Sequelize.TEXT,
      get: function() {
        return _.escape(this.getDataValue('msg'));
      }
    },
    visible: {
      type: Sequelize.INTEGER.UNSIGNED,
      defaultValue: 1
    }
  },
  options: {
    tableName: 'feeds',
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    updatedAt: 'lastUpdateTime',
    createdAt: 'createTime',
    classMethods: {
      getMsgTypeID: function(type) {
        // default wish
        return MsgTypes[type] || MsgTypes.wish;
      },
      hasSentWish: function(accountID) {
        return this.count({
          where: {
            accountID: accountID,
            msgType: MsgTypes.wish
          }
        }).then(function(c) {
          return c > 0;
        });
      },
    }
  }
};
