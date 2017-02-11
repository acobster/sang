(function(){
'use strict';

angular.module('audio', [])
  .config(['$provide', function($provide) {
    $provide.factory('Audio', function() {
      var audio = window.audio || document.createElement('audio');
      return audio;
    });
  }]);

angular.module('sang', ['audio'])
  .config(['$provide', function($provide) {
    $provide.factory('Sang', ['Audio', '$http', '$timeout', '$rootScope', function(Audio, $http, $timeout, $rootScope) {

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
            self.currentTrack = self.tracks[0];
            $rootScope.$broadcast('resolved');
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
            this.index = idx < 0 ?
              this.tracks.length - 1 :
              idx % this.tracks.length;
            this.currentTrack = this.tracks[this.index];
          }

          this.playing = true;

          // set audio source only if it differs from the current track's,
          // to avoid resetting currentTime
          if (this.audio.src !== this.currentTrack.src) {
            this.audio.src = this.currentTrack.src;
          }
          this.audio.play();

          // get metadata when audio is ready
          var self = this;
          this.audio.addEventListener('loadedmetadata', function(event) {
            self.duration = event.target.duration;
            self.currentTime = event.target.currentTime;
          });
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
          if (this.currentTime > 3.0) {
            // user has had a few seconds to skip back;
            // they probably want to restart the current track
            this.currentTime = 0;
            this.audio.src = this.currentTrack.src;
            this.play();
          } else {
            // move to previous track
            this.index--;
            if (this.playing) {
              this.play(this.index);
            }
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
        }
      };

      sang.audio.addEventListener('timeupdate', function(event) {
        sang.currentTime = event.target.currentTime;
        $rootScope.$broadcast('timeupdate', sang.currentTime);
      });

      sang.audio.addEventListener('ended', function() {
        sang.next();
      });

      return sang;
    }]);
  }]);
})();
