Date.prototype.toString = function(format){
	return $.formatDate(this, format);
};

$(function(){
	var $address = $("select.address");

	$(":file").getFile(function(file){
		$(this).val("").parent().attr("data-value",file.name)
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload =function(e){
			onLoadData( JSON.parse(reader.result) );
		};
	});

	var updateDownload = function(data){
		$(".btn.download").removeClass("hide").prop("href",URL.createObjectURL(new Blob([JSON.stringify(data)])));
	};
	var onLoadData = function(data){
		updateDownload(data);
		var sort = [];
		var threads = {};
		$.each(data,function(i,sms){
			if( !threads[sms.address] ){
				threads[sms.address] = {count:0,address:sms.address,list:[]};
				sort.push(threads[sms.address]);
			}
			sms.date = new Date(sms.date*1);
			threads[sms.address].count++;
			threads[sms.address].list.push(sms);
		});

		$.each(threads,function(address,thread){
			thread.list.sort(function(a,b){return b.date - a.date});
		});

		sort = sort.sort(function(a,b){return b.count - a.count});

		$.each(sort,function(i,thread){
			$address.append($("<option></option>").html(thread.count + " - " + thread.address ).data("thread",thread))
		});
	};

	var updateTable = (function(){
		var $tbody = $("tbody");
		var $temp = $tbody.find("tr").remove();

		return function( thread ){
			$tbody.empty();
			$.each(thread.list,function(i,sms){
				sms.index = i+1;
				var data = abc( sms.body );
				data = $.extend($.extend({},sms),data);
				$tbody.append($temp.clone().setHtml(data).addClass(getClass(data)));
			});
		};
	})();
	
	var getClass = function(info){
		var arr = [];
		for( var i in info ){
			info[i] && arr.push(i);
		}
		return arr.join(" ");
	};

	var abc = function( body ){
		var info = {} , match;
		var card = body.match(/尾号\d+/);
		if( !card )return info;

		info.card = card[0].match(/\d+/)[0];
		//07月09日19时32分消费45.20元，
		if( match = body.match(/\d+月\d+日\d+(:|时)\d+分?[^\d]+[\d\.,]+[^，。]+[，。]/g) ){
			match = match[0]
			info.date = match.match(/^\d+月\d+日\d+(:|时)\d+分?/)[0];
			match = match.replace(info.date,'');
			info.type = match.match(/^[^\d]+/)[0];
			match = match.replace(info.type,'');
			info.cost = match.replace(/[，。]$/,'');
		}

		if( match = body.match(/可用余额为?[\d\.,]+[^。]+。/g)){
			info.balance = match[0].match(/[\d\.,]+[^。]*/)[0];
		}

		//代付成功，交易金额0.01元
		if( match = body.match(/退货成功，交易金额[\d\.,]+[^。]*/) ){
			info.type = match[0].substr(0,2);
			info.cost = match[0].match(/[\d\.,]+[^。]*/)[0]
		}

		if( match = body.match(/代付成功，交易金额[\d\.,]+[^。]*/) ){
			info.type = match[0].substr(0,2);
			info.cost = match[0].match(/[\d\.,]+[^。]*/)[0]
		}

		//账单全部应还款额为127.60元
		if( match = body.match(/账单全部应还款额为?[\d\.,]+[^，。]*/) ){
			info.type = match[0].substr(0,2);
			info.cost = match[0].match(/[\d\.,]+[^，。]*/)[0]
		}

		//额度临时调整为人民币8,000.00元，
		if( match = body.match(/额度临时调整为[^\d]+[\d\.,]+[^，。]*/) ){
			info.type = match[0].substr(0,2);
			info.cost = match[0].match(/[\d\.,]+[^，。]*/)[0]
		}

		return info;
	};
	$address.change(function(e){
		var $option = $(this).find(":selected");
		updateTable( $option.data("thread") );
	});
	
	$(":radio").change(function(){
		$("tbody").prop('class',this.value).find("tr:visible").each(function(i){ $(this).setHtml({index:i+1})  })
	});

	$(".btn.ip").click(function(){
		var $box = $.box3({
			message:"loading...",
			title:"服务IP"
		}).find(".modal-body").addClass("url-list");
		$.get("/upload/url",function(urls){
			var $ol = $("<ol></ol>");
			$.each(urls,function(i,url){
				$ol.append($("<li>").html(url));
			});
			$box.html($ol);
		},"json");

		$box.on("click","li",function(){
			$box.find("li").removeClass("activity");
			$(this).addClass("activity");

			var $img = $box.find("img");
			if(!$img.length){
				$img = $("<img />");
				$box.append($img);
				$img.load(function(){
					$img.css("opacity",1);
				});
			};
			$img.css("opacity",0.5);
			$img.prop("src","http://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=" + $(this).html());
		});
	});
	io('ws://' + location.host).on("data",function(data){
		onLoadData(JSON.parse(data));
		$(".modal").data("box").hide();
	});
});