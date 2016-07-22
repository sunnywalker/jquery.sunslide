
(function ($, window) {
    $.fn.sunslide = function (options) {
        // Default settings
        var settings = $.extend({
            "auto": true,             // Boolean: Animate automatically, true or false
            "captions": true,         // Boolean: Add captions based on alt text, true or false
            "nav": true,              // Boolean: Show navigation, true or false
            "nextText": "&rarr;",     // String: Text for the "next" button
            "pause": true,            // Boolean: Pause on hover over the slider, true or false
            "play": true,             // Boolean: Add play/pause button, true or false
            "prevText": "&larr;",     // String: Text for the "previous" button
            "ratio": "first",         // String: Size to 'min', 'max', or 'first' (first slide) ratio
            "stopOnNav": true,        // Boolean: Stop auto slide transitions when a nav is interacted with, true or false
            "timeout": 5000           // Integer: Time between slide transitions, in milliseconds
        }, options);
        var ns_index = 0; // namespace index

        return this.each(function () {
            var t = $(this),
                container,
                slides,
                caption,
                timer,
                play_button,
                prev_button,
                next_button,
                playing,
                namespace = 'sunslide' + ns_index++,
                vp_width = 0,
                max_width = 0,
                max_height = 0,
                min_ratio = 2,
                max_ratio = 0,
                resize_ratio;

            t.wrap('<div class="' + namespace + ' sunslide-wrapper"></div>');
            container = t.parent();
            container.css({
                'position': 'relative'
            });
            slides = t.children();
            if (slides.length < 2) {
                return;
            }
            vp_width = container.width();

            function resetTimer() {
                if (settings.auto) {
                    clearInterval(timer);
                    timer = setInterval(nextSlide, settings.timeout);
                    playing = true;
                    if (play_button) {
                        play_button.find('use').attr('xlink:href', '#' + namespace + '-pause-icon');
                    }
                }
            }

            // function start() {
            //     settings.auto = true;
            //     resetTimer();
            // }

            function stop() {
                settings.auto = false;
                clearInterval(timer);
                if (play_button) {
                    play_button.find('use').attr('xlink:href', '#' + namespace + '-play-icon');
                }
            }

            function pause() {
                playing = false;
                clearInterval(timer);
            }

            function resume() {
                playing = true;
                resetTimer();
            }

            function prevSlide() {
                var a = slides.filter('.sunslide-active-slide'),
                    n = slides.filter('.sunslide-next-slide'),
                    f = a.prev('.sunslide-slide');
                if (!f.length) {
                    f = $(slides[slides.length - 1]);
                }
                f.removeClass('sunslide-hidden-slide').addClass('sunslide-active-slide');
                a.removeClass('sunslide-active-slide').addClass('sunslide-next-slide');
                n.removeClass('sunslide-next-slide').addClass('sunslide-hidden-slide');
                if (settings.captions) {
                    caption.text(f.find('img').attr('alt'));
                }
            }

            function nextSlide() {
                var a = slides.filter('.sunslide-active-slide'),
                    n = slides.filter('.sunslide-next-slide'),
                    f = n.next('.sunslide-slide');
                if (settings.auto && !playing) {
                    return;
                }
                if (!f.length) {
                    f = $(slides[0]);
                }
                a.removeClass('sunslide-active-slide').addClass('sunslide-hidden-slide');
                n.removeClass('sunslide-next-slide').addClass('sunslide-active-slide');
                f.removeClass('sunslide-hidden-slide').addClass('sunslide-next-slide');
                if (settings.captions) {
                    caption.text(n.find('img').attr('alt'));
                }
            }

            // add nav buttons
            if (settings.nav) {
                prev_button = $('<a href="#" title="previous slide" class="sunslide-nav previous">' + settings.prevText + '</a>');
                next_button = $('<a href="#" title="next slide" class="sunslide-nav next">' + settings.nextText + '</a>');
                prev_button.on('click', function (ev) {
                    ev.preventDefault();
                    if (settings.stopOnNav) {
                        playing = false;
                        stop();
                    }
                    resetTimer();
                    prevSlide();
                });
                next_button.on('click', function (ev) {
                    ev.preventDefault();
                    if (settings.stopOnNav) {
                        playing = false;
                        stop();
                    }
                    resetTimer();
                    nextSlide();
                });
                container.append(prev_button);
                container.append(next_button);
            }
            // add play/pause button
            if (settings.play) {
                play_button = $('<a href="#" title="Toggle automatic slide changes" class="sunslide-nav play"><svg width="1em" height="1em" viewBox="0 0 36 36" fill="#fff"><defs><path id="' + namespace + '-pause-icon" data-state="playing" d="M11,10L17,10 17,26 11,26M20,10L26,10 26,26 20,26"/><path id="' + namespace + '-play-icon" data-state="paused" d="M11,10L18,13.74 18,22.28 11,26M18,13.74L26,18 26,18 18,22.28"/></defs><use xlink:href="#' + namespace + '-' + (settings.auto ? 'pause' : 'play') + '-icon"/></svg></a>');
                play_button.on('click', function (ev) {
                    var use = $('use', $(this));
                    ev.preventDefault();
                    settings.auto = !settings.auto;
                    playing = settings.auto;
                    if (settings.auto) {
                        use.attr('xlink:href', '#' + namespace + '-pause-icon');
                    } else {
                        use.attr('xlink:href', '#' + namespace + '-play-icon');
                        resetTimer();
                    }
                });
                container.append(play_button);
            }

            // determine aspect ratios
            slides.each(function () {
                var i = $(this).find('img'),
                    w = i.width(),
                    h = i.height(),
                    r = w / h;
                if (w > max_width) {
                    max_width = w;
                }
                if (h > max_height) {
                    max_height = h;
                }
                if (r > max_ratio) {
                    max_ratio = r;
                }
                if (r < min_ratio) {
                    min_ratio = r;
                }
            });
            if (settings.ratio === 'min') {
                resize_ratio = min_ratio;
            } else if (settings.ratio === 'max') {
                resize_ratio = max_ratio;
            } else {
                resize_ratio = t.find('img:first').width() / t.find('img:first').height();
            }
            // resize to the selected ratio
            container.css('height', Math.ceil(max_width / resize_ratio) + 'px');
            $(window).on('resize orientationchange', function () {
                container.css('height', Math.ceil(container.width() / resize_ratio) + 'px');
            });

            slides.addClass('sunslide-slide sunslide-hidden-slide');
            $(slides[0]).removeClass('sunslide-hidden-slide').addClass('sunslide-active-slide');
            $(slides[1]).removeClass('sunslide-hidden-slide').addClass('sunslide-next-slide');

            if (settings.captions) {
                caption = $('<div class="sunslide-caption">' + slides.filter('.sunslide-active-slide').find('img').attr('alt') + '</div>');
                container.append(caption);
            }

            resetTimer();

            if (settings.pause) {
                container.on('mouseenter', pause).on('mouseleave', resume);
            }
        });
    };
})(jQuery, this);
