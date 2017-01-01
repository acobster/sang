(function() {
'use strict';

angular.module('sang').directive('sangPlayer', [
  'Sang',
  function(Sang) {
    return {
      restrict: 'EA',
      scope: false,
      link: function(scope, _elem, attr) {
        var sang = Sang;
        sang.clientId = attr.clientId;
        sang.url = attr.url;

        if(attr.clientId && attr.url) {
          sang.resolve(attr.url);
        }

        scope.sang = sang;
      }
    };
  }]);

})();
