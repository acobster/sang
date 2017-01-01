describe('The Sang Directive', function() {
  var compile, scope, element, sang,
      playlistUrl = 'https://soundcloud.com/jaspertmusic/sets/website';

  beforeEach(function() {
    module('sang');

    sang = jasmine.createSpyObj('sang',
      ['play', 'pause', 'playPause', 'previous', 'next', 'seek', 'resolve']);

    module(function($provide) {
      $provide.value('Sang', sang);
    });

    injectDirectiveHtml('<div sang-player'
      +' client-id="asdf1234"'
      +' url="'+playlistUrl+'">'
      + '<span ng-click="sang.playPause()"></span></div>');
  });

  function injectDirectiveHtml(directiveHtml) {
    inject(function($compile, $rootScope) {
      compile = $compile;
      scope = $rootScope.$new();
      element = getCompiledElement(directiveHtml);
    });
  }

  function getCompiledElement(html) {
    var compiledElement = compile( angular.element(html) )(scope);
    scope.$digest();
    return compiledElement;
  }


  it('creates a scope.sang object', function() {
    expect(scope.sang).toBeDefined();
    expect(typeof scope.sang).toBe('object');
  });

  it('resolves the SoundCloud URL attr using the clientId attr', function() {
    expect(scope.sang.clientId).toBe('asdf1234');
    expect(scope.sang.url).toBe(playlistUrl);
    expect(scope.sang.resolve).toHaveBeenCalledWith(playlistUrl);
  });

  it('exposes sang methods on the scope', function() {
    expect(typeof scope.sang.play).toBe('function');
    expect(typeof scope.sang.pause).toBe('function');
    expect(typeof scope.sang.playPause).toBe('function');
    expect(typeof scope.sang.previous).toBe('function');
    expect(typeof scope.sang.next).toBe('function');
    expect(typeof scope.sang.seek).toBe('function');

    // CLICK ON THE THING
    angular.element(element.children()[0]).triggerHandler('click');

    expect(sang.playPause).toHaveBeenCalled();
  });
});
