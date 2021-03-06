(function ($) {

  // Configuration
  var Version = 20140531,
      Domain = 'https://chriszarate.github.io',
      Mobile = 'https://chriszarate.github.io/genpass/mobile/',
      MinFrameArea = 100000,

  // Main
  LoadGP = function($) {

    // Defaults
    var $Target = $(document),
        $LocalFrames = $Target,
        Dragging = false,
        MaxArea = 0,

    // Functions

    /*
      Determine if frame is local (not cross-origin).
      Adapted from answer by Esailija:
      http://stackoverflow.com/questions/11872917/
    */

    IsLocalFrame = function() {
      // Expects frame element as context.
      // Try/catch helps avoid XSS freakouts.
      try {
        var key = '_' + new Date().getTime(),
            win = this.contentWindow;
        win[key] = key;
        if(win[key] === key) {
          $LocalFrames.add(win.document);
          return true;
        }
      }
      catch(e) {
        return false;
      }
    },

    FindBiggestFrame = function() {
      // Expects frame element as context.
      // Try/catch helps avoid XSS freakouts.
      try {
        var Area = $(this).height() * $(this).width();
        if(Area > MaxArea && Area > MinFrameArea) {
          $Target = $(this.contentWindow.document);
          MaxArea = Area;
        }
      }
      catch(e) {}
    },

    // Define CSS properties.
    BoxStyle = 'z-index:99999;position:absolute;top:0;right:5px;width:275px;margin:0;padding:0;box-sizing:content-box;',
    TitleBarStyle = 'overflow:hidden;width:275px;height:20px;margin:0;padding:0;background-color:#365;cursor:move;box-sizing:content-box;',
    FrameStyle = 'position:static;width:275px;height:190px;border:none;overflow:hidden;pointer-events:auto;',

    // Create GP elements.
    $Box = $('<div/>', {style: BoxStyle}),
    $TitleBar = $('<div/>', {style: TitleBarStyle}),
    $Frame = $('<iframe/>', {src: Mobile, scrolling: 'no', style: FrameStyle});

    // Find largest viewport, looping through frames if applicable.
    $('frame').filter(IsLocalFrame).each(FindBiggestFrame);
    $('iframe', $Target).filter(IsLocalFrame).each(FindBiggestFrame);

    // If no target document is found, redirect to mobile version.
    if(!$Target) {
      window.location = Mobile;
    }

    // Provide "close window" feature.
    $TitleBar.on('dblclick', function () {
      $Box.remove();
    });

    // Apply scroll offset.
    $Box.css('top', $Target.scrollTop() + 'px');

    // Blur any active form fields.
    $(document.activeElement).blur();

    // Append GP window to target document.
    $Box.append($TitleBar, $Frame).appendTo($('body', $Target));

    // Attach postMessage listener for responses from GP generator.
    $(window).on('message', function (e) {
      var post = e.originalEvent;
      if(post.origin === Domain && typeof post.data !== 'undefined') {
        $.each(JSON.parse(post.data), function (key, value) {
          switch(key) {
            // Populate generated password into password fields.
            case 'result':
              $('input:password:visible', $LocalFrames)
                .css('background', '#9f9')
                .val(value)
                .trigger('change click')
                .on('input', function () {
                  $(this).css('background', '#fff');
                })
                .focus();
              break;
            // Change iframe height to match GP generator document height.
            case 'height':
              $Frame.css('height', Math.max(parseInt(value, 10), 167) + 2);
              break;
          }
        });
      }
    });

    // Send current bookmarklet version to GP generator. (Also communicates
    // current URL and opens channel for response.)
    $Frame.on('load', function () {
      this.contentWindow.postMessage('{"version":'+Version+'}', Domain);
    });

    /*
      Start drag listener.
      Adapted from jQuery console bookmarklet:
      http://github.com/jaz303/jquery-console
    */

    $TitleBar.on({
      mousedown: function (e) {
        var Offset = $Box.offset();
        Dragging = [e.pageX - Offset.left, e.pageY - Offset.top];
        $Frame.css('pointer-events', 'none');
        e.preventDefault();
      },
      mouseup: function () {
        Dragging = false;
        $Frame.css('pointer-events', 'auto');
      }
    });

    $Target.on('mousemove', function (e) {
      if(Dragging) {
        $Box.css({
          left: e.pageX - Dragging[0],
          top: e.pageY - Dragging[1]
        });
      }
    });

    return true;

  },

  /*
    Look for jQuery 1.7+ (for ".on") and load it if it can't be found.
    Adapted from Paul Irish's method:
    http://pastie.org/462639
  */

  Ready = $ && $.fn && parseFloat($.fn.jquery) >= 1.7 && LoadGP($);

  if(!Ready) {

    var s = document.createElement('script');
    s.src = '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js';
    s.onload = s.onreadystatechange = function() {
      var state = this.readyState;
      if(!state || state === 'loaded' || state === 'complete') {
        Ready = true;
        LoadGP(jQuery.noConflict());
      }
    };

    /*
      Set timeout to see if it has loaded; otherwise assume that loading
      was blocked by an origin policy or other content security setting.
    */

    setTimeout(function() {
      if(!Ready) {
        window.location = Mobile;
      }
    }, 2000);

    document.getElementsByTagName('head')[0].appendChild(s);

  }

})(window.jQuery);
