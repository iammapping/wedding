
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
    status: {
      type: Sequelize.ENUM,
      values: ['coming', 'absent', 'present']
    }
  },
  options: {
    tableName: 'checkin_status',
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    updatedAt: 'lastUpdateTime',
    createdAt: 'createTime',
    classMethods: {
      getLastCheckinStatus: function(accountID) {
        return this.find({
          where: {
            accountID: accountID
          },
          order: 'id DESC'
        });
      },
      getCheckinMsg: function(status) {
        var checkinMsg = {
          'coming': '我来现场，你们一起来吧',
          'present': '我在现场，这里太嗨了'
        };

        return checkinMsg[status];
      }
    }
  }
};
