IMAGA with wd_s
===

### Prerequisites

Because I'm bundled with Gulp, basic knowledge of the command line and the following dependencies are required: either [Yarn](https://yarnpkg.com) or [Node](https://nodejs.org) (recommended version `10.x`), [Gulp CLI](https://github.com/gulpjs/gulp-cli) (`npm install -g gulp-cli`), and [Bower](https://bower.io/) (`npm install -g bower`).

## Development

After you've installed and activated me. It's time to setup Gulp.

1) From the command line, change directories to your new theme directory

```bash
cd /your-project/wordpress/wp-content/themes/your-theme
```

2) Install theme dependencies

```bash
npm install && bower install
```

### Gulp Tasks

From the command line, type any of the following to perform an action:

`gulp watch` - Automatically handle changes to CSS, JS, SVGs, and image sprites. Also kicks off BrowserSync.

`gulp icons` - Minify, concatenate, and clean SVG icons.

`gulp i18n` - Scan the theme and create a POT file.

`gulp sass:lint` - Run Sass against WordPress code standards.

`gulp js:lint` - Run Javascript against WordPress code standards.

`gulp scripts` - Concatenate and minify javascript files.

`gulp sprites` - Generate an image sprite and the associated Sass (sprite.png).

`gulp styles` - Compile, prefix, combine media queries, and minify CSS files.

`gulp` - Runs the following tasks at the same time: i18n, icons, scripts, styles, sprites.
