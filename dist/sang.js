(function(){
'use strict';

angular.module('player', [])
  .config(['$provide', function($provide) {
    $provide.factory('AudioPlayer', function() {
      return new Player();
    });
  }]);

angular.module('sang', ['player'])
  .config(['$provide', function($provide) {
    $provide.factory('Sang', ['AudioPlayer', '$http', function(AudioPlayer, $http) {

      var sang = {
        clientId: '',
        resolve: function(playlistUrl) {
          var self = this;
          $http.get('https://api.soundcloud.com/resolve', {
            params: {
              client_id: this.clientId,
              url: playlistUrl
            }
          }).then(function(response) {
            self.tracks = self.mapTracks(response.data.tracks);
          });
        },
        mapTracks: function(tracks) {
          var self = this;
          return tracks.map(function(track) {
            var src = track.stream_url,
                // massage query string
                sep = src.indexOf('?') === -1 ? '?' : '&';

            // resolve to fully streamable URL
            track.src = src + sep + 'client_id=' + self.clientId;

            return track;
          });
        },
        player: AudioPlayer,
        currentTrack: {},
        currentTime: 0,
        duration: 0,
        tracks: [],
        index: 0,
        playing: false,
        play: function(idx) {
          if(typeof idx === 'number' && this.tracks.length) {
            this.index = idx % this.tracks.length;
            this.currentTrack = this.tracks[this.index];
          }

          this.playing = true;
          this.player.play(this.currentTrack.src);
        },
        pause: function() {
          this.playing = false;
          this.player.pause();
        },
        playPause: function(idx) {
          if(this.playing) {
            this.pause();
          } else {
            this.play(idx);
          }
        },
        previous: function() {
          this.index--;
          if(this.playing) {
            this.play(this.index);
          }
        },
        next: function() {
          this.index++;
          if(this.playing) {
            this.play(this.index);
          }
        },
        seek: function(e) {
          this.player.seek(e);
        },
      };

      sang.player.addEventListener('timeupdate', function() {
        // if ()
      });

      return sang;
    }]);
  }]);
})();

(function() {
'use strict';
  angular.module('sang').directive('sangPlayer', [
    'Sang',
    function(SangService) {
      return {
        restrict: 'EA',
        scope: false,
        link: function(scope, _elem, attr) {
          scope.sang = SangService;
        }
      };
    }]);

})();
