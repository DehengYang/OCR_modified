/**
  * This module creates a 200x200 pixel canvas for a user to draw
  * digits. The digits can either be used to train the neural network
  * or to test the network's current prediction for that digit.
  *
  * To simplify computation, the 200x200px canvas is translated as a 20x20px
  * canvas to be processed as an input array of 1s (white) and 0s (black) on
  * on the server side. Each new translated pixel's size is 10x10px
  *
  * When training the network, traffic to the server can be reduced by batching
  * requests to train based on BATCH_SIZE.
  */
var ocrDemo = {
    CANVAS_WIDTH: 400,
    TRANSLATED_WIDTH: 20,
    PIXEL_WIDTH: 20, // TRANSLATED_WIDTH = CANVAS_WIDTH / PIXEL_WIDTH
    BATCH_SIZE: 1,
    code: "",

    // Server Variables
    PORT: "8000",
    HOST: "http://localhost",

    // Colors
    BLACK: "#000000",
    BLUE: "#0000ff",

    trainArray: [],
    trainingRequestCount: 0,
    img:'123',

    onLoadFunction: function() {
//        alert("welcome to OCR!");
//        document.write("welcome.");
        this.resetCanvas();
    },

    resetCanvas: function() {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');

//        var my_gradient=ctx.createLinearGradient(0,0,300,0);
//        my_gradient.addColorStop(0,"black");
//        my_gradient.addColorStop(1,"green");
//        ctx.fillStyle=my_gradient;
//        ctx.fillRect(20,20,150,100);

        this.data = [];
        ctx.fillStyle = "#FFAEB9";//"#C1FFC1";
        ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_WIDTH);
        var matrixSize = 400;
        while (matrixSize--) this.data.push(0);
        this.drawGrid(ctx);

        canvas.onmousemove = function(e) { this.onMouseMove(e, ctx, canvas) }.bind(this);
        canvas.onmousedown = function(e) { this.onMouseDown(e, ctx, canvas) }.bind(this);
        canvas.onmouseup = function(e) { this.onMouseUp(e, ctx) }.bind(this);
    },

    drawGrid: function(ctx) {
        for (var x = this.PIXEL_WIDTH, y = this.PIXEL_WIDTH; x < this.CANVAS_WIDTH; x += this.PIXEL_WIDTH, y += this.PIXEL_WIDTH) {
            ctx.strokeStyle = "#8B8378";
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.CANVAS_WIDTH);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.CANVAS_WIDTH, y);
            ctx.stroke();
        }
    },

    onMouseMove: function(e, ctx, canvas) {
        if (!canvas.isDrawing) {
            return;
        }
//        alert("alert(canvas.offsetLeft);"+canvas.offsetLeft + " "+canvas.offsetTop+ " "+e.clientX
//        +" "+e.clientY+"offsetX ：" + e.offsetX  + "offsetY"+e.offsetY);
//        this.fillSquare(ctx, e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
//        this.fillSquare(ctx, e.clientX , e.clientY);
        this.fillSquare(ctx, e.offsetX , e.offsetY);

    },

    onMouseDown: function(e, ctx, canvas) {
        canvas.isDrawing = true;
//        this.fillSquare(ctx, e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
//        this.fillSquare(ctx, e.clientX , e.clientY);
        this.fillSquare(ctx, e.offsetX , e.offsetY);

    },

    onMouseUp: function(e) {
        canvas.isDrawing = false;
    },

    fillSquare: function(ctx, x, y) {
        var xPixel = Math.floor(x / this.PIXEL_WIDTH);
        var yPixel = Math.floor(y / this.PIXEL_WIDTH);
        this.data[((xPixel)  * this.TRANSLATED_WIDTH + yPixel) ] = 1;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(xPixel * this.PIXEL_WIDTH, yPixel * this.PIXEL_WIDTH, this.PIXEL_WIDTH, this.PIXEL_WIDTH);
    },

    train: function() {
        var digitVal = document.getElementById("digit").value;
        if (!digitVal || this.data.indexOf(1) < 0) {
            alert("Please type and draw a digit value in order to train the network");
            return;
        }
        this.trainArray.push({"y0": this.data, "label": parseInt(digitVal)});
        this.trainingRequestCount++;

//         for(var i in this.trainArray)
//        {
//            document.write(i+" "+this.trainArray + " " +  this.trainArray[0]['label'] +  "<br />");
//        }

        // Time to send a training batch to the server.
        if (this.trainingRequestCount == this.BATCH_SIZE) {
            alert("Sending training data to server...");
            var json = {
                trainArray: this.trainArray,
                train: true
            };

            this.sendData(json);
            this.trainingRequestCount = 0;
            this.trainArray = [];
        }
    },

    test: function() {
        if (this.data.indexOf(1) < 0) {
            alert("Please draw a digit in order to test the network");
            return;
        }
        var json = {
            image: this.data,
            predict: true
        };
        // test by dale
//        for(var i in this.data)
//        {
//            document.write(i+" "+this.data[i]+"<br />");
//        }
        this.sendData(json);
    },

     showImg: function(){
        //在input file内容改变的时候触发事件

        var file = $('#filed').get(0).files[0];
        alert('file: '+file)
        var reader = new FileReader();
        reader.readAsDataURL(file);
//        alert("run show img.");

//        reader.onload = function(e){ // reader onload start
//                // ajax 上传图片
//                $.post("server.php", { img: e.target.result},function(ret){
//                    if(ret.img!=''){
//                        alert('upload success');
//                        $('#showimg').html('<img src="' + ret.img + '">');
//                    }else{
//                        alert('upload fail');
//                    }
//                },'json');
//        }

/*
        reader.onload=function(e){
        //读取成功后返回的一个参数e，整个的一个进度事件
//            console.log(e);
        //选择所要显示图片的img，要赋值给img的src就是e中target下result里面
        //的base64编码格式的地址
//            var result=document.getElementById("result");
            $('#imgshow').get(0).src = e.target.result;
            this.img=e.target.result;
            alert("the img11:" + this.img);
            var json = {
                img: this.img,
                ocr: true
            };
            alert("now send data:" + this.img);
            this.sendData(json);
            alert("finish json ocr:" + this.img);
          }
*/









//        this.img=reader.readAsDataURL(file).result;
//        alert("the img11:" + this.img);

//        $('#filed').change(function(){
//        //获取input file的files文件数组;
//        //$('#filed')获取的是jQuery对象，.get(0)转为原生对象;
//        //这边默认只能选一个，但是存放形式仍然是数组，所以取第一个元素使用[0];
//          var file = $('#filed').get(0).files[0];
//        //创建用来读取此文件的对象
//          var reader = new FileReader();
//        //使用该对象读取file文件
//          reader.readAsDataURL(file);
//          alert("run show img.")
//
//          this.img=reader.readAsDataURL(file).result;
//        //读取文件成功后执行的方法函数
//          reader.onload=function(e){
//        //读取成功后返回的一个参数e，整个的一个进度事件
//            console.log(e);
//        //选择所要显示图片的img，要赋值给img的src就是e中target下result里面
//        //的base64编码格式的地址
//            $('#imgshow').get(0).src = e.target.result;
//            this.img=e.target.result;
////            alert("the img11:" + this.img);
//          }
//        })

//        alert("this is running show.js")



//        alert("the img: " + this.img);

     },

    showSample: function() {
        var json = {
            show: true
        };
        this.resetCanvas();
        this.sendData(json);
    },

    receiveResponse: function(xmlHttp) {
        if (xmlHttp.status != 200) {
            alert("Server returned status " + xmlHttp.status);
            return;
        }
        var responseJSON = JSON.parse(xmlHttp.responseText);
        if (xmlHttp.responseText && responseJSON.type == "test") {
            alert("The neural network predicts you wrote a \'" + responseJSON.result + '\'');
        }

        if (xmlHttp.responseText && responseJSON.type == "ocr") {
            var code=responseJSON.result;
//            alert("the code is : "+code);
//            var codeShow = $('#codeShow');
//            codeShow.value=code;
            this.code=code;
            console.log(code)
//            alert("codeShow : "+code);
        }

        if (xmlHttp.responseText && responseJSON.type == "show") {
//            alert("show image" + responseJSON.result[0] + '\'');
            var dataShow=responseJSON.result;
            var label=dataShow[dataShow.length-1];
//            alert("dataShow len: "+dataShow.length)

            this.data=[];
            var matrixSize = 400;
            while (matrixSize--) this.data.push(0);

            for (var i=0;i<(dataShow.length-1);i++){ // 391  399
                var xPixel=Math.floor(i/20);
                var yPixel=i%20;
                if(dataShow[i]>0){
                    var canvas = document.getElementById('canvas');
                    var ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(xPixel * this.PIXEL_WIDTH, yPixel * this.PIXEL_WIDTH, this.PIXEL_WIDTH, this.PIXEL_WIDTH);
                    this.data[((xPixel)  * this.TRANSLATED_WIDTH + yPixel) ] = 1;
                }
                else{
                    this.data[((xPixel)  * this.TRANSLATED_WIDTH + yPixel) ] = 0;
                    var a=((xPixel)  * this.TRANSLATED_WIDTH + yPixel);
                    if(a>400) alert (i+" the index of data >400:" + a+ " xPixel: "+xPixel+" yPixel:"+yPixel)
                }
            }
            alert("the label is : "+label);
        }
    },

    onError: function(e) {
        alert("Error occurred while connecting to server: " + e.target.statusText);
    },

    sendData: function(json) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open('POST', this.HOST + ":" + this.PORT, false);
        xmlHttp.onload = function() { this.receiveResponse(xmlHttp); }.bind(this);
        xmlHttp.onerror = function() { this.onError(xmlHttp) }.bind(this);
        var msg = JSON.stringify(json);
        xmlHttp.setRequestHeader('Content-length', msg.length);
        xmlHttp.setRequestHeader("Connection", "close");
        xmlHttp.send(msg);
    }
}