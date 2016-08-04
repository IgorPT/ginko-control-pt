app.controller('settingsCtrl', [ '$scope', '$http', '$location', '$stateParams', '$log', 'growl', 'fileUpload',
	function( $scope, $http, $location, $stateParams, $log, growl, fileUpload){

		var urlParams = $stateParams.params.match(/[^\/]+/g),
			getParams;

		if (urlParams) {
			getParams = $stateParams.params;
		} else {
			getParams = 'index';
		}

		$scope.setData= {},
		dataSet={content:{}};

		$http.post('/api/ctype/settings').then(function(contents) {
			if (contents.data.status === 'ok') {
				dataSet.content=contents.data.ctypeCont[0];
				$scope.setData=contents.data.ctypeCont[0];
				$scope.menus = contents.data.ctypeCont[0].menus;
				$scope.workcontent()
			}
		});


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


		$scope.loadTemplate=function(template){

			$http.get('/getBackTemplate/' + template+'/'+template+'.html').then(function(contents) {
				if (contents.statusText === 'OK') {
					$scope.htmlInner = contents.data;
				}
			});
		}

		$scope.uploadImage = function(item,ele) {
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

		$scope.workcontent=function(){


		}

		$scope.filterGroup=function(group){
			$scope.groupName=group;
		}

		$scope.saveSettings=function(){
			// remplate content will be inside templateCnt{}
			//gET CONTENT FROM INPUT
			for(ele in $scope.setData) {
				dataSet.content[ele] = $scope.setData[ele];
			}
			$http({
				url: '/api/settings',
				method: "PUT",
				data: {
					data: dataSet.content,
				}
			}).success(function(data, status, headers, config) {
				if (data.status == 'ok') {
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
}]
)
