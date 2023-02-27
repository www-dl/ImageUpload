function DragImgUpload(id, options) {
    this.me = $(id);
    var defaultOpt = {
        boxWidth: '150px',
        boxHeight: 'auto'
    }
    // margin -5px 0 0 -5px;  设置-5是因为cssInit中border为2px以及padding为3px
    this.preview = $(
            '<div id="preview"><div id="ul_delBtn" style="display: none;position: fixed;margin: -5px 0 0 -5px;z-index:99999999;background-color:#ff0000;opacity: 0.7;border-radius:9px 0%;color:#fff;width:90px;text-align:center;">点击删除</div><img src="jiahao.png" class="img-responsive"  style="width: 100%;height: auto;" alt="" title=""></div>');
        // : $('<div id="preview"><img src="../../../../inspinia/js/plugins/uploadImg/img/jiahao.png" class="img-responsive"  style="width: 100%;height: auto;" alt="" title=""></div>');
    this.opts = $.extend(true, defaultOpt, {}, options);
    this.init();
    this.callback = this.opts.callback;
    this.onError = this.opts.onError;
    this.onDelete = this.opts.onDelete;
}

//定义原型方法
DragImgUpload.prototype = {
    init: function () {
        this.me.append(this.preview);
        this.me.append(this.fileupload);
        this.cssInit();
        this.eventClickInit();
        if (this.opts.iniImage) {
            let url = this.opts.iniImage();
            console.log(url);
            this.iniImage(url);
        }
    },
    cssInit: function () {
        this.me.css({
            'width': this.opts.boxWidth,
            'height': this.opts.boxHeight,
            'border': 'dotted 2px #999',
            'border-radius': '9px',
            'background-color': '#f7f8fa',
            'padding': '3px',
            'cursor': 'pointer'
        })
        this.preview.css({
            'height': '100%',
            'overflow': 'hidden'
        })

    },
    iniImage: function (url) {
        let self = this;
        if (url){
            self.me.find("#ul_delBtn").css("display","");
            self.me.find("img").attr("src", url);
        }

    },
    onDragover: function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    },
    onDrop: function (e) {
        let self = this;
        let imgUrl = this.me.find("img").attr("src");
        if (imgUrl && imgUrl.indexOf("uploadImg/img/jiahao.png") < 0) {
            console.log("onDrop img exist");
            e.stopPropagation();
            e.preventDefault();
            if (self.onError) {
                self.onError("图片已经存在，请先删除");
            }
            return false;
        }
        e.stopPropagation();
        e.preventDefault();
        let fileList = e.dataTransfer.files; //获取文件对象
        // do something upload
        if (fileList.length == 0) {
            return false;
        }

        self.validImage(fileList[0]);

    },

    validImage: function (file) {
        let self = this;
        //检测文件是不是图片
        if (file.type.indexOf('image') === -1) {
            self.onError("您拖的不是图片！");
            return false;
        }
        if (!file.name.match(/.jpg|.gif|.png|.jpeg|.pdf|.bmp/i)) {　　 //判断上传文件格式
            self.onError("上传的图片格式不正确，请重新选择");
            return false;
        }
        let imgSize = Math.floor((file.size) / 1024);
        let fileSize = self.opts.fileSize;
        if (imgSize > fileSize) {
            if (self.onError) {
                self.onError("上传大小不能超过" + fileSize + "K");
            }
            return false;
        }
        if (self.opts.size) {
            let reader = new FileReader();
            reader.index = 0;
            reader.readAsDataURL(file); //转成base64
            reader.fileName = file.name;
            reader.files = file;
            reader.onload = function (e) {
                let image = new Image();
                image.src = e.target.result;
                image.onload = function () {
                    let imgWidth = this.width;
                    let imgHeight = this.height;
                    console.log(self.opts);
                    let width = self.opts.size.width;
                    let height = self.opts.size.height;
                    console.log(width + "---" + height);
                    console.log(imgWidth + "---" + imgHeight);
                    if (width != imgWidth || height != imgHeight) {
                        if (self.onError) {
                            self.onError("图片尺寸不正确");
                        }
                        return false;
                    } else {
                        self.loadImage(file);
                    }
                }
            }
        } else {
            self.loadImage(file);
        }

    },
    loadImage: function (file) {
        var self = this;
        let img = window.URL.createObjectURL(file);
        let filename = file.name; //图片名称

        self.me.find("img").attr("src", img);
        self.me.find("img").attr("title", filename);
        if (self.callback) {
            self.callback(file);
        }

    },
    reset: function () {
        let self = this;
        self.me.find("img").attr("src",
            "jiahao.png");
        self.me.find("img").attr("title", null);
    },
    eventClickInit: function () {
        let self = this;
        this.me.unbind().click(function () {
            self.createImageUploadDialog();
        })
        var dp = this.me[0];
        dp.addEventListener('dragover', function (e) {
            self.onDragover(e);
        });
        dp.addEventListener("drop", function (e) {
            self.onDrop(e);
        });

    },
    onChangeUploadFile: function () {
        let fileInput = this.fileInput;
        let files = fileInput.files;
        if (files.length == 0) {
            return false;
        }
        let file = files[0];
        this.validImage(file);

    },
    createImageUploadDialog: function () {
        let self = this;
        let imgUrl = this.me.find("img").attr("src");
        if (imgUrl && imgUrl.indexOf("jiahao.png") < 0) {

            if (self.onDelete) {
                self.onDelete(imgUrl);
            }
            return false;
        }
        var fileInput = this.fileInput;
        if (!fileInput) {
            //创建临时input元素
            fileInput = document.createElement('input');
            //设置input type为文件类型
            fileInput.type = 'file';
            //设置文件name
            fileInput.name = 'ime-images';
            //允许上传多个文件
            fileInput.multiple = true;
            fileInput.onchange = this.onChangeUploadFile.bind(this);
            this.fileInput = fileInput;
        }
        //触发点击input点击事件，弹出选择文件对话框
        fileInput.click();
    }

}