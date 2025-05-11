const { src, dest, series, parallel, watch } = require("gulp");
const fileInclude = require("gulp-file-include");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const del = require("del");
const browserSync = require("browser-sync").create();
const path = require("path"); // Thêm path để xử lý unlink ảnh

// Đường dẫn nguồn và đích
const paths = {
	html: {
		src: ["src/html/**/*.html", "!src/html/partials/**"],
		watch: "src/html/**/*.html",
		dest: "dist/",
	},
	styles: {
		src: "src/scss/main.scss",
		watch: "src/scss/**/*.scss",
		dest: "dist/assets/css",
	},
	vendorStyles: {
		src: "src/scss/vendor.scss",
		watch: "src/scss/vendor.scss",
		dest: "dist/assets/css",
	},
	scripts: {
		src: "src/js/main.js",
		watch: "src/js/**/*.js",
		dest: "dist/assets/js",
	},
	vendorScripts: {
		src: ["node_modules/jquery/dist/jquery.min.js", "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", "node_modules/slick-carousel/slick/slick.min.js", "node_modules/jquery-match-height/dist/jquery.matchHeight-min.js", "node_modules/jquery-validation/dist/jquery.validate.min.js", "node_modules/wowjs/dist/wow.min.js", "node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js", "node_modules/select2/dist/js/select2.min.js"],
		dest: "dist/assets/js",
	},
	vendorCss: {
		src: [
			"node_modules/bootstrap/dist/css/bootstrap.min.css",
			"node_modules/animate.css/animate.min.css",
			"node_modules/slick-carousel/slick/slick.css",
			"node_modules/slick-carousel/slick/slick-theme.css",
			"node_modules/@fancyapps/fancybox/dist/jquery.fancybox.css",
			"node_modules/select2/dist/css/select2.min.css",
			"node_modules/wowjs/css/libs/animate.css" // nếu cần fallback
		],
		dest: "dist/assets/css"
	},	
	images: {
		src: "src/images/**/*",
		watch: "src/images/**/*",
		dest: "dist/assets/images",
	},
	fonts: {
		src: "src/fonts/**/*",
		watch: "src/fonts/**/*",
		dest: "dist/assets/fonts",
	}
};

// Xóa thư mục dist
function clean() {
	return del(["dist"]);
}

// Xử lý HTML
function html() {
	return src(paths.html.src)
		.pipe(fileInclude({ prefix: "@@", basepath: "@file" }))
		.pipe(dest(paths.html.dest))
		.pipe(browserSync.stream());
}

// Xử lý CSS
function styles() {
	return src(paths.styles.src).pipe(sass().on("error", sass.logError)).pipe(cleanCSS()).pipe(rename("main.css")).pipe(dest(paths.styles.dest)).pipe(browserSync.stream());
}

// Xử lý vendor CSS
function vendorStyles() {
	return src(paths.vendorStyles.src)
		.pipe(sass({ url: false }).on("error", sass.logError))
		.pipe(cleanCSS())
		.pipe(rename("vendorStyle.css"))
		.pipe(dest(paths.vendorStyles.dest))
		.pipe(browserSync.stream());
}
function vendorCss() {
	return src(paths.vendorCss.src)
		.pipe(concat("vendor.css"))
		.pipe(cleanCSS())
		.pipe(dest(paths.vendorCss.dest))
		.pipe(browserSync.stream());
}

// Xử lý JS
function scripts() {
	return src(paths.scripts.src).pipe(uglify()).pipe(rename("main.js")).pipe(dest(paths.scripts.dest)).pipe(browserSync.stream());
}

// Bundle vendor JS
function vendorScripts() {
	return src(paths.vendorScripts.src).pipe(concat("vendor.js")).pipe(dest(paths.vendorScripts.dest)).pipe(browserSync.stream());;
}

// Xử lý ảnh
function images() {
	return src(paths.images.src).pipe(imagemin()).pipe(dest(paths.images.dest)).pipe(browserSync.stream());
}

// Xử lý xóa ảnh
function removeDeletedImage(filePath) {
	const filePathFromSrc = path.relative(path.resolve("src/images"), filePath);
	const destFilePath = path.resolve(paths.images.dest, filePathFromSrc);
	del(destFilePath);
}

// Xử lý font chữ
function fonts() {
	return src(paths.fonts.src).pipe(dest(paths.fonts.dest)).pipe(browserSync.stream());
}

// Serve + Watch
function serve() {
	browserSync.init({
		server: { baseDir: "dist" },
		port: 3000,
		notify: false,
	});

	watch(paths.html.watch, html);
	watch("src/html/partials/**/*.html", html);
	watch(paths.styles.watch, styles);
	watch(paths.vendorStyles.watch, vendorStyles);
	watch(paths.scripts.watch, scripts);

	const imageWatcher = watch(paths.images.watch);
	imageWatcher.on("add", images);
	imageWatcher.on("change", images);
	imageWatcher.on("unlink", removeDeletedImage);

	watch(paths.fonts.watch, fonts);
}

// Tasks
exports.clean = clean;
exports.build = series(clean, parallel(html, styles, vendorStyles, vendorCss, scripts, vendorScripts, images, fonts));
exports.default = series(exports.build, serve);
