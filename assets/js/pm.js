(function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap');

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] };
      }
    }

    return false; // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false;
    var $el = this;
    $(this).one('bsTransitionEnd', function () { called = true; });
    var callback = function () { if (!called) $($el).trigger($.support.transition.end); };
    setTimeout(callback, duration);
    return this;
  };

  $(function () {
    $.support.transition = transitionEnd();

    if (!$.support.transition) return;

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments);
      }
    };
  });

}(jQuery));


(function($) {
  /**
   * textarea自适应内容高度
   */
  $.fn.fittextarearows = function(minRows, maxRows) {
    return this.each(function() {
      if(this.tagName == 'TEXTAREA') {
        $(this).on('keyup.fitrows input.fitrows blur.fitrows', function() {
          var rows = minRows || 2, $t = $(this);
          maxRows = maxRows || 5;
          while(rows <= maxRows) {
            $t.attr('rows', rows).css('overflow', 'hidden');
            if($t.innerHeight() < $t[0].scrollHeight) {
              rows++;
            } else {
              break;
            }
          }
          if(rows > maxRows) {
            $t.css('overflow', 'auto');
          }
        }).trigger('keyup.fitrows');
      }
    });
  };
})(jQuery);


(function($, win) {
  // 全局PM对象
  var PM = {};
  win.PM = PM;

  win.requestAnimationFrame =  win.requestAnimationFrame ||
    win.mozRequestAnimationFrame ||
    win.webkitRequestAnimationFrame ||
    win.msRequestAnimationFrame;


  /**
   * 轮询器
   * 
   * @param function looper 轮询要做的事
   * @param number interval 轮询间隔
   * @param number times 轮询次数
   */
  function Poller(looper, interval, times) {
    var self = this, tm = null, count = 0;

    this.looper = function() {
      return $.Deferred(function(dtd) {
        var res = looper.call(self);

        if (res && typeof res.then == 'function') {
          res.always(function() {
              dtd.resolve();
          });
        } else {
          dtd.resolve();
        }
      });
    };

    this.originInterval = interval || 5000;
    this.interval = this.originInterval;
    this.times = times || Infinity;
    this.id = +new Date();
    this.sleeping = false;

    this.poll = function() {
      this.looper().done(function() {
        if (++count < self.times) {
          self.start();
        }
      });
    };

    this.start = function() {
      tm = setTimeout(function() {
        self.poll();
      }, this.interval);

      return this;
    };

    this.pause = function() {
      clearTimeout(tm);

      return this;
    };

    this.autoSleep = function(timeoutToSleep) {
      timeoutToSleep = timeoutToSleep || 60000;
      var activeTm;
      // go to sleep, when user mouse is not active on page until timeout
      $(document).off('mousemove.poller-active' + this.id).on('mousemove.poller-active' + this.id, function() {
        activeTm && clearTimeout(activeTm);
        activeTm = setTimeout(function() {
            self.sleep();
        }, timeoutToSleep);
      }).triggerHandler('mousemove.poller-active' + this.id);
      // go to sleep immediately, when user window lose focus
      $(win).off('blur.poller-active' + this.id).on('blur.poller-active' + this.id, function() {
        self.sleep();
      });

      return this;
    };

    this.sleep = function() {
      if (this.sleeping) {
        return;
      }

      this.sleeping = true;
      // wakeup while mouse move
      $(document).one('mousemove.poller-sleep' + this.id, function() {
        self.wakeup();
      });
      // wakeup while window get focus
      $(win).one('focus.poller-sleep' + this.id, function() {
        self.wakeup();
      });
      this.interval = this.interval * 8;

      return this;
    };

    this.wakeup = function() {
      if (!this.sleeping) {
        return;
      }

      this.sleeping = false;
      $(document).off('mousemove.poller-sleep' + this.id);
      $(win).off('focus.poller-sleep' + this.id);
      this.pause();
      this.interval = this.originInterval;
      this.poll();

      return this;
    };
  }

  /**
   * 与后台api交互的简单封装
   */
  PM.request = function(opt) {
    return $.ajax(opt).pipe(function(r) {
      if (r.status == 'failed') {
        return $.Deferred().reject(r.error);
      } else {
        return r.data;
      }
    });
  };

  /**
   * 提示框
   */
  PM.toast = function(msg, delay) {
    msg = msg || '已完成';
    delay = delay || 3000;
    var $toast = $(
      '<div id="toast" style="display: none;">' +
        '<div class="weui_mask_transparent"></div>' +
        '<div class="weui_toast">' +
          '<i class="weui_icon_toast"></i>' +
          '<p class="weui_toast_content">' + msg + '</p>' +
        '</div>' +
      '</div>'
    );

    $toast.appendTo('body').show().on('tap', function(e) {
      $toast.remove();
      e.preventDefault();
    });
    setTimeout(function() {
      $toast.remove();
    }, delay);
  };

  /**
   * 背景图片墙
   * 参考自：https://github.com/tregoning/photoTilt
   * 
   * @param {any} $el 
   * @param {any} options 
   */
  function Tilt($el, options) {
    this.options = $.extend({
      width: $el.data('width'),
      height: $el.data('height'),
      centerOffset: $el.data('centerOffset'),
      container: $el.parent(),
      maxTilt: 80
    }, options);

    this.$el = $el;
    this.aspectRatio = this.options.width / this.options.height;
    this.options.centerOffset = this.options.centerOffset || (this.options.width / 2);
    this.viewport = {};

    this.init();
  }

  Tilt.prototype.init = function() {
    this.initViewport();
    var renderHeight = Math.min(this.viewport.height, this.options.height);
    var renderWidth = this.aspectRatio * renderHeight;
    var scaleRatio = renderHeight / this.options.height;
    this.leftOffset = this.options.centerOffset * scaleRatio - this.viewport.width / 2;
    this.rightOffset = renderWidth - this.options.centerOffset * scaleRatio - this.viewport.width / 2;
    this.reset();
  };

  Tilt.prototype.reset = function() {
    this.setX(-this.leftOffset);
    return this;
  };

  Tilt.prototype.setX = function(x) {
    this.$el.css('transform', 'translateX(' + Math.round(x) + 'px)');
  };

  Tilt.prototype.initViewport = function() {
    this.viewport.width = this.options.container.width();
    this.viewport.height = this.options.container.height();
  };

  Tilt.prototype.update = function(tilt) {
    var maxOffset = Math.max(this.leftOffset, this.rightOffset);
    var leftMaxTilt = this.leftOffset * this.options.maxTilt / maxOffset;
    var rightMaxTilt = this.rightOffset * this.options.maxTilt / maxOffset;
    var pxToMove;
    if (tilt > 0) {
      tilt = Math.min(tilt, leftMaxTilt);
      pxTomove = -tilt * this.leftOffset / leftMaxTilt;
    } else {
      tilt = Math.max(tilt, -rightMaxTilt);
      pxTomove = -tilt * this.rightOffset / rightMaxTilt;
    }

    this.setX(-(pxTomove + this.leftOffset));
  };

  PM.Tilt = Tilt;
  PM.tilt = {
    tiltObj: null,
    lastTilt: 0,
    enabled: true,
    stoped: false,
    init: function() {
      var self = this;
      if (win.DeviceOrientationEvent) {
        var averageGamma = [];
        win.addEventListener('deviceorientation', function(e) {
          if (self.enabled && !self.stoped) {
            if (averageGamma.length > 8) {
              averageGamma.shift();
            }
            averageGamma.push(e.gamma);
            self.lastTilt = averageGamma.reduce(function(a, b) {
              return a+b;
            }) / averageGamma.length;
          }
        }, false);
        win.requestAnimationFrame($.proxy(self.update, self));
      }
    },
    update: function() {
      if (this.tiltObj) {
        this.tiltObj.update(this.lastTilt);
        win.requestAnimationFrame($.proxy(this.update, this));
      }
    },
    setTilt: function(to) {
      this.tiltObj = to;
      return this;
    },
    pause: function() {
      this.stoped = true;
    },
    play: function() {
      this.stoped = false;
    },
    enable: function() {
      this.enabled = true;
    },
    disable: function() {
      this.enabled = false;
      this.lastTilt = 0;
    }
  };

  /**
   * 地图
   */
  PM.map = {
    dtd: $.Deferred(),
    load: function() {
      var self = this;
      setTimeout(function() {
        self.dtd.resolve();
      }, 100);
    },
    open: function() {
      if (PM.map.dtd.state() == 'resolved') {
        return $.Deferred().resolve();
      } else {
        return $.ajax({
          type: 'GET',
          url: 'http://webapi.amap.com/maps?v=1.3&key=ae7ec99e2aa1832237f39584e0b4418f&callback=gd_map_load',
          dataType: 'script',
          cache: true
        }).then(function() {
          return PM.map.dtd;
        }).done(function() {
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
        }).fail(function() {

        });
      }
    }
  };

  /**
   * 下拉公告
   * 
   * @param {any} $el 
   * @param {any} options 
   */
  function PullDown($el, options) {
    this.options = $.extend({
      handler: $el
    }, options);
    this.$el = $el;
    this.$handler = this.options.handler;
    this.height = this.$el.outerHeight();
    this.startY = 0;
    this.currentY = 0;
    this.originY = this.$el.hasClass('closed') ? -this.height : 0;
    this.init();
  }

  PullDown.prototype.init = function() {
    this.initEvent();
  };

  PullDown.prototype.initEvent = function() {
    var self = this;
    var touchstartTime;
    var startY = 0;
    var changedY = 0;
    var startPadding = 20;
    this.$handler.on('touchstart', function(e) {
      self.$el.addClass('disable-anim');
      startY = e.originalEvent.touches[0].clientY;
      touchstartTime = new Date().getTime();
      self.setY(self.$el.hasClass('expand') ? self.originY : self.originY + startPadding);
    }).on('touchmove', function(e) {
      changedY = e.originalEvent.touches[0].clientY - startY;
      if (!self.$el.hasClass('expand') && Math.abs(changedY) < startPadding) {
        return;
      }
      if (new Date().getTime() - touchstartTime < 200 && Math.abs(changedY) > 50) {
        if (changedY > 0) {
          self.down();
        } else {
          self.up();
        }
      } else {
        var y = self.originY + changedY;
        y = Math.min(0, Math.max(y, -self.height));
        self.setY(y);
      }
    }).on('touchend', function(e) {
      var pos = changedY > 0 ? 2/3 : 1/3;
      if (self.currentY >= -pos * self.height) {
        self.down();
      } else if (self.currentY < -pos * self.height) {
        self.up();
      }
    }).on('click', function() {
      if (self.$el.hasClass('expand')) {
        self.up();
      }
    });

    this.$el.on('click', function() {
      if (self.$el.hasClass('expand')) {
        self.up();
      }
    });
  };

  PullDown.prototype.down = function() {
    this.$el.removeClass('disable-anim').addClass('expand').removeClass('closed');
    this.setY(0);
    this.originY = this.currentY;
  };

  PullDown.prototype.up = function() {
    this.$el.removeClass('disable-anim').removeClass('expand');
    this.setY(-this.height);
    this.originY = this.currentY;
    this.options.onClose && this.options.onClose.call(this);
  };

  PullDown.prototype.setY = function(y) {
    this.currentY = y;
    this.$el.css('transform', 'translateY(' + this.currentY + 'px)');
  };

  PM.pull = new PullDown($('#about-box'), {
    handler: $('#btn-pull-down'),
    onClose: function() {
      var self = this;
      if (self.$el.data('noAbout')) {
        return;
      }

      PM.request({url: '/home/api_closeAboutUs'}).then(function() {
        self.$el.data('noAbout', true);
      });
    }
  });

  /**
   * 背景音乐
   * 
   * @param $ $btn 开关 
   * @param object options 配置
   * @returns 
   */
  function BGM($btn, options) {
    this.options = $.extend({
      src: '',
      loop: true,
      preload: true,
      autoplay: true
    }, options);
    this.$btn = $btn;

    if (this.$btn.size() === 0) return;

    this.$audio = $('<audio></audio>', {
      src: this.options.src,
      loop: this.options.loop,
      preload: this.options.preload,
      autoplay: this.options.autoplay
    });
    this.$btn.append(this.$audio);
    this.initEvent();

    if (this.options.autoplay) {
      this.play();
    } else {
      this.pause();
    }
  }

  BGM.prototype.initEvent = function() {
    var self = this;
    this.$audio.on("canplay", function() {
      return self.$audio.get(0).play();
    }).on("play", function() {
      return self.$btn.addClass("playing");
    }).on("pause", function() {
      return self.$btn.removeClass("playing");
    });

    this.$btn.on('tap', function(e) {
      e.preventDefault();
      if (self.$audio.get(0).paused) {
        self.play();
      } else {
        self.pause();
      }
    });
  };

  BGM.prototype.play = function() {
    this.$audio.get(0).play();
  };

  BGM.prototype.pause = function() {
    this.$audio.get(0).pause();
  };

  PM.BGM = BGM;


  /**
   * 轮询祝福弹幕
   */
  PM.lastFeedID = 0;
  PM.maxFeeds = 20;
  PM.poller = new Poller(function() {
    return PM.request({
        'url': '/home/api_lastFeeds',
        'cache': false,
        'data': {
            'lastID': PM.lastFeedID,
            'limit': PM.maxFeeds
        },
    }).done(function(d) {
      if (d && d.length > 0) {
        PM.lastFeedID = d[0].id;
        PM.board.unshift(d.reverse());
      }
    });
  }, 5000);

  /**
   * 文字转颜色
   * 
   * @param {any} str 
   * @returns 
   */
  function str2rgb(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = [];
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      colour.push(value);
    }
    return colour;
  }

  /**
   * 弹幕墙
   */
  PM.board = {
    _wishes: [],
    _cm: null,
    _stopped: false,
    speed: 4000,
    duration: 800,
    showName: false,
    pendingMsg: [],
    init: function($el) {
      this._cm = new CommentManager($el.get(0));
      this._cm.init();
      this.play();
    },
    push: function(ws) {
      this._wishes = this._wishes.concat(ws);
    },
    unshift: function(ws) {
      if (!$.isArray(ws)) {
        ws = [ws];
      }
      this._wishes = ws.concat(this._wishes);
    },
    pause: function() {
      this._stopped = true;
      this._cm.stop();
    },
    play: function() {
      this._stopped = false;
      this._cm.start();
      this.loop();
    },
    loop: function() {
      if (this._stopped) {
        return;
      }

      // publish pending msg first
      var msg;
      while ((msg = this.pendingMsg.shift())) {
        this.publish(msg);
      }

      msg = this._wishes.shift();
      if (msg) {
        this.publish(msg);
        // add back
        // if (this._wishes.length < PM.maxFeeds) {
          this._wishes.push(msg);
        // }
      }

      setTimeout($.proxy(PM.board.loop, this), this.duration);
    },
    publish: function(msg) {
      var cmt = {};
      // 根据每个人的账号生成专属的颜色
      var color = str2rgb(msg.accountID+'').join(',');
      // 字幕的节点内容
      cmt.text = '<span class="icon">' +
        (msg.headImgUrl ? ('<img src="'+ msg.headImgUrl.replace(/\/0$/, '/96') +'">') : '') +
        '</span><span class="text" style="background:rgba(' + color + ',0.4)">' +
          (this.showName ? (msg.nickName + '：') : '') +
          msg.msg +
        '</span>';
      cmt.mode = 1;
      cmt.size = 16;
      cmt.dur = Math.floor(Math.random()*4000 + this.speed);

      this._cm.send(cmt);
    }
  };
}(jQuery, window));

// 地图jsonp回调
function gd_map_load() {
  PM.map.load();
}

