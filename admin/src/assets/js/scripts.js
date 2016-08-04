var webpage = "";
var layouthistory;

function handleJsIds() {
}

function randomNumber() {
	return randomFromInterval(1, 1e6)
}
function randomFromInterval(e, t) {
	return Math.floor(Math.random() * (t - e + 1) + e)
}

function configurationElm(e, t) {
	$(".dragplaceholder").delegate(".configuration > a", "click", function(e) {
		e.preventDefault();
		var t = $(this).parent().next().next().children();
		$(this).toggleClass("active");
		t.toggleClass($(this).attr("rel"))
	});
	$(".dragplaceholder").delegate(".configuration .dropdown-menu a", "click", function(e) {
		e.preventDefault();
		var t = $(this).parent().parent();
		var n = t.parent().parent().next().next().children();
		t.find("li").removeClass("active");
		$(this).parent().addClass("active");
		var r = "";
		t.find("a").each(function() {
			r += $(this).attr("rel") + " "
		});
		t.parent().removeClass("open");
		n.removeClass(r);
		n.addClass($(this).attr("rel"))
	})
}
function removeElm() {
	$(".dragplaceholder").delegate(".remove", "click", function(e) {
		e.preventDefault();
		var elerm = $(this).parent().parent().attr('class').match(/\d\w+/);
		$('.ele_'+elerm).remove();
		if (!$(".dragplaceholder .lyrow").length > 0) {
			$(".dragplaceholder").empty();
		}
	})
}

function hideElm() {
	$(".dragplaceholder").delegate(".hide", "click", function(e) {
		e.preventDefault();
		$(this).parent().parent().toggleClass('toHide');
	})
}



function removeMenuClasses() {
	$("#menu-layoutit li button").removeClass("active")
}
function changeStructure(e, t) {
	$("#download-layout ." + e).removeClass(e).addClass(t)
}
function cleanHtml(e) {
	$(e).parent().append($(e).children().html())
}


var currentDocument = null;
var timerSave = 1000;
var stopsave = 0;
var startdrag = 0;
var demoHtml = $(".dragplaceholder").html();
var currenteditor = null;
// $(window).resize(function() {
// 	$("body").css("min-height", $(window).height() - 90);
// 	$(".dragplaceholder").css("min-height", $(window).height() - 160)
// });


function initContainer(){
	$(".dragplaceholder, .dragplaceholder .column").sortable({
		connectWith: ".column",
		opacity: .35,
		handle: ".drag",
		start: function(e,t) {
			if (!startdrag) stopsave++;
			startdrag = 1;
		},
		stop: function(e,t) {
			if(stopsave>0) stopsave--;
			startdrag = 0;
		}
	});
	configurationElm();
}



function syncElem(x, target, e){

	var thisElement = new Date().getTime();
	//clean classes from sidebar-nav
	$('.sidebar-nav .eleToPlace').removeClass('eleToPlace').removeClass('ele');
	var found=false;
	//$('.dragplaceholder .eleToPlace').parents('.dragplaceholder').andSelf()
	var eleToPl = $('.dragplaceholder.active .eleToPlace');
  var path = eleToPl.parents().andSelf().map(function(){
			var thisClass = $(this).attr('class');
			if(typeof thisClass !== 'undefined' && thisClass.match(/dragplaceholder/)){found=true;}
					if(found){
						var index = $(this).index() + 1;
						return this.nodeName.toLowerCase() + ':nth-child('+ index +')';
					}
		    }).get();
			path.shift();
			path.pop();
			// add position
	 	  var parenPAth = path.join(' > ');

		//prepare data to save
		var dataReplace=(eleToPl.html() || '');
		dataReplace=dataReplace.replace(/\[/g,'{').replace(/\]/g,'}');
		var elemeChange = dataReplace.match(/{{(.*?)}}/gm);
		for (ele in elemeChange){
			var thisElemName = elemeChange[ele].match(/{{(.*)}}/)[1];
			if(thisElemName.indexOf('=')>0){
				var thisElemArr=thisElemName.split('=')

				if(thisElemArr.length==2){
					var wordElem = thisElemArr[1].match(/\w+/);
					var newEle = '{{'+thisElemArr[0]+'.'+wordElem+'_'+thisElement+'}}';
					dataReplace=dataReplace.replace(elemeChange[ele],newEle);
				}else if(thisElemArr.length>=2){
					var wordElem = thisElemArr[1].match(/\w+/);
					var newEle = '{{'+thisElemArr[0]+'.'+wordElem+'_'+thisElement+'.'+thisElemArr[2]+'}}';
					dataReplace=dataReplace.replace(elemeChange[ele],newEle);

				}
			}else if (thisElemName.indexOf('.')>0) {
				var thisElemArrOrig=thisElemName.split('.')

				if (thisElemArrOrig.length >= 2) {
					var wordElem = thisElemArrOrig[1].match(/\w+/);
					var keiItem = thisElemArrOrig[0];
					thisElemArrOrig.shift();
					var newEle = '{{'+keiItem+'_'+thisElement+'.'+thisElemArrOrig.join('.')+'}}';
					dataReplace=dataReplace.replace(elemeChange[ele],newEle);
				}
			}else{
				var slashflag = '';
				if (thisElemName.indexOf('{') >= 0) {
					slashflag = '{'
				}
				var thisElemName = thisElemName.match(/\w+/);

				//WORK REPEATERS EXEPTIOS
				if(!/item/.test(thisElemName.input) && !/#each/.test(thisElemName.input) && !/#unless/.test(thisElemName.input) && !/\/each/.test(thisElemName.input) && !/\/unless/.test(thisElemName.input) && !/#if/.test(thisElemName.input) && !/else/.test(thisElemName.input) && !/\@index/.test(thisElemName.input) && !/\/if/.test(thisElemName.input)){
					//GUEST MENU EXCEPTION
					if (/name/.test(thisElemName.input) || /path/.test(thisElemName.input) || /sub/.test(thisElemName.input)) {
						var newEle = '{{'+thisElemName+'}}';
					} else {
						var newEle = slashflag+'{{'+thisElemName+'_'+thisElement+'}}';
					}
					dataReplace=dataReplace.replace(elemeChange[ele],newEle);
				}else if(/#each/.test(thisElemName.input)){
					//GUEST MENU EXCEPTION
					if (/#each menus/.test(thisElemName.input)) {
						var newEle = '{{'+thisElemName.input+'}}';
					} else {
						var newEle = '{{'+thisElemName.input+'_'+thisElement+'}}';
					}
					dataReplace=dataReplace.replace(elemeChange[ele],newEle);
				}else if(/if/.test(thisElemName.input)){
					var newEle = '{{'+thisElemName.input+'}}';
					dataReplace=dataReplace.replace(elemeChange[ele],newEle);
				}
			}
		}
		///FOR LIST REPEATER
		/*var elemeChangeRep = dataReplace.match(/categor\]\]/g);
		for (ele in elemeChangeRep){
			if(newEle.indexOf('.')>0){
				var thisElemArr=newEle.split('.')
				if(thisElemArr.length>=2){

				}
			}
			var newEle = 'category_'+thisElement+']]';
			dataReplace=dataReplace.replace(elemeChangeRep[ele],newEle);
		}*/
		eleToPl.html(dataReplace);
		eleToPl.removeAttr('ng-class');
		eleToPl.removeAttr('ng-repeat');

		var frontclone = eleToPl.clone();
		var summaryclone = eleToPl.clone();
		var backendclone = eleToPl.clone();
		if($(backendclone).html()){
			$(backendclone).html($(backendclone).html().replace(/{{/g,'{[{').replace(/}}/g,'}]}').replace(/\[{\[/g,'').replace(/\]}\]/g,'').replace(/\[\[/g,'{[{').replace(/\]\]/g,'}]}'));
		}


	if($('.front').hasClass('active')){
		var sum=$('.summary-end '+parenPAth)
		var back=$('.back-end '+parenPAth)
		if(back.length>1){back=back[0];};
		if(sum.length>1){sum=sum[0];};
		$(sum).append(summaryclone);
		$(back).append(backendclone);
	}else if($('.sum').hasClass('active')){
		var front=$('.front-end '+parenPAth)
		var back=$('.back-end '+parenPAth)
		if(back.length>1){back=back[0];};
		if(front.length>1){front=front[0];};
		$(front).append(frontclone);
		$(back).append(backendclone);
	}else{
		var front=$('.front-end '+parenPAth)
		var sum=$('.summary-end '+parenPAth)
		if(sum.length>1){sum=sum[0];};
		if(front.length>1){front=front[0];};
		$(front).append(frontclone);
		$(sum).append(summaryclone);
		$('.eleToPlace').html($(backendclone).html());
	}


	// REMOVE WRAPER from blockElement
	$('.summary-end .eleToPlace > .blockElement').html($('.summary-end .eleToPlace > .blockElement .summary').html());
	$('.back-end .eleToPlace > .blockElement').html($('.back-end .eleToPlace > .blockElement .backend').html());
	$('.front-end .eleToPlace > .blockElement').html($('.front-end .eleToPlace > .blockElement .frontend').html());


	$(frontclone).removeClass('eleToPlace').addClass('ele_'+thisElement);
	$(backendclone).removeClass('eleToPlace').addClass('ele_'+thisElement);
	$(summaryclone).removeClass('eleToPlace').addClass('ele_'+thisElement);
	$('.dragplaceholder .eleToPlace').removeClass('eleToPlace').addClass('ele_'+thisElement);



}

	function initLayout(){

	// $("body").css("min-height", $(window).height() - 50);
	// $(".dragplaceholder").css("min-height", $(window).height() - 130);

	$(".sidebar-nav .box").draggable({
		connectToSortable: ".column",
		helper: "clone",
		handle: ".drag",
		start: function(e,t) {
			$(this).addClass('eleToPlace').addClass('ele');
			if (!startdrag) stopsave++;
			startdrag = 1;
		},
		drag: function(e, t) {
			t.helper.width(400)
		},
		stop: function(e, t) {
			//console.log('ele_'+new Date().getTime());
			syncElem(this, t, e);
			handleJsIds();
			if(stopsave>0) stopsave--;
			startdrag = 0;
		}
	});
	$(".sidebar-nav .lyrow").draggable({
		connectToSortable: ".dragplaceholder",
		helper: "clone",
		handle: ".drag",
		start: function(e,t) {
			$(this).addClass('eleToPlace').addClass('ele');
			if (!startdrag) stopsave++;
			startdrag = 1;
		},
		drag: function(e, t) {
			t.helper.width(400)
		},
		stop: function(e, t) {
			syncElem(this, t, e);
			$(".dragplaceholder .column").sortable({
				opacity: .35,
				connectWith: ".column",
				start: function(e,t) {
					if (!startdrag) stopsave++;
					startdrag = 1;
				},
				stop: function(e,t) {
					if(stopsave>0) stopsave--;
					startdrag = 0;
				}
			});
			if(stopsave>0) stopsave--;
			startdrag = 0;
		}
	});
	initContainer();
	$('body .dragplaceholder').on("click","[data-target=#editorModal]",function(e) {
		e.preventDefault();
		currenteditor = $(this).parent().parent().parent().find('.blockElement');
		var eText = currenteditor.html();
		$('#contenteditor').html(eText)
		$("#savecontent").click(function(e) {
			e.preventDefault();
			currenteditor.html($('#contenteditor').text());
		});
	});


	$("#clear").click(function(e) {
		e.preventDefault();
		$(".dragplaceholder").empty();
	});

	$(".nav-header").click(function() {
			$(".sidebar-nav .boxes, .sidebar-nav .rows").hide();
			$(this).next().slideDown()
		});

	removeElm();
	hideElm();

}
initLayout();
