// Generated by CoffeeScript 1.9.0
(function() {
  var ComicsRoute, ComicsView,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  ComicsRoute = (function(_super) {
    __extends(ComicsRoute, _super);

    function ComicsRoute(_at_parent) {
      this.parent = _at_parent;
      this.index = __bind(this.index, this);
      this.stripChange = __bind(this.stripChange, this);
      ComicsRoute.__super__.constructor.call(this);
    }

    ComicsRoute.prototype.routes = {
      '': 'index',
      'strip/:page(/)': 'stripChange'
    };

    ComicsRoute.prototype.stripChange = function(page) {
      return this.parent.setSlide(page);
    };

    ComicsRoute.prototype.index = function() {
      return this.parent.setSlide(1);
    };

    return ComicsRoute;

  })(Backbone.Router);

  ComicsView = (function(_super) {
    var _bookmarkActiveAddClass, _bookmarkAddClass, _firstTime, _instance, _leftArrow, _loading, _rightArrow;

    __extends(ComicsView, _super);

    _bookmarkAddClass = 'bookmark-adder';

    _bookmarkActiveAddClass = 'bookmark_adder-active';

    _loading = $('<div class="loading"></div>');

    _leftArrow = null;

    _rightArrow = null;

    _instance = null;

    _firstTime = true;

    ComicsView.prototype.selector = null;

    ComicsView.prototype.loader = null;

    ComicsView.prototype.route = null;

    ComicsView.prototype.parent = null;

    ComicsView.prototype.page = 1;

    ComicsView.prototype.lastPage = 0;

    ComicsView.prototype.$currentStrip = null;

    ComicsView.prototype.animateTime = 200;

    ComicsView.prototype.name = "";

    ComicsView.prototype.id = 0;

    ComicsView.prototype.base = "";

    ComicsView.prototype.pushstate = false;

    ComicsView.prototype.bookmarkIcon = null;

    function ComicsView() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this._done = __bind(this._done, this);
      this._error = __bind(this._error, this);
      this._show = __bind(this._show, this);
      this._hide = __bind(this._hide, this);
      this._loadEnd = __bind(this._loadEnd, this);
      this._loadStart = __bind(this._loadStart, this);
      this._selectSlide = __bind(this._selectSlide, this);
      this._next = __bind(this._next, this);
      this._prev = __bind(this._prev, this);
      this._unsetBookmark = __bind(this._unsetBookmark, this);
      this._setBookmark = __bind(this._setBookmark, this);
      this._toggleBookmark = __bind(this._toggleBookmark, this);
      this._keyBind = __bind(this._keyBind, this);
      this.showTooltip = __bind(this.showTooltip, this);
      this.removeBookmark = __bind(this.removeBookmark, this);
      this.addBookmark = __bind(this.addBookmark, this);
      this.setSlide = __bind(this.setSlide, this);
      this.events = __bind(this.events, this);
      this.initialize = __bind(this.initialize, this);
      this.selector = ui && new ui.ComicsSelector('#comics-toolbar', '[data-plagin="select2"]');
      this.loader = tools && new tools.LoadingBox('.loading-box:eq(0)');
      this.page = parseInt($('body').data('current_page'));
      this.lastPage = parseInt($('body').data('last_page'));
      this.name = $('body').data('comic_name');
      this.id = $('body').data('comic_id');
      this.base = $('body').data('base');
      this.pushstate = $('body').data('pushstate') && Modernizr && Modernizr.history;
      this.bookmarkIcon = $('body').data('bookmark_icon');
      this.route = new ComicsRoute(this);
      _.extend(this, args[0]);
      ComicsView.__super__.constructor.apply(this, args);
    }

    ComicsView.prototype.initialize = function() {
      var bookmark;
      _leftArrow = this.$el.find('.comics_left-arrow');
      _rightArrow = this.$el.find('.comics_right-arrow');
      this.$currentStrip = this.$el.find('.comics-box img');
      this.selector.value(this.page);
      bookmark = main.bookmark != null ? main.bookmark : tools.BookmarksView.getBookmarks({
        parent: this
      });
      if (bookmark != null) {
        bookmark.collection.on('add', this._setBookmark);
        bookmark.collection.on('remove', (function(_this) {
          return function(model) {
            if (model.get('bookmark') === location.href) {
              return _this._unsetBookmark();
            }
          };
        })(this));
        if (bookmark.find(location.href)) {
          this._setBookmark();
        }
      }
      Backbone.history.start({
        pushState: this.pushstate,
        hashChange: !this.pushstate,
        root: this.base
      });
      if (this.$el.find('.comics-box img').get(0).complete) {
        this.showTooltip();
      }
      return $("." + _bookmarkAddClass).bind({
        'mouseenter': function() {
          return $(this).stop().animate({
            top: 0
          }, 1000);
        },
        'mouseleave': function() {
          return $(this).stop().animate({
            top: -50
          }, 1000);
        }
      });
    };

    ComicsView.prototype.events = function() {
      $(this.selector).on('go', this._selectSlide);
      $(this.loader).on('start', this._loadStart);
      $(this.loader).on('end', this._loadEnd);
      this.$el.find('.comics-box img').on('load', this._loadEnd);
      $(window).keypress(this._keyBind);
      return {
        'click .comics_left-arrow': '_prev',
        'click .comics_right-arrow': '_next',
        'click .bookmark-adder': '_toggleBookmark'
      };
    };

    ComicsView.prototype.setSlide = function(slide) {
      slide = parseInt(slide);
      this.selector.value(this.page);
      $('#comics-current_page').text(this.page);
      if (this.page !== slide) {
        this.page = parseInt(slide);
        return $.ajax({
          type: "GET",
          url: "/rest/comics/" + this.id + "/strip/" + slide
        }).done((function(_this) {
          return function(r) {
            return _this._done(r.page, r.url);
          };
        })(this)).fail((function(_this) {
          return function(r) {
            return _this._error(r);
          };
        })(this));
      }
    };

    ComicsView.prototype.addBookmark = function() {
      if (this.parent.bookmark != null) {
        this.parent.bookmark.add(this.bookmarkIcon, this.name + ", страница: " + this.page, location.href);
        return this._setBookmark();
      }
    };

    ComicsView.prototype.removeBookmark = function() {
      if (this.parent.bookmark != null) {
        this.parent.bookmark.remove(location.href);
        return this._unsetBookmark();
      }
    };

    ComicsView.prototype.showTooltip = function() {
      if ((this.parent != null) && (this.parent.tooltip != null) && _firstTime) {
        this.parent.tooltip.show();
        return _firstTime = false;
      } else if (_firstTime && window.tools) {
        return tools.TooltipsView.getTooltip().show();
      }
    };

    ComicsView.prototype._keyBind = function(e) {
      console.log(e.keyCode);
      if (e.keyCode === 37 && this.page > 1) {
        this._prev();
      }
      if (e.keyCode === 39 && this.page < this.lastPage) {
        this._next();
      }
      $(window).off('keypress', this._keyBind);
      return setTimeout(((function(_this) {
        return function() {
          return $(window).keypress(_this._keyBind);
        };
      })(this)), 400);
    };

    ComicsView.prototype._toggleBookmark = function() {
      if (!this.$el.find("." + _bookmarkAddClass).hasClass(_bookmarkActiveAddClass)) {
        return this.addBookmark();
      } else {
        return this.removeBookmark();
      }
    };

    ComicsView.prototype._setBookmark = function() {
      return this.$el.find("." + _bookmarkAddClass).addClass(_bookmarkActiveAddClass);
    };

    ComicsView.prototype._unsetBookmark = function() {
      return this.$el.find("." + _bookmarkAddClass).removeClass(_bookmarkActiveAddClass);
    };

    ComicsView.prototype._prev = function() {
      this._hide();
      return $.ajax({
        type: "GET",
        url: "/strip/prev/" + this.page
      }).done((function(_this) {
        return function(r) {
          _this.page = r.prev;
          return _this._done(r.prev, r.url);
        };
      })(this)).fail((function(_this) {
        return function(r) {
          return _this._error;
        };
      })(this));
    };

    ComicsView.prototype._next = function() {
      this._hide();
      return $.ajax({
        type: "GET",
        url: "/strip/next/" + this.page
      }).done((function(_this) {
        return function(r) {
          _this.page = r.next;
          return _this._done(r.next, r.url);
        };
      })(this)).fail((function(_this) {
        return function(r) {
          return _this._error(r);
        };
      })(this));
    };

    ComicsView.prototype._selectSlide = function(e, slide) {
      return this.setSlide(slide);
    };

    ComicsView.prototype._loadStart = function(e) {
      _loading.css({
        opacity: 0
      }).animate({
        opacity: 1
      }, this.animateTime * 4);
      return this.$currentStrip.parents('.comics-box').append(_loading);
    };

    ComicsView.prototype._loadEnd = function(e) {
      this.showTooltip();
      _loading.remove();
      return this._show();
    };

    ComicsView.prototype._hide = function() {
      var comics_box, height, width;
      comics_box = this.$currentStrip.parents('.comics-box');
      width = comics_box.width();
      height = parseInt(comics_box.height()) + parseInt(comics_box.css('padding-top')) + parseInt(comics_box.css('padding-bottom'));
      comics_box.css({
        width: width,
        height: height
      });
      return this.$currentStrip.animate({
        opacity: 0
      }, this.animateTime);
    };

    ComicsView.prototype._show = function() {
      var comics_box, image;
      comics_box = this.$currentStrip.parents('.comics-box');
      this.loader.setAlt(this.name + ", strip " + this.page);
      image = this.loader.getImage();
      if (image != null) {
        image.css({
          opacity: 0
        });
        this.$currentStrip.replaceWith(image);
        comics_box.css({
          width: 'auto',
          height: 'auto'
        });
        image.animate({
          opacity: 1
        }, this.animateTime, (function(_this) {
          return function() {
            return _this.loader.reset();
          };
        })(this));
        return this.$currentStrip = image;
      }
    };

    ComicsView.prototype._error = function(r) {
      return tools.TooltipsView.error("Ошибка загрузки", r.error);
    };

    ComicsView.prototype._done = function(page, url) {
      var _err;
      try {
        this.setSlide(page);
        this.loader.setImage(url);
        _leftArrow['fade' + (this.page > 1 && this.lastPage >= this.page ? 'In' : 'Out')](this.animateTime);
        _rightArrow['fade' + (this.page !== this.lastPage ? 'In' : 'Out')](this.animateTime);
        this.route.navigate("strip/" + this.page, {
          trigger: true
        });
        if (this.parent.bookmark.find(location.href)) {
          this._setBookmark();
        } else {
          this._unsetBookmark();
        }
        if ((typeof tools !== "undefined" && tools !== null) && (tools.TooltipsView != null)) {
          tools.TooltipsView.errorClose();
        }
        return true;
      } catch (_error) {
        _err = _error;
        return false;
      }
    };

    ComicsView.getComicsView = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (_instance == null) {
        return _instance = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(this, args, function(){});
      } else {
        return _instance;
      }
    };

    return ComicsView;

  })(Backbone.View);

  $(function() {
    return window.main.view = ComicsView.getComicsView({
      parent: window.main,
      el: '.main-comic_page'
    });
  });

}).call(this);
