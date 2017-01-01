(function(){
'use strict';

angular.module('audio', [])
  .config(['$provide', function($provide) {
    $provide.factory('Audio', function() {
      var audio = global.audio || document.createElement('audio');
      return audio;
    });
  }]);

angular.module('sang', ['audio'])
  .config(['$provide', function($provide) {
    $provide.factory('Sang', ['Audio', '$http', '$timeout', function(Audio, $http, $timeout) {

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
                separator = src.indexOf('?') === -1 ? '?' : '&';

            // resolve to fully streamable URL
            track.src = src + separator + 'client_id=' + self.clientId;

            return track;
          });
        },
        audio: Audio,
        tracks: [],
        currentTrack: {},
        currentTime: 0,
        duration: 0,
        index: 0,
        playing: false,

        play: function(idx) {
          if (typeof idx === 'number' && this.tracks.length) {
            // wrap tracklist at the end
            this.index = idx % this.tracks.length;
            this.currentTrack = this.tracks[this.index];
          }

          this.playing = true;
          this.audio.src = this.currentTrack.src;
          this.audio.play();

          this.duration = this.audio.duration;
          this.currentTime = this.audio.currentTime;
        },
        pause: function() {
          this.playing = false;
          this.audio.pause();
        },
        playPause: function(idx) {
          if (this.playing) {
            this.pause();
          } else {
            this.play(idx);
          }
        },
        previous: function() {
          this.index--;
          if (this.playing) {
            this.play(this.index);
          }
        },
        next: function() {
          this.index++;
          if (this.playing) {
            this.play(this.index);
          }
        },
        seek: function(e) {
          if (!this.audio.readyState) return false;
          var percent = e.offsetX / e.target.offsetWidth || (e.layerX - e.target.offsetLeft) / e.target.offsetWidth;
          var time = percent * this.audio.duration || 0;
          this.audio.currentTime = time;
        },
      };

      sang.audio.addEventListener('timeupdate', function(event) {
        sang.currentTime = event.target.currentTime;
      });

      sang.audio.addEventListener('ended', function() {
        sang.next();
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
