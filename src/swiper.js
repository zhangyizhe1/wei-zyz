function Swipe(){
	this.id = obj.id;
	this.cas = document.getElementById(this.id);
	this.context = this.cas.getContext("2d");
	this._w = obj._w;
	this._h = obj._h;
	this.radius = obj.radius;
	this.posX = 0;
	this.posY = 0;
	this.isMouseDown = false;
	this.coverType = obj.coverType;
	this.mask = obj.mask;
	this.percent = obj.percent;
	this.callback = obj.callback; //用户自定义的函数名
	// 先调用初始化
	this.init();
	// 添加事件
	this.addEvent();
}
// 设置canvas的图形组合方式，并填充指定的颜色
Swipe.prototype.init = function(){
	// 如果coverType是颜色
	if(this.coverType === "color"){
		this.context.fillStyle= this.mask;
		this.context.fillRect(0,0,this._w,this._h);
		this.context.globalCompositeOperation = "destination-out";
	}
	// 如果coverType是图片
	if( this.coverType === "img" ){
		var img01 = new Image();
		img01.src = this.mask;
		var that = this;
		img01.onload = function(){
			that.context.drawImage(this,0,0,this.width,this.height,0,0,that._w,that._h);
			that.context.globalCompositeOperation = "destination-out";
		};
		
	}
	
};
// 添加自定义监听事件，pc端为mousedown，mousemove，移动端为touchstart，touchmove
Swipe.prototype.addEvent = function(){
	// 判断是移动端还是pc端,true为移动端，false为pc端
	this.device = (/android|iphone|ipad|webos|blackberry/i.test(window.navigator.userAgent.toLowerCase() ));
	console.log(this.device);
	this.clickEvent = this.device ? "touchstart" : "mousedown";
	this.moveEvent = this.device ? "touchmove" : "mousemove";
	this.endEvent = this.device ? "touchend" : "mouseup";
	// 添加鼠标点击或手机单击事件
	var that = this;
	this.cas.addEventListener(this.clickEvent,function(evt){
		var event = evt || window.event;
		// 获取鼠标点击或手指点击时的视口坐标	
		that.posX = that.device ? event.touches[0].clientX : event.clientX;
		that.posY = that.device ? event.touches[0].clientY : event.clientY;
		// 点击时调用画圆的方法
		that.drawArc(that.posX,that.posY);
		that.isMouseDown = true; //鼠标按下
	});
	this.cas.addEventListener(this.moveEvent,function(evt){
		if( !that.isMouseDown ){
			return false;
		}else{
			var event = evt || window.event;
			// 调用canvas画线，将鼠标移动时坐标作为lineTo()参数传入。注意上一次点击时的坐标点作为画线的起始坐标
			var x2 = that.device ? event.touches[0].clientX : event.clientX;
			var y2 = that.device ? event.touches[0].clientY : event.clientY;
			that.drawLine(that.posX,that.posY,x2,y2);
			//鼠标边移动边画线，因此需要把上一次移动的点作为下一次画线的起始点
			that.posX = x2;
			that.posY = y2;		
		}
	});
	this.cas.addEventListener(this.endEvent,function(evt){
		that.isMouseDown = false;
		// 检测透明点的个数
		var n=that.getPercent();
		//调用同名的全局函数
		that.callback.call(null,n);
		if(n>that.percent){
			// alert("擦除完成");
			that.context.clearRect(0,0,that._w,that._h);
		}
	});
	// cas.addEventListener("mouseup",function(evt){
	// 	isMouseDown = false; //鼠标未按下
	// 	//检测透明点的个数
	// 	var n = getPercent(context);
	// 	if( n > 60 ){
	// 		alert("擦除完成");
	// 		context.clearRect(0,0,_w,_h);
	// 	}
	// })
	// // 获取透明点占总像素点的百分比
	// function getPercent(context){
	// 	var num=0;
	// 	var imgData = context.getImageData(0,0,_w,_h);
	// 	for (var i = 0; i < imgData.data.length; i+=4) {
	// 		if( imgData.data[i+3] == 0){
	// 			num++;
	// 		}
	// 	}
	// 	var percent = (num/(_w*_h))*100;
	// 	console.log( "透明点占总面积的百分比："+ percent.toFixed(2) + "%" );
	// 	return percent;
	// };
	
};
Swipe.prototype.drawArc = function(x1,y1){
	this.context.save();
	this.context.beginPath();
	this.context.arc(x1,y1,this.radius,0,2*Math.PI);
	this.context.fillStyle = "red";
	this.context.fill();
	this.context.stroke();
	this.context.restore();
};
Swipe.prototype.drawLine = function(x1,y1,x2,y2){
		this.context.save();
		this.context.beginPath();
		this.context.moveTo(x1,y1);
		this.context.lineTo(x2,y2);
		this.context.lineWidth =this.radius*2;  //笔刷线条的大小
		this.context.lineCap = "round"; // 连接点效果为圆的
		this.context.strokeStyle = "rgb(255,125,40)"; //笔刷的颜色
		this.context.stroke();	
		this.context.restore();
};
Swipe.prototype.getPercent = function(){
	this.num = 0;
	this.imgData = this.context.getImageData(0,0,this._w,this._h);
	for(var i=0;i< this.imgData.data.length;i+=4){
		if(this.imgData.data[i+3] === 0){
			this.num++;
		}
	}
	this.transpercent = (this.num/(this._w*this._h))*100;
	console.log("透明点占总面积的半分比" + this.transpercent.toFixed(2)+"%");
	return this.transpercent;
};





// var cas = document.getElementById('cas');
// var context = cas.getContext("2d");
// var _w = 375;
// var _h = 667;
// var posX = 0; //保存鼠标点击时的x坐标
// var posY = 0; //保存鼠标点击时的y坐标
// var isMouseDown = false; //鼠标状态，没按下为false，按下为true
// window.onload = function(){
// 	context.fillStyle="#666";
// 	context.fillRect(0,0,_w,_h);
// 	context.globalCompositeOperation = "destination-out";
// }
// cas.addEventListener("mousedown",function(evt){
// 	var event = evt || window.event;
// 	posX = event.clientX;
// 	posY = event.clientY;
// 	drawArc(context,posX,posY);
// 	isMouseDown = true; //鼠标按下
// });
// cas.addEventListener("mousemove",function(evt){
// 	if( !isMouseDown ){
// 		return false;
// 	}else{
// 		var event = evt || window.event;
// 		// 调用canvas画线，将鼠标移动时坐标作为lineTo()参数传入。注意上一次点击时的坐标点作为画线的起始坐标
// 		drawLine(context,posX,posY,event.clientX,event.clientY);
// 		//鼠标边移动边画线，因此需要把上一次移动的点作为下一次画线的起始点
// 		posX = event.clientX;
// 		posY = event.clientY;		
// 	}
// })
// cas.addEventListener("mouseup",function(evt){
// 	isMouseDown = false; //鼠标未按下
// 	//检测透明点的个数
// 	var n = getPercent(context);
// 	if( n > 60 ){
// 		alert("擦除完成");
// 		context.clearRect(0,0,_w,_h);
// 	}
// })
// // 获取透明点占总像素点的百分比
// function getPercent(context){
// 	var num=0;
// 	var imgData = context.getImageData(0,0,_w,_h);
// 	for (var i = 0; i < imgData.data.length; i+=4) {
// 		if( imgData.data[i+3] == 0){
// 			num++;
// 		}
// 	}
// 	var percent = (num/(_w*_h))*100;
// 	console.log( "透明点占总面积的百分比："+ percent.toFixed(2) + "%" );
// 	return percent;
// };
// 
// // 画圆，圆心坐标为鼠标的坐标点
// function drawArc(context, x1,y1){
// 	context.save();
// 	context.beginPath();
// 	context.arc(x1,y1,20,0,2*Math.PI);
// 	context.fillStyle = "red";
// 	context.fill();
// 	context.stroke();
// 	context.restore();
// }
// function drawLine(context, x1,y1,x2,y2){
// 	context.save();
// 	context.beginPath();
// 	context.moveTo(x1,y1);
// 	context.lineTo(x2,y2);
// 	context.lineWidth =40;  //笔刷线条的大小
// 	context.lineCap = "round"; // 连接点效果为圆的
// 	context.strokeStyle = "rgb(255,125,40)"; //笔刷的颜色
// 	context.stroke();	
// 	context.restore();
// 
// }
// 