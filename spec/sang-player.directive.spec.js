describe('The Sang Directive', function() {
  var compile, scope, element, sang;

  beforeEach(function() {
    sang = jasmine.createSpyObj('sang',
      ['play', 'pause', 'playPause', 'previous', 'next', 'seek']);

    module(function($provide) {
      $provide.value('Sang', sang);
    });

    inject(function($compile, $rootScope) {
      compile = $compile;
      scope = $rootScope.$new();
      element = getCompiledElement();
    });
  });

  function getCompiledElement() {
    var element = angular.element('<div sang-player></div>');
    var compiledElement = compile(element)(scope);
    scope.$digest();
    return compiledElement;
  }

  it('creates a scope.sang object', function() {
    expect(scope.sang).toBeDefined();
    expect(typeof scope.sang).toBe('object');
  });
});