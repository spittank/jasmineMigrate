/*globals jasmine:false, spyOn:true, it:true */

//This module is to ease the transition from jasmine 1 to jasmine 2
var jasmineMigrate = {},
	originalCreateSpy,
	originalIt;

jasmineMigrate.addMatchers = function (matchers) {
	"use strict";
	Object.keys(matchers).forEach(function (matcherName) {
		var matcher = matchers[matcherName],
			migratedMatcher = {};

		migratedMatcher[matcherName] = function (util, customEqualityTesters) {
			return {
				compare: function (actual) {
					var matcherArguments,
						thisForMigratedMatcher,
						matcherResult,
						passed;

					//In Jasmine 2 the 1. parameter of the compare function 
					//is the actual value.
					//With Jasmine 1 the actual value was a property of the matchers this
					//Therefore modify the given arguments array and remove actual
					matcherArguments = [].slice.call(arguments);
					matcherArguments.splice(0, 1);

					//Add actual to the this object we'll be passing to the matcher
					thisForMigratedMatcher = {
						actual: actual
					};

					//Now call the original matcher aufgerufen, with the modified
					//arguments and thisForMigratedMatcher which will be applied to
					//the matcher
					passed = matcher.apply(thisForMigratedMatcher, matcherArguments);

					matcherResult = {
						pass: passed,
						message: thisForMigratedMatcher.message
					};
					return matcherResult;
				}
			};
		};

		jasmine.addMatchers(migratedMatcher);
	});
};

originalCreateSpy = jasmine.createSpy;

jasmine.createSpy = function () {
	"use strict";
	var mySpy;

	function addRecentCallProperty(propertyOwner) {
		Object.defineProperty(propertyOwner, 'mostRecentCall', {
			get: function () { return propertyOwner.calls.mostRecent(); },
			set: function () {
				//Only a wrapper to make the function look like a property
			},
			enumerable: true,
			configurable: false
		});
	}

	function addOldAndMethodsToSpy(spy) {
		spy.andCallFake = function () {
			var result = spy.and.callFake.apply(spy, arguments);
			addRecentCallProperty(result);
			return result;
		};

		spy.andCallThrough = function () {
			var result = spy.and.callThrough.apply(spy, arguments);
			addRecentCallProperty(result);
			return result;
		};

		spy.andReturn = function () {
			var result = spy.and.returnValue.apply(spy, arguments);
			addRecentCallProperty(result);
			return result;
		};
	}

	mySpy = originalCreateSpy.apply(originalCreateSpy, arguments);

	addOldAndMethodsToSpy(mySpy);

	return mySpy;
};

jasmine.Clock = {};
jasmine.Clock.installMock = function () {
	"use strict";
	jasmine.clock().install();
};

jasmine.Clock.uninstallMock = function () {
	"use strict";
	jasmine.clock().uninstall();
};

jasmine.Clock.tick = function (ticks) {
	"use strict";
	jasmine.clock().tick(ticks);
};

originalIt = it;

it = function (specDescription, specFunction) {
	"use strict";
	//We need the current Spec description for generated tests. Current Spec was removed:
	//https://groups.google.com/forum/#!topic/jasmine-js/IyZt7cPmBWo

	originalIt.call(originalIt, specDescription, function () {
		var thisForIt,
			executeAfterIt = [];

		jasmine.getEnv().currentSpec = {
			description: specDescription
		};

		thisForIt = {
			after: function (afterFunction) {
				executeAfterIt.push(afterFunction);
			}
		};

		try {
			specFunction.apply(thisForIt);
		}
		finally {
			executeAfterIt.forEach(function (afterIt) {
				afterIt();
			});
		}
	});
};
