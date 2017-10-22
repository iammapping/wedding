(function($, PM) {
  if (location.href.indexOf('wall') < 0) return;

  var galleryInterval = 0;
  var lastAnchor = null;

  $(function() {
    $('#fullpage').fullpage({
      anchors:['gallery', 'theme', 'cheer', 'lottery'],
      verticalCentered: false,
      afterLoad: function(anchor, index) {
        clearInterval(galleryInterval);
        lastAnchor = anchor;

        switch (anchor) {
          case 'gallery':
            galleryInterval = setInterval(function () {
              $.fn.fullpage.moveSlideRight();
            }, 4000);
            break;
          case 'lottery':
            lottery.reset();
            $('#wish-board').css('visibility', 'hidden');
            break;
          default:
            $('#wish-board').css('visibility', 'visible');
            break;
        }
      }
    });
  });
  if ($('#wish-board').size() > 0) {
    PM.poller.interval = 2000;
    PM.poller.poll();
    PM.board.init($('#wish-board'));
    PM.board.speed = 8000;
    PM.board.duration = 1200;
    PM.board.showName = true;
  }


  function Lottery(options) {
    this.options = $.extend({
      onLoad: function() {},
      onStart: function() {},
      onStop: function() {},
      onChange: function() {},
      onReset: function() {},
      duration: 100,
      stopAfterCount: 5
    }, options);

    this.loaded = false;
    this.candidates = [];
    this._loopTM = 0;
    this.lastWinnerIndex = 0;
  }

  Lottery.prototype.reset = function() {
    this.loaded = false;
    this.candidates = [];
    this.options.onReset.call(this);
  };

  Lottery.prototype.load = function() {
    var self = this;
    if (this.loaded) return $.Deferred().resolve();

    return PM.request({
      url: '/home/api_candidate',
      cache: false
    }).then(function(candidates) {
      self.loaded = true;
      self.candidates = candidates;
      self.options.onLoad.call(self);
    });
  };

  Lottery.prototype.start = function() {
    if (this.stopping || this.candidates.length === 0) return;
    this.duration = this.options.duration;
    this.stopAfterCount = this.options.stopAfterCount;
    this.options.onStart.call(this);
    this.running = true;
    this._loop();
  };

  Lottery.prototype._loop = function() {
    var self = this;
    var last = this.lastWinnerIndex;
    while (last == this.lastWinnerIndex && this.candidates.length > 1) {
      this.lastWinnerIndex = Math.floor(Math.random() * this.candidates.length);
    }
    this.options.onChange.call(this, this.candidates[this.lastWinnerIndex]);

    if (this.stopping) {
      this.stopAfterCount--;
      if (this.stopAfterCount === 0) {
        this.stopping = false;
        this.running = false;
        this.options.onStop.call(this);
        return;
      }
    }

    this._loopTM = setTimeout(function() {
      self._loop();
    }, this.duration);
  };

  Lottery.prototype.toggle = function() {
    if (this.running) {
      this.stop();
    } else {
      this.start();
    }
  };

  Lottery.prototype.stop = function() {
    if (this.stopping) return;

    this.stopping = true;
    this.stopAfterCount = this.options.stopAfterCount;
    this.duration = this.options.duration * 5;
  };

  Lottery.prototype.getWinner = function() {
    return this.candidates.splice(this.lastWinnerIndex, 1)[0];
  };

  var $btn = $('#btn-lottery');
  var $img = $('#img-head');
  var $name = $('#nick-name');
  var $list = $('#winner-list');
  var lottery = new Lottery({
    onReset: function() {
      $img.attr('src', 'http://wx.qlogo.cn/mmopen/nIpMicPfqN61erVp1qryiaQF6WBv4qokJ4icmqQibwNeRXA8WKiaYYJClQrDWRoN8lXNGdtLrZednHebfZp0tfKRm0SIlplLglo2c/96');
      $name.text('准备好了吗');
      $list.empty();
    },
    onStart: function() {
      $btn.removeClass('btn-start').addClass('btn-stop');
    },
    onStop: function() {
      $btn.removeClass('btn-stop').addClass('btn-start');
      var winner = this.getWinner();
      $list.append('<li><img src="' + winner.headImgUrl.replace(/\/0$/, '/96') +'" alt="' + winner.nickName + '"><span>' + winner.nickName + '</span></li>');
    },
    onChange: function(candidate) {
      $img.attr('src', candidate.headImgUrl.replace(/\/0$/, '/96'));
      $name.text(candidate.nickName);
    },
  });

  $(document).on('keyup', function(e) {
    if (e.keyCode == 13 && lastAnchor == 'lottery') {
      lottery.load().then(function() {
        lottery.toggle();
      });
    }
  }).on('click', '#btn-lottery', function(e) {
    e.preventDefault();
    lottery.load().then(function() {
      lottery.toggle();
    });
    this.blur();
  });

}(jQuery, PM));
