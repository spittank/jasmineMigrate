/*globals jasmine:false, spyOn:true */

//This module is to ease the transition from jasmine 1 to jasmine 2
var jasmineMigrate = {},
	originalSpyOn;

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

originalSpyOn = spyOn;

spyOn = function () {
	"use strict";
	var spyOnResult = originalSpyOn.apply(originalSpyOn, arguments);

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

	spyOnResult.andCallFake = function () {
		var result = spyOnResult.and.callFake.apply(spyOnResult, arguments);
		addRecentCallProperty(result);
		return result;
	};

	spyOnResult.andCallThrough = function () {
		var result = spyOnResult.and.callThrough.apply(spyOnResult, arguments);
		addRecentCallProperty(result);
		return result;
	};

	return spyOnResult;
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