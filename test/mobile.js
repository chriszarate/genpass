module('GenPass mobile version');

// Enumerate jQuery selectors for caching.
var $iframe = $('#GP');
var $el = {};
var selectors =
  [
    'Passwd',
    'Domain',
    'Len',
    'CaseLower',
    'CaseUpper',
    'CaseMixed',
    'Generate',
    'Output'
  ];


var testMobileVersion = function () {

  // Populate selector cache.
  $.each(selectors, function (i, val) {
    $el[val] = $('#' + val, $iframe[0].contentWindow.document);
  });

  // Create click event.
  var clickEvent = document.createEvent('Event');
  clickEvent.initEvent('click', true, true);

  test('Password generation', function () {

    expect(5);

    // Set initial form values.
    $el.Passwd.val('test');
    $el.Domain.val('https://login.example.com');
    $el.Len.val('10');
    $el.CaseLower.prop('checked', true);

    // Send click event and test output.
    $el.Generate[0].dispatchEvent(clickEvent);
    ok($el.Output.text() === '74ee384f47', 'Generated "74ee384f47".');

    // Change case to uppercase.
    $el.CaseUpper.prop('checked', true);

    // Send click event and test output.
    $el.Generate[0].dispatchEvent(clickEvent);
    ok($el.Output.text() === '74EE384F47', 'Generated "74EE384F47".');

    // Change case to mixed.
    $el.CaseMixed.prop('checked', true);

    // Send click event and test output.
    $el.Generate[0].dispatchEvent(clickEvent);
    ok($el.Output.text() === '74Ee384F47', 'Generated "74Ee384F47".');

    // Change length to 2 (test input validation).
    $el.Len.val('2');

    // Send click event and test output.
    $el.Generate[0].dispatchEvent(clickEvent);
    ok($el.Output.text() === '74Ee', 'Generated "74Ee".');

    // Change length to 100 (test input validation).
    $el.Len.val('100');

    // Send click event and test output.
    $el.Generate[0].dispatchEvent(clickEvent);
    ok($el.Output.text() === '74Ee384F478f3F213543460085566075', 'Generated "74Ee384F478f3F213543460085566075".');

  });

  test('Local storage', function () {

    expect(2);
    ok(localStorage.getItem('Len') === '32', 'Password length value stored.');
    ok(localStorage.getItem('Case') === 'mixed', 'Password case setting stored.');

  });

};

// Load tests.
testMobileVersion();
