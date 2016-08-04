app.controller('layoutCtrl', [ '$scope', '$rootScope', '$http', '$location', '$stateParams', '$log', 'growl',
		function($scope, $rootScope, $http, $location, $stateParams, $log, growl){

			/// INIT VALS
			$scope.layout=[];
			$scope.activeslide = 'Front End';
			$scope.title="";
			$scope.groups=commonVal.groups;
			$http.post('/api/blocks')
			.then(function(res){
				delete res.data.logged
				//	for(dat in res.data) $scope.totalLoop += res.data[dat].length;

				$scope.totalLoop = Object.keys(res.data).length;
				$scope.frontBlocks = res.data;

				$scope.ctypeEle = commonVal.menus;

			})
			var a = 0;
			$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
					a++;
					if(a!=$scope.totalLoop)return false;
					var s = document.createElement('script'); // use global document since Angular's $document is weak
					s.src = 'assets/js/scripts.js';
					document.body.appendChild(s);
			});

			$scope.$on('initFinish', function() {
				$scope.groups = commonVal.groups;
			});

			//// LOAD CTYPE CONTENT
			if($stateParams.params.indexOf('/edit')!=-1) {
				var ctypeSep=$stateParams.params.split('/');
				var ctypePatch= (ctypeSep[2] || '');
				var ctypeType= (ctypeSep[0] || '');
				//if(getParams.match(/(add|edit)/g)){ctypePatch=ctypePatch.split('/')[0]}
				$http.post('/api/ctype/'+ctypeType+'/'+ctypePatch)
				.then(function(res){
					if(typeof res.data!='undefined' && res.data && typeof res.data.template!='undefined'){
						$scope.title=res.data.data[0].name;
						$scope.icon=(res.data.data[0].content[0] && res.data.data[0].content[0]!==null&&res.data.data[0].content[0].icon!==null)?res.data.data[0].content[0].icon:'';
						$('.front-end.dragplaceholder').html(JSON.parse(res.data.template.htmlFront));
						$('.summary-end.dragplaceholder').html(JSON.parse(res.data.template.htmlSumm));
						$('.back-end.dragplaceholder').html(JSON.parse(res.data.template.htmlBack));
					}

				});
			}


			$scope.frontend = function() {
				$scope.activeslide = 'Front End';

			}
			$scope.summaryend = function() {
				$scope.activeslide = 'Summary';

			}
			$scope.backend = function() {
				$scope.activeslide = 'Back End';

			}

			/// SAVE TEMPLATE
			$scope.saveTemplate = function() {
				if($scope.title!=""){


					//NG MODELS FOR INPUT BOXES
					$('.back-end.dragplaceholder input, .back-end.dragplaceholder textarea, .back-end.dragplaceholder option, .back-end.dragplaceholder select').each(function(e,i){
						if($(this).hasClass('input-file')){
							var thisVal = $(this).attr('name');
							if((typeof thisVal!==null || typeof thisVal!=='undefined') && /{\[{(.*)}\]}/.test(thisVal)){
								var newEle = thisVal.match(/{\[{(.*)}\]}/)[1];
								if (/summary_file|unique_file/.test(thisVal)) {
									$(this).attr('file-model', 'setData.'+newEle);

								} else{
									$(this).attr('file-model', $(this).attr('data-model'));
								}

							}
						}else{
							var thisVal = $(this).attr('value');
							if(thisVal && /{\[{(.*)}\]}/.test(thisVal)){
								var newEle = thisVal.match(/{\[{(.*)}\]}/)[1];
								// work Repeaters
								$(this).attr('ng-model', 'setData.'+newEle);
							}else if($(this).is('textarea')){
								var thisVal = $(this).text();
								if(thisVal && /{\[{(.*)}\]}/.test(thisVal)){
									var newEle = thisVal.match(/{\[{(.*)}\]}/)[1];
									$(this).attr('ng-model', 'setData.'+newEle);
								}
							}
						}
					})
					$('*[data-repeat]').each(function(e,i){
						var thisIs=$(this).attr('data-id')
						if(/{\[{/.test(thisIs)){
							thisIs=thisIs.replace(/{\[{/g, '').replace(/}\]}/g, '')
							var thisRepat=$(this).attr('data-repeat')
							$(this).removeAttr('data-id').removeAttr('data-function')
							$(this).attr('ng-repeat', thisRepat+' setData.'+thisIs)
						}
					})
					$('*[data-function]').each(function(e,i){
						var thisIs=$(this).attr('data-id');
						if(/{\[{/.test(thisIs)){
							thisIs=thisIs.replace(/{\[{/g, '').replace(/}\]}/g, '')
							var thisParams=$(this).attr('data-params');
							var thisfunction=$(this).attr('data-function');
							$(this).removeAttr('data-id').removeAttr('data-function').removeAttr('data-params');
							if(thisfunction!=='uploadImage'){
								$(this).attr("ng-click", thisfunction+"('setData."+thisIs+"',"+thisParams+")")
							}else{
								if(/unique_file/.test(thisIs))thisParams=thisParams+", '"+thisIs+"'";
								$(this).attr("ng-click", thisfunction+"("+thisParams+")")
							}
						}
					})
					$('*[data-model]').each(function(e,i){
						var thisParams=$(this).attr('data-model');
						if(/{\[{(.*)}\]}/.test(thisParams))thisParams = "setData."+thisParams.match(/{\[{(.*)}\]}/)[1];
						$(this).attr("ng-model", thisParams)
					})
					$('*[data-tinymce]').each(function(e,i){
						var thisParams=$(this).attr('data-tinymce');
						$(this).removeAttr('data-tinymce').attr('ui-tinymce', 'tinymceOptions');
					})
					// WORK DATA
					var frontFull = ($('.front-end.dragplaceholder').html() || ''),
							frontSave = ($('.front-end.dragplaceholder').clone() || '')
							summFull 	= ($('.summary-end.dragplaceholder').html() || ''),
							summSave 	= ($('.summary-end.dragplaceholder').clone() || ''),
							backFull 	= ($('.back-end.dragplaceholder').html() || ''),
					 		backSave 	= ($('.back-end.dragplaceholder').clone() || ''),
							dataToSave = {};

						function readyToSave(){


								$(frontSave).find('.controls, .hidden, .preview, .remove, .drag, .configuration, .toHide, .backend').remove();
								$(frontSave).find("[contenteditable='true']").prop('contenteditable', false);
								$(frontSave).find('.ui-draggable.ele').contents().unwrap();
								$(frontSave).find('.blockElement').contents().unwrap();

								$(summSave).find('.controls, .hidden, .preview, .remove, .drag, .configuration, .toHide, .backend').remove();
								$(summSave).find("[contenteditable='true']").prop('contenteditable', false);
								$(summSave).find('.ui-draggable.ele').contents().unwrap();
								$(summSave).find('.blockElement').contents().unwrap();

								$(backSave).find('.controls, .hidden, .preview, .remove, .drag, .configuration, .toHide').remove();
								$(backSave).find("[contenteditable='true']").prop('contenteditable', false);
								$(backSave).find('.lyrow.ele').addClass('col-md-9');

								frontSave=$(frontSave).html();
								frontSave=frontSave.replace(/\<ng\-include(.*)\>/g, ' ').replace(/\<\/ng\-include(.*)\>/g, ' ').replace(/\[\[/g, '{{').replace(/\]\]/g, '}}');
								summSave=$(summSave).html();
								summSave=summSave.replace(/\<ng\-include(.*)\>/g, ' ').replace(/\<\/ng\-include(.*)\>/g, ' ').replace(/\[\[/g, '{{').replace(/\]\]/g, '}}');
								backSave=$(backSave).html();
								backSave=backSave.replace(/\<ng\-include(.*)\>/g, ' ').replace(/\<\/ng\-include(.*)\>/g, ' ').replace(/\[\[/g, '{{').replace(/\]\]/g, '}}');

								$scope.groupsPick=[];

								$('#multipleSelectGroup option:selected').each(function(i,ele){
									for(var grp in $scope.groups){
										if($(ele).text() == $scope.groups[grp].name){$scope.groupsPick.push($scope.groups[grp]);}
									}
								})

								// WORK EXEPTIONS
								var prephtmlBack;
								if($scope.title!='header' && $scope.title !='footer' && $scope.title!='sidebar'){
									prephtmlBack = JSON.stringify('<div ng-controller="editCtrl"><div ng-include="\'/admin/views/headerCTypes-top.html\'"></div><div class="row"> <div class="col-md-9">'+backSave+'</div>  <div class="col-md-3" ng-include="\'/admin/views/headerCTypes.html\'"></div></div></div>');
								}else{prephtmlBack= backSave;}



								$http({
									url: '/api/ctype',
									method: "PUT",
									data:{
										title:$scope.title,
										icon:$scope.icon,
										data:dataToSave,
										groups: ($scope.groupsPick || []),
										type:'contenttypes',
										htmlFront:JSON.stringify(frontSave),
										htmlBack:prephtmlBack,
										htmlBackAll:{
											htmlFront:JSON.stringify(frontFull),
											htmlSumm:JSON.stringify(summFull),
											htmlBack:JSON.stringify(backFull)
										},
										htmlSumm:JSON.stringify(summSave)
									}
								}).success(function(data, status, headers, config) {
									if (data.status == 'nok' && data.message == 'reserved_name') {
										growl.error('The item title is not valid.', {disableCountDown: true,title: 'Error!'});
									} else {
										growl.success('The content type '+$scope.title+' was saved', {disableCountDown: true,title: 'Success!'});
										$rootScope.$broadcast('UpdateSytem');
									}
								}).error(function(data, status, headers, config) {
									growl.error('Error!', {disableCountDown: true, title: 'Error!'});
								});
							}
						/// ADD CTYPE LOOP
						//var thisElement = new Date().getTime();

						var frontCtypes= frontSave.find('.handleCtypeRepeat');
						var sumCtypes= summSave.find('.handleCtypeRepeat');
						var backCtypes= backSave.find('.handleCtypeRepeat');
						var ctypRep = $.merge( sumCtypes, frontCtypes );
						var a=0;

						// save template areas
						/*dataEle = backFull.match(/{\[{(.*)}\]}/g);
						for (ele in dataEle){
							if(/cat_/.test(dataEle[ele])){
								var newEle = dataEle[ele].match(/{\[{(.*)}\]}/)[1];
								var elem = newEle.split('_');
								if(typeof dataToSave['repeaters'] === 'undefined'){dataToSave['repeaters']={};dataToSave['repeaters']['cat_'+elem[2]]={};}
								dataToSave['repeaters']['cat_'+elem[2]][elem[1]]='';
							}else{
								var newEle = dataEle[ele].match(/{\[{(.*)}\]}/)[1];
								dataToSave[newEle]='';
							}
						}*/

						if(ctypRep.length>0){
							//BACK END VARS
						/*$.each(backCtypes, function(i,e){
							var thisEl = $(this);
							var thisDataType = $(this).attr('data-ctype').toLowerCase();
							thisDataType.replace(/\W/gim,"");
							var thisElement = ($(this).parent().parent().attr('class').match(/ele_\d+/)[0].match(/\d+/) || '');
							newEle = 'items_'+thisDataType+'_'+thisElement;
							categoryT = thisEl.find('.category').val();
							countT = thisEl.find('.count').val();
							filterT = thisEl.find('.filter').val();
							displayView = thisEl.find('.displayView').val();
							if(typeof dataToSave['repeaters'] === 'undefined')dataToSave['repeaters']={};
							dataToSave['repeaters'][newEle] = {category:categoryT,count:countT,filter:filterT,view:displayView};
						})*/

						$.each(ctypRep, function(i,e){
							var thisEl = $(this);
							var typetoSave = ($(this).parents('.dragplaceholder').hasClass('front-end'))?'full':'summ';
							var thisDataType = $(this).attr('data-ctype').toLowerCase();
							thisDataType.replace(/\W/gim,"");
							var thisElement = ($(this).parent().parent().attr('class').match(/ele_\d+/)[0].match(/\d+/) || '');
							var newEle = thisDataType+'_'+thisElement;
							$.get('/getTemplate/'+thisDataType+'_summ.html', function( htmlTemplate ) {
								a++;
								if(htmlTemplate){
									thisEl.html('<div class="repeatCont">{{#each '+newEle+'}}<div class="ele">'+htmlTemplate+'</div>{{/each}}</div>');
								}
								if(a>=ctypRep.length)readyToSave();
							})

						})
					}else{readyToSave();}




				} else {
					growl.error('Missing title.', {disableCountDown: true, title: 'Error!'});
				}
			}



			/*$http.post('/api/layout')
			.then(function(res){
				$scope.layout = commonVal.layout= res.data.layout;
				$scope.totalItems = res.data.totalItems;
			});*/

	}]
).controller('blockCtrl', [ '$scope', '$http', '$location', '$stateParams', '$log', 'growl',
	function($scope, $http, $location, $stateParams, $log, growl){
		$scope.blocks=[]
			$http.post('/api/blocks')
			.then(function(res){
				$scope.blocks = commonVal.blocks= res.data;
			});
	}]
)
