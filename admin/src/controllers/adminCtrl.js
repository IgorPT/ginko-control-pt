app.controller('adminCtrl', [ '$scope', '$rootScope', '$http', '$log', '$location', '$stateParams', 'growl',
	function($scope, $rootScope, $http, $location, $log, $stateParams, growl){



		$scope.initAdmin = function() {
			var urlParams = $stateParams.params.match(/[^\/]+/g),
				getParams;

			if (urlParams) {
				getParams = $stateParams.params;
			} else {
				getParams = 'index';
			}

			if(getParams.indexOf('/') != -1 || (getParams == "index" && !commonVal.logged)) {
				ctypePatch = getParams;
				if(getParams.match(/(add|edit)/g)){var ctypePatch=getParams.split('/')[0]}

				$http.post('/api/admin/' + ctypePatch+'/'+ctypePatch).then(function(contents) {
					if (contents.data.status === 'ok') {
						commonVal.groups=contents.data.groups;
						commonVal.categories=contents.data.categories;
						$scope.html = contents.data.data;
					}
				});
			} else {
				if (getParams == "index") {
					$http.post('/api/admin/' + getParams+'/'+getParams).then(function(contents) {
						if (contents.data.status === 'ok') {
							$scope.html = contents.data.data;
						}
					});
				}else if (getParams == "settings") {
					$http.get('views/settings.html').then(function(contents) {
						$scope.html = contents.data;

					});
				}else if (getParams == "menus") {
					$http.get('views/menus.html').then(function(contents) {
						$scope.html = contents.data;

					});
				} else {
					$http.get('views/table.html').then(function(contents) {
						$scope.html = contents.data;
					});
				}
			}

			$scope.currentPage=commonVal.currentPage=getParams;


			//init Menu Start
			if(commonVal.start){
				$rootScope.$broadcast('UpdateSytem');
				commonVal.start=false;
			}
		}
	}]
).controller('menuCtrl', [ '$scope', '$rootScope', '$http', '$log', '$location', '$stateParams', 'growl',
	function($scope, $rootScope, $http, $location, $stateParams, $log, growl){


		$scope.$on('UpdateSytem', function() {
			$http.post('/api/infoupdate')
					 .then(function(res){
						 $scope.menus = commonVal.menus = res.data.menus.admin;
						 commonVal.allMenus=res.data.menus;
						 commonVal.groups= res.data.groups;
						 $scope.totalItems = res.data.totalItems;
						 $rootScope.$broadcast('initFinish');

						 $scope.workMenu();

			});
		});

		$scope.workMenu =function(path){

			for(men in $scope.menus){
				$scope.menus[men].selected=""
				if((path && path==$scope.menus[men].path) || ($scope.menus[men].path=='#/'+commonVal.currentPage && !path)){$scope.menus[men].selected="active"}
			}
		}



	}]
).controller('dashCtrl', [ '$stateParams', '$scope', '$http', '$location', '$stateParams', '$log', 'growl',
	function($stateParams, $scope, $http, $location, $stateParams, $log, growl){
		var urlParams = $stateParams.params.match(/[^\/]+/g),
			getParams;



		if (urlParams) {
			getParams = $stateParams.params;
		} else {
			getParams = 'index';
		}
		$scope.path=getParams;
		$scope.title=getParams;
		//$('.sortList').nestable();


	}]
).controller('permCtrl', [ '$scope', '$http', '$location', '$stateParams', '$log', 'growl',
	function($scope, $http, $location, $stateParams, $log, growl){
		$scope.savePermission = function() {
			if($scope.name && $scope.group && $scope.login && $scope.paths){
				var login = Boolean($scope.login),
					paths = $scope.paths.match(/[^\r\n]+/g);

				$http({
					url: '/api/permissions',
						method: "PUT",
						data:{
							name: $scope.name,
							group: $scope.group,
							login: login,
							paths: paths
						}
					}).success(function(data, status, headers, config) {
						console.log(data);
					}).error(function(data, status, headers, config) {
						console.log(status);
				});

			} else {
				growl.error('Check sent info.', {disableCountDown: true, title: 'Error!'});
			}
		}
	}]
)
