(function() {
'use strict';

  angular.module('sang').directive('sangPlayer', [
    'SangService',
    function(SangService) {
      return {
        restrict: 'EA',
        scope: true,
        link: function(scope, _elem, attr) {
          window.console.log('link');
          scope.sang = SangService.$new();
        }
      };
    }]);

})();
