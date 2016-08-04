app.controller('editCtrl', [ '$scope', '$rootScope', '$http', '$location', '$stateParams', '$log', 'growl', 'fileUpload',
	function($scope, $rootScope, $http, $location, $stateParams, $log, growl, fileUpload){

		$scope.tinymceOptions = {
			onChange: function(e) {
				// put logic here for keypress and cut/paste changes
			},
			inline: false,
			plugins : 'advlist autolink link image lists charmap print preview',
			skin: 'lightgray',
			theme : 'modern'
		};

		var urlParams = $stateParams.params.match(/[^\/]+/g),
			getParams;

		if (urlParams) {
			getParams = $stateParams.params;
		} else {
			getParams = 'index';
		}
		$scope.path=getParams;
		$scope.edit=false;
		$scope.title=getParams;
		$scope.groups = commonVal.groups;
		$scope.category = commonVal.categories;
		$scope.categoryPick=[];
		$scope.comp={};
		$scope.groupsPick=[];
		var urlParams = $stateParams.params.match(/[^\/]+/g),
			dataSet = {},
			datafromTempl=[],
			getParams;

		$scope.setData= {templateCnt:{seo : {}}};

		$scope.$on('initFinish', function() {
			var s = document.createElement('script'); // use global document since Angular's $document is weak
			s.src = 'assets/js/scripts.js';
			document.body.appendChild(s);

			$scope.groups = commonVal.groups;
		});


		$scope.toggleSidebar = function(param){
				($scope.comp[param])?$scope.comp[param]=false:$scope.comp[param]=true;
		}
		/*////////////
		/// GET CTYPES DEFAULTS
		////////////*/
		$http.post('/api/admin/'+urlParams[0])
		.then(function(resCT){
			$scope.category =resCT.data.categories;
			$scope.groups = resCT.data.groups;

			if (urlParams[1]=='edit') {
				//urlParams[2]
				/// SAVE TEMPLATE
				$http.post('/api/ctype/'+urlParams[0]+'/'+urlParams[2])
				.then(function(res){
					$scope.edit=true;

					dataSet = {
						content:(res.data.data[0].content[0] || {}),
						groups:res.data.data[0].groups,
						category:res.data.data[0].category,
						id:res.data.data[0]._id
					}
					setTimeout(function(){
						if ($('.uploadPreview-src').length >= 0) {
							$.each($('.uploadPreview-src'), function(){
								href = $(this).val();

								if (/\.(jpe?g|png|gif|bmp)$/i.test(href) && href) {
									$(this).siblings('.uploadPreview').html('<img src="'+href+'">');
								} else if (href) {
									$(this).siblings('.uploadPreview').html('<div>Uploaded File: '+href+'</div>');
								}

							});
						}
					}, 0);




					if (urlParams[0] == 'users') {
						delete dataSet.content.password;
					}

					$scope.permalink = res.data.data[0].permalink;
					$scope.name = $scope.title=res.data.data[0].name;

					for(var thisData in dataSet.content){
							$scope.setData[thisData]=dataSet.content[thisData];
					}

					for(var catavail in $scope.category){
						for(var thiscats in dataSet.category){
							if($scope.category[catavail].slug == dataSet.category[thiscats].slug){$scope.categoryPick.push($scope.category[catavail]);}
						}
					}

					for(var grps in $scope.groups){
						for(var grp in dataSet.groups){
							if($scope.groups[grps].group == dataSet.groups[grp].group){$scope.groupsPick.push($scope.groups[grps]);}

						}
					}

						// HACKED TO AVOID INSERTING MANUALLY ON BOXES
						/*
							setTimeout(function(){
								tinymce.init({
								selector: "textarea",  // change this value according to your HTML
								plugins: "code"
							});
						}, 1000);
						*/


				})

			}else{
				/*
				tinymce.init({
					selector: "textarea",  // change this value according to your HTML
					plugins: "code"
				});
				*/

			}


		})

		$scope.addanother=function(item,items){
			if(item && /\./.test(item)){
				var objectrepIt=item.split('.');
				if(typeof $scope.setData[objectrepIt[1]] === 'undefined')$scope.setData[objectrepIt[1]]={};
				if(typeof $scope.setData[objectrepIt[1]][objectrepIt[2]] === 'undefined')$scope.setData[objectrepIt[1]][objectrepIt[2]]=[];
				$scope.setData[objectrepIt[1]][objectrepIt[2]].push(items)

			}

		}

		$scope.delThisEle=function(obj,thisItem){
			if(obj && /\./.test(obj)){
				var objectrepIt=obj.split('.');
				if(typeof $scope.setData[objectrepIt[1]] === 'undefined')$scope.setData[objectrepIt[1]]={};
				if(typeof $scope.setData[objectrepIt[1]][objectrepIt[2]] === 'undefined')$scope.setData[objectrepIt[1]][objectrepIt[2]]=[];
				$scope.setData[objectrepIt[1]][objectrepIt[2]].splice(thisItem, 1);
			}
		}


		$scope.changedName = function(name) {
			$scope.name = $scope.title = name.toLowerCase();
			if(!$scope.edit)$scope.permalink = '/'+encodeURIComponent(urlParams[0])+'/'+encodeURIComponent(name.toLowerCase());
		}
		$scope.changedPermalink = function(name) {
			$scope.permalink = name;
		}
		$scope.uploadImage = function(item, ele) {
			if (typeof item[ele] !== 'undefined') {
				fileUpload.uploadFileToUrl(item[ele], '/api/media', function(data) {
					if (data.data.status == 'ok') {
							item[ele] = data.data.data.path;
							//remove default file object from sendData to prevent blank render
						growl.success('The file '+data.data.data.filename+ ' was saved', {disableCountDown: true, title: 'Success!'});
					} else {
						growl.error('Upload failed:' +data.data.message, {disableCountDown: true, title: 'Error!'});
					}
				});
			}
		}


	/*	$scope.changedGroup = function(name) {
			$scope.groups=name;
		}*/
		/// SAVE TEMPLATE
		$scope.saveTemplate = function(copy) {

			if((!$scope.hasOwnProperty('name') || $scope.name=="" || $scope.groups=="" || !$scope.hasOwnProperty('groups')) && (urlParams[0]!='groups' && urlParams[0]!='menus' && urlParams[0]!='users')){
				growl.error('The required fields are empty', {disableCountDown: true, title: 'Error!'});
				return false;
			}else{
				var thisId = dataSet.id;
				var typeSave = 'edit';

				if (copy == 'new') {
					thisId = '';
					typeSave = 'new';
				}

				if(!dataSet.hasOwnProperty('content')){
					dataSet.content={};
					typeSave = 'new';
				}

				//gET CONTENT FROM INPUT
				for(ele in $scope.setData) {
					dataSet.content[ele] = $scope.setData[ele];
				}

				//gET CONTENT FROM TEXTAREAs
				var a=0;
				$('textarea').each(function(){
					if(/\./.test($(this).attr('ng-model')))
					{
						var ele=$(this).attr('ng-model').split('.')[1];

						/*
						if (tinymce.editors[a].getContent){
							dataSet.content[ele] = tinymce.editors[a].getContent();
						}
						*/

					}
				})


				$scope.categoryPick=[];
				$scope.groupsPick=[];

				$('#multipleSelectCategory option:selected').each(function(i,ele){
					for(var thiscats in $scope.category){
						if($(ele).text() == $scope.category[thiscats].slug){$scope.categoryPick.push($scope.category[thiscats]);}
					}
				})

				$('#multipleSelectGroup option:selected').each(function(i,ele){
					for(var grp in $scope.groups){
						if($(ele).text() == $scope.groups[grp].name){$scope.groupsPick.push($scope.groups[grp]);}
					}
				})

				if (typeof $scope.setData.templateCnt !== 'undefined' && !/groups/g.test($scope.path)) {
					dataSet.content.templateCnt['seo'] = $scope.setData.templateCnt.seo;
				}

				var normalData = {
					title: $scope.name,
					data: dataSet.content,
					groups: ($scope.groupsPick || []),
					category: ($scope.categoryPick || []),
					type: urlParams[0],
					saveType: typeSave,
					id: (thisId || ''),
					permalink: $scope.permalink
				}

				if (/groups|users/g.test($scope.path)) {
					delete dataSet.content.templateCnt;
					delete normalData.title;
					delete normalData.permalink;
				}

				if (/menus/g.test($scope.path)) {
					normalData.data.name = normalData.title;
					normalData.data.path = normalData.permalink;
				}


				$http({
					url: (urlParams[0]=='users' || urlParams[0]=='groups')?'/api/'+urlParams[0]:'/api/ctype/edit',
					method: "PUT",
					data: normalData
				}).success(function(data, status, headers, config) {
					if (data.status == 'ok') {
						if(typeof data.data[0] !== 'undefined'){dataSet.id = data.data[0]._id;}else{dataSet.id = data.data._id;}
							growl.success('The content '+$scope.setData.name+' was saved', {disableCountDown: true, title: 'Success!'});
					} else {
						if (data.message == 'existing') {
							growl.error('The permalink already exists.', {disableCountDown: true, title: 'Error!'});
						}
					}
				}).error(function(data, status, headers, config) {
					growl.error(status, {disableCountDown: true, title: 'Error!'});
				});
			}
		}
	}]
)
