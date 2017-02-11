var HTMLMediaElement = { HAVE_METADATA: 1, readyState: 4 }

describe('The Sang Service', function() {
  var $http, $httpBackend, audio, sang;

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
    module('audio');
    module('sang');

    audio = jasmine.createSpyObj('audio',
      ['play', 'pause', 'addEventListener']);
    audio.duration = 180;
    audio.currentTime = 0;

    // DI
    module(function($provide) {
      $provide.value('Audio', audio);
    });

    inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');
      sang = $injector.get('Sang', {'$http': $httpBackend});
    });

    resolveTracks();
  });

  describe('initialization', function() {
    it('registers `ended` and `timeupdate` event handlers', function() {
      expect(audio.addEventListener).toHaveBeenCalledWith('timeupdate', jasmine.any(Function));
      expect(audio.addEventListener).toHaveBeenCalledWith('ended', jasmine.any(Function));
    });
  });

  describe('resolve', function() {
    it('should have resolved the tracklist', function() {
      expect(sang.tracks[0].src).toBe('/track-one.mp3?client_id=1234');
    });
  });

  describe('play', function() {
    it('calls audio.play()', function() {
      expect(sang.playing).toBe(false);

      sang.play();
      expect(sang.playing).toBe(true);
      expect(audio.play).toHaveBeenCalled();
    });

    describe('with idx argument', function() {
      it('calls audio.play() with the track src', function() {
        sang.play(1);
        expect(sang.playing).toBe(true);
        expect(audio.src).toBe('/track-two.mp3?client_id=1234');
        expect(audio.play).toHaveBeenCalled();
      });

      it('wraps around', function() {
        sang.play(3);
        expect(audio.src).toBe('/track-one.mp3?client_id=1234');
        expect(audio.play).toHaveBeenCalled();
        sang.play(4);
        expect(audio.src).toBe('/track-two.mp3?client_id=1234');
        expect(audio.play).toHaveBeenCalled();
      });
    });
  });

  describe('pause', function() {
    it('calls audio.pause()', function() {
      sang.playing = true;

      sang.pause();
      expect(sang.playing).toBe(false);
      expect(audio.pause).toHaveBeenCalled();
    });
  });

  describe('playPause', function() {
    describe('when already playing', function() {
      it('calls audio.pause()', function() {
        sang.playing = true;

        sang.playPause();
        expect(sang.playing).toBe(false);
        expect(audio.pause).toHaveBeenCalled();
      });
    });

    describe('when paused', function() {
      it('calls audio.play()', function() {
        expect(sang.playing).toBe(false)

        sang.playPause();
        expect(sang.playing).toBe(true);
        expect(audio.play).toHaveBeenCalled();
      });

      describe('when paused on track two', function() {
        beforeEach(function() {
          // track two
          sang.index = 1;
          sang.currentTrack = sang.tracks[1];
        });

        it('calls audio.play() with track two', function() {
          expect(sang.playing).toBe(false);

          sang.playPause();
          expect(sang.playing).toBe(true);
          expect(audio.src).toBe('/track-two.mp3?client_id=1234');
          expect(audio.play).toHaveBeenCalled();
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
        expect(audio.src).toBe('/track-two.mp3?client_id=1234');
        expect(audio.play).toHaveBeenCalled();
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
        expect(audio.src).toBe('/track-three.mp3?client_id=1234');
        expect(audio.play).toHaveBeenCalled();
      });
    });
  });

  describe('seek', function() {
    it('sets the currentTime based on X-value of click event', function() {
      audio.readyState = 'ready';
      var target = { offsetWidth: 100 };

      // test a reasonable set of offsetX values against
      // their expected resulting audio.currentTime values
      var offsetsAndTimes = [
        { offsetX: 25, currentTime: 45 },
        { offsetX: 0, currentTime: 0 },
        { offsetX: 61, currentTime: 109.8 },
        { offsetX: 100, currentTime: 180 },
      ];

      offsetsAndTimes.forEach(function(v) {
        // simulate a click event
        sang.seek({
          type: 'click',
          offsetX: v.offsetX,
          target: target
        });
        // check we got our maths right
        expect(audio.currentTime).toBe(v.currentTime);
      });
    });
  });
});
