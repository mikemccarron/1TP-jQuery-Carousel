module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		meta:{
			dev: 'src',
			dist: 'dist'
		}

		bower:{
			install: {
				options: {
					cleanup: true,
					targetDir: './<%= meta.dev %>/js/libs'
				}
			}
		},

		copy:{
			public: {
				files: [
					 {
						expand: true,
						flatten: false,
						cwd: './<%= meta.dev %>/',
						src: ['**', '!sass/**', '!**/scripts.js'],
						dest: '<%= meta.dist %>/'
					 }
				]
			},
		},

		clean:{
			bowerFiles: ['<%= meta.dev %>/js/libs/normalize-scss/'],
			fonts: ['<%= meta.dist %>/fonts/']
		},

		concurrent: {
			dev: {
				options: {
					logConcurrentOutput: true
				},
				tasks: ['compass:dev']
			}
		},

		compass: {
			dist:{
				options: {
					sassDir: './<%= meta.dev %>/sass',
					cssDir: './<%= meta.dist %>/css',
					outputStyle: 'compressed',
					environment: 'production'
				}
			},
			dev:{
				options: {
					sassDir: './<%= meta.dev %>/sass',
					cssDir: './<%= meta.dist %>/css',
					outputStyle: 'expanded',
					environment: 'development',
					watch: true
				}
			}
		},

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
				compress: {
					drop_console: true
				},
				sourceMap: true,
				preserveComments: false
			},
			js:{
				options: {
					mangle: {
						except: ['jQuery', 'Backbone']
					}
				},
				files: [{
					expand: true,
					cwd: '<%= meta.dev %>/js',
					src: '*.js',
					dest: '<%= meta.dist %>/js'
				}]
			},
			plugins:{
				options: {
					mangle: {
						except: ['jQuery', 'Backbone']
					}
				},
				files: [{
					expand: true,
					cwd: '<%= meta.dist %>/js/plugins',
					src: 'plugins.min.js',
					dest: './<%= meta.dist %>/js/plugins'
				}]
			}
		},

		jshint:{
			files: ['<%= meta.dev %>/js/*.js']
		},

		concat: {
			options: {
				 separator: ';'
			},
			plugins: {
				src: './<%= meta.dev %>/js/plugins/**/*.js',
				dest: './<%= meta.dist %>/js/plugins/plugins.min.js'
			}
		},

		tmp:{},

		watch: {
			js:{
				files: ['<%= meta.dev %>/js/*.js'],
				tasks: ['jshint', 'uglify:js']
			},
			newPlugins: {
				files: ['<%= meta.dev %>/js/plugins/**'],
				tasks: ['concat:plugins', 'uglify:plugins']
			},
			newFonts: {
				files: ['<%= meta.dev %>/fonts/**'],
				tasks: ['clean:fonts', 'copy:fonts']
			}
		}
	});

	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-imagemin');

	grunt.registerTask('debug', ['watch:newPlugins']);
	grunt.registerTask('default', ['tmp']);
}