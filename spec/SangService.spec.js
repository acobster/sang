describe('The Sang Service', function() {
  var $http, $httpBackend, player, sang, foo = 0;

  function resolveTracks() {
    $httpBackend.expectGET('https://api.soundcloud.com/resolve?client_id=1234&url=https:%2F%2Fsoundcloud.com%2Fjaspertmusic%2Fsets%2Fwebsite')
      .respond({
        tracks: [
          {stream_url: '/track-one.mp3'},
          {stream_url: '/track-two.mp3'},
          {stream_url: '/track-three.mp3'}
        ]
      });
    sang.clientId = '1234';
    sang.resolve('https://soundcloud.com/jaspertmusic/sets/website');
    $httpBackend.flush();
  }

  beforeEach(function() {
    module('player');
    module('sang');

    player = jasmine.createSpyObj('player',
      ['play', 'pause', 'playPause', 'previous', 'next', 'seek']);

    // DI
    module(function($provide) {
      $provide.value('AudioPlayer', player);
    });

    inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');
      sang = $injector.get('Sang', {'$http': $httpBackend});
    });

    resolveTracks();
  });

  describe('resolve', function() {
    it('should have resolved the tracklist', function() {
      expect(sang.tracks[0].src).toBe('/track-one.mp3?client_id=1234');
    });
  });

  describe('play', function() {
    it('calls player.play()', function() {
      expect(sang.playing).toBe(false);

      sang.play();
      expect(sang.playing).toBe(true);
      expect(player.play).toHaveBeenCalled();
    });

    describe('with idx argument', function() {
      it('calls player.play() with the track src', function() {
        sang.play(1);
        expect(sang.playing).toBe(true);
        expect(player.play).toHaveBeenCalledWith('/track-two.mp3?client_id=1234');
      });

      it('wraps around', function() {
        sang.play(3);
        expect(player.play).toHaveBeenCalledWith('/track-one.mp3?client_id=1234');
        sang.play(4);
        expect(player.play).toHaveBeenCalledWith('/track-two.mp3?client_id=1234');
      });
    });
  });

  describe('pause', function() {
    it('calls player.pause()', function() {
      sang.playing = true;

      sang.pause();
      expect(sang.playing).toBe(false);
      expect(player.pause).toHaveBeenCalled();
    });
  });

  describe('playPause', function() {
    describe('when already playing', function() {
      it('calls player.pause()', function() {
        sang.playing = true;

        sang.playPause();
        expect(sang.playing).toBe(false);
        expect(player.pause).toHaveBeenCalled();
      });
    });

    describe('when paused', function() {
      it('calls player.play()', function() {
        expect(sang.playing).toBe(false)

        sang.playPause();
        expect(sang.playing).toBe(true);
        expect(player.play).toHaveBeenCalled();
      });

      describe('when paused on track two', function() {
        beforeEach(function() {
          // track two
          sang.index = 1;
          sang.currentTrack = sang.tracks[1];
        });

        it('calls player.play() with track two', function() {
          expect(sang.playing).toBe(false);

          sang.playPause();
          expect(sang.playing).toBe(true);
          expect(player.play).toHaveBeenCalledWith('/track-two.mp3?client_id=1234');
        });
      });
    });
  });

  describe('previous', function() {
    it('goes to the previous track', function() {
      sang.index = 1;
      sang.previous();
      expect(sang.index).toBe(0);
    });

    describe('when playing', function() {
      it('plays the previous track', function() {
        sang.playing = true;
        sang.index = 2;

        sang.previous();
        expect(sang.index).toBe(1);
        expect(sang.playing).toBe(true);
        expect(player.play).toHaveBeenCalledWith('/track-two.mp3?client_id=1234');
      });
    });
  });

  describe('next', function() {
    it('goes to the next track', function() {
      sang.index = 0;
      sang.next();
      expect(sang.index).toBe(1);
    });

    describe('when playing', function() {
      it('plays the previous track', function() {
        sang.playing = true;
        sang.index = 1;

        sang.next();
        expect(sang.index).toBe(2);
        expect(sang.playing).toBe(true);
        expect(player.play).toHaveBeenCalledWith('/track-three.mp3?client_id=1234');
      });
    });
  });

  describe('seek', function() {
    it('passes the seek Event to player.seek()', function() {
      var e = {event: 'object'};
      sang.seek(e);
      expect(player.seek).toHaveBeenCalledWith(e);
    });
  });
});
