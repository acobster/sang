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

      return {
        clientId: '',
        resolve: function(playlistUrl) {
          var self = this;
          $http.get('https://api.soundcloud.com/resolve', {
            params: {
              client_id: this.clientId,
              url: playlistUrl
            }
          }).then(function(response) {
            window.console.log('response');
            window.console.log(response);
            self.tracks = response.tracks;
          });
        },
        player: AudioPlayer,
        currentTrack: {},
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
        // TODO add audio event listeners
      };
    }]);
  }]);
})();
