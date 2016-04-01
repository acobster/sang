describe('The Sang Service', function() {
  beforeEach(function() {
    module('player');
    module('sang');

    this.player = jasmine.createSpyObj('player',
      ['play', 'pause', 'playPause', 'previous', 'next', 'seek']);

    // DI
    var _this = this;
    module(function($provide) {
      $provide.value('AudioPlayer', _this.player);
    });
    inject(function($injector) {
      _this.sang = $injector.get('Sang');
    });
  });

  describe('play', function() {
    it('calls player.play()', function() {
      expect(this.sang.playing).toBe(false);

      this.sang.play();
      expect(this.sang.playing).toBe(true);
      expect(this.player.play).toHaveBeenCalled();
    });

    describe('with idx argument', function() {
      it('calls player.play() with the track src', function() {
        this.sang.play(1);
        expect(this.sang.playing).toBe(true);
        expect(this.player.play).toHaveBeenCalledWith('track two');
      });

      it('wraps around', function() {
        this.sang.play(3);
        expect(this.player.play).toHaveBeenCalledWith('track one');
        this.sang.play(4);
        expect(this.player.play).toHaveBeenCalledWith('track two');
      });
    });
  });

  describe('pause', function() {
    it('calls player.pause()', function() {
      this.sang.playing = true;

      this.sang.pause();
      expect(this.sang.playing).toBe(false);
      expect(this.player.pause).toHaveBeenCalled();
    });
  });

  describe('playPause', function() {
    describe('when already playing', function() {
      it('calls player.pause()', function() {
        this.sang.playing = true;

        this.sang.playPause();
        expect(this.sang.playing).toBe(false);
        expect(this.player.pause).toHaveBeenCalled();
      });
    });

    describe('when paused', function() {
      it('calls player.play()', function() {
        expect(this.sang.playing).toBe(false)

        this.sang.playPause();
        expect(this.sang.playing).toBe(true);
        expect(this.player.play).toHaveBeenCalled();
      });

      describe('when paused on track two', function() {
        beforeEach(function() {
          // track two
          this.sang.index = 1;
          this.sang.currentTrack = this.sang.tracks[1];
        });

        it('calls player.play() with track two', function() {
          expect(this.sang.playing).toBe(false);

          this.sang.playPause();
          expect(this.sang.playing).toBe(true);
          expect(this.player.play).toHaveBeenCalledWith('track two');
        });
      });
    });
  });

  describe('previous', function() {
    it('goes to the previous track', function() {
      this.sang.index = 1;
      this.sang.previous();
      expect(this.sang.index).toBe(0);
    });

    describe('when playing', function() {
      it('plays the previous track', function() {
        this.sang.playing = true;
        this.sang.index = 2;

        this.sang.previous();
        expect(this.sang.index).toBe(1);
        expect(this.sang.playing).toBe(true);
        expect(this.player.play).toHaveBeenCalledWith('track two');
      });
    });
  });

  describe('next', function() {
    it('goes to the next track', function() {
      this.sang.index = 0;
      this.sang.next();
      expect(this.sang.index).toBe(1);
    });

    describe('when playing', function() {
      it('plays the previous track', function() {
        this.sang.playing = true;
        this.sang.index = 1;

        this.sang.next();
        expect(this.sang.index).toBe(2);
        expect(this.sang.playing).toBe(true);
        expect(this.player.play).toHaveBeenCalledWith('track three');
      });
    });
  });

  describe('seek', function() {
    it('passes the seek Event to player.seek()', function() {
      var e = {event: 'object'};
      this.sang.seek(e);
      expect(this.player.seek).toHaveBeenCalledWith(e);
    });
  });
});
