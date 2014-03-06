module.exports = function( grunt ) {
	"use strict";

	function readOptionalJSON( filepath ) {
		var data = {};
		try {
			data = grunt.file.readJSON( filepath );
		} catch ( e ) {}
		return data;
	}

	var gzip = require( "gzip-js" ),
		srcHintOptions = readOptionalJSON( "src/.jshintrc" );

	// The concatenated file won't pass onevar
	// But our modules can
	delete srcHintOptions.onevar;

	grunt.initConfig({
		pkg: grunt.file.readJSON( "package.json" ),
		dst: readOptionalJSON( "dist/.destination.json" ),
		compare_size: {
			files: [ "dist/jquery-ajax.js", "dist/jquery-ajax.min.js" ],
			options: {
				compress: {
					gz: function( contents ) {
						return gzip.zip( contents, {} ).length;
					}
				},
				cache: "build/.sizecache.json"
			}
		},
		build: {
			all: {
				dest: "dist/jquery-ajax.js",
				minimum: [
					"core"
				],
				// Exclude specified modules if the module matching the key is removed
				removeWith: {
					ajax: [ "manipulation/_evalUrl" ],
					callbacks: [ "deferred" ],
					css: [ "effects", "dimensions", "offset" ],
					sizzle: [ "css/hiddenVisibleSelectors", "effects/animatedSelector" ]
				}
			}
		},
		bowercopy: {
			options: {
				clean: true
			},
			src: {
				files: {
					"src/sizzle/dist": "sizzle/dist",
					"src/sizzle/test/data": "sizzle/test/data",
					"src/sizzle/test/unit": "sizzle/test/unit",
					"src/sizzle/test/index.html": "sizzle/test/index.html",
					"src/sizzle/test/jquery.js": "sizzle/test/jquery.js"
				}
			},
			tests: {
				options: {
					destPrefix: "test/libs"
				},
				files: {
					"qunit": "qunit/qunit",
					"require.js": "requirejs/require.js",
					"sinon/fake_timers.js": "sinon/lib/sinon/util/fake_timers.js"
				}
			}
		},
		jsonlint: {
			pkg: {
				src: [ "package.json" ]
			},

			jscs: {
				src: [ ".jscs.json" ]
			},

			bower: {
				src: [ "bower.json" ]
			}
		},
		jshint: {
			all: {
				src: [
					"src/**/*.js", "Gruntfile.js", "test/**/*.js", "build/tasks/*",
					"build/{bower-install,release-notes,release}.js"
				],
				options: {
					jshintrc: true
				}
			},
			dist: {
				src: "dist/jquery-ajax.js",
				options: srcHintOptions
			}
		},
		jscs: {
			src: "src/**/*.js",
			gruntfile: "Gruntfile.js",
			tasks: "build/tasks/*.js"
		},
		testswarm: {
			tests: "ajax attributes callbacks core css data deferred dimensions effects event manipulation offset queue selector serialize support traversing Sizzle".split( " " )
		},
		watch: {
			files: [ "<%= jshint.all.src %>" ],
			tasks: "dev"
		},
		uglify: {
			all: {
				files: {
					"dist/jquery-ajax.min.js": [ "dist/jquery-ajax.js" ]
				},
				options: {
					preserveComments: false,
					sourceMap: "dist/jquery-ajax.min.map",
					sourceMappingURL: "jquery-ajax.min.map",
					report: "min",
					beautify: {
						ascii_only: true
					},
					banner: "/*! jQuery v<%= pkg.version %> | " +
						"(c) 2005, <%= grunt.template.today('yyyy') %> jQuery Foundation, Inc. | " +
						"jquery.org/license */",
					compress: {
						hoist_funs: false,
						loops: false,
						unused: false
					}
				}
			}
		}
	});

	// Load grunt tasks from NPM packages
	require( "load-grunt-tasks" )( grunt );

	// Integrate jQuery specific tasks
	grunt.loadTasks( "build/tasks" );

	// Alias bower to bowercopy
	grunt.registerTask( "bower", "bowercopy" );

	// Short list as a high frequency watch task
	grunt.registerTask( "dev", [ "build:*:*", "jshint", "jscs" ] );

	// Default grunt
	grunt.registerTask( "default", [ "jsonlint", "dev", "uglify", "dist:*", "compare_size" ] );
};
