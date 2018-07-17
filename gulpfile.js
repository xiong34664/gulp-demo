/*
 * @Author: iceStone
 * @Date:   2016-01-27 10:21:56
 * @Last Modified by: xiong34664
 * @Last Modified time: 2018-07-16 09:13:18
 */

'use strict';


// 在gulpfile中先载入gulp包，因为这个包提供了一些API
var gulp = require('gulp');
var less = require('gulp-less');
var cssnano = require('gulp-cssnano');

// 1. LESS编译 压缩 --合并没有必要，一般预处理CSS都可以导包
gulp.task('style', function () {
    // 这里是在执行style任务时自动执行的
    gulp.src(['src/css/*.less', '!src/styles/_*.less'])
        .pipe(less())
        .pipe(cssnano())
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

//生成精灵图 50 为配置图的大小
var spritesmith = require('gulp.spritesmith');
 
gulp.task('sprite', function () {
  var spriteData = gulp.src('src/images/*.png').pipe(spritesmith({
    imgName: './images/sprite.png',
    cssName: './css/sprite.css',
    padding:0,//合并时两个图片的间距
    algorithm: 'binary-tree',//注释1
    // cssTemplate:"handlebarsStr.css"//注释2
    cssTemplate: function (data) {
        var sizeW = 50;
        var sizeH = 50;
        var w = data['items'][0].total_width/data['items'][0].width*sizeW
        var h = data['items'][0].total_height/data['items'][0].height*sizeH
        var arr=[`[class^=icon]{ display: inline-block;background-size: ${w}px ${h}px;background-repeat: no-repeat;}`];
        data.sprites.forEach(function (sprite) {
            arr.push(".icon-"+sprite.name+
            "{" +
            "background-image: url('"+sprite.escaped_image+"');"+
            "background-position: "+parseInt(sprite.px.offset_x)*sizeW/parseInt(sprite.px.width)+"px "+parseInt(sprite.px.offset_y)*sizeH/parseInt(sprite.px.height)+"px;"+
            "width:"+sizeW+"px;"+
            "height:"+sizeH+"px;"+
            "}");
        });
        return arr.join("");
    }
  }));
  return spriteData.pipe(gulp.dest('dist/'));
});

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

// 2. JS合并 压缩混淆
gulp.task('script', function() {
  gulp.src('src/scripts/*.js')
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// 3. 图片复制
gulp.task('image', function() {
  gulp.src('src/images/*.*')
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

var htmlmin = require('gulp-minify-html');
// 4. HTML
gulp.task('html', function() {
  gulp.src('src/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

var browserSync = require('browser-sync');
gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: ['dist']
    },
  }, function(err, bs) {
    console.log(bs.options.getIn(["urls", "local"]));
  });

  gulp.watch('src/css/*.less',['style']);
  gulp.watch('src/scripts/*.js',['script']);
  gulp.watch('src/images/*.*',['image']);
  gulp.watch('src/images/*.*',['sprite']);
  gulp.watch('src/*.html',['html']);
});
// var browserSync = require('browser-sync');
// // 设置任务---使用代理
// gulp.task('browser-sync', function () {
//     browserSync.init({
//         files:['**'],
//         proxy:'localhost', // 设置本地服务器的地址
//         port:8080  // 设置访问的端口号
//     });
// });
