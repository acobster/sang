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
          window.console.log(attr);
        }
      };
    }]);

})();
