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
          this.tracks = [{src: 'track one'}, {src: 'track two'}, {src: 'track three'}];
        },
        player: AudioPlayer,
        currentTrack: {},
        tracks: [], // TODO
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
