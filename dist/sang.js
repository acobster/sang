(function() {
'use strict';

  angular.module('sang').directive('sangPlayer', [
    'SangService',
    function(SangService) {
      return {
        restrict: 'A',
        scope: true,
        link: function(scope, _elem, attr) {
          scope.sang = SangService;
        }
      };
    }]);

})();
