app.controller('userCtrl', [ '$scope', '$rootScope', '$http', '$location', 'growl',
	function($scope, $rootScope, $http, $location, growl){

		$scope.login = function() {
			$http.post('/user/auth', $scope.user).then(function(data){
				if (data.data.status === 'ok') {
					$location.url('/admin');
					$rootScope.$broadcast('UpdateSytem');
				} else if (data.data.status === 'nok') {
					growl.error(data.data.data, {disableCountDown: true, title: 'Error!'});
				}
			});
		}

		$scope.setUser = function() {
			/*
			var userData = {};

			userData['name'] = $scope.user.name;
			userData['username'] = $scope.user.username;
			userData['email'] = $scope.user.email;
			userData['password'] = $scope.user.password;
			*/


			$http.put('/user/set', $scope.user).then(function(data){
				var user = data;
				if (user.data.status === 'ok') {
					$location.url('/login');
				} else if (user.data.status === 'nok') {
					growl.error(user.data.data, {disableCountDown: true, title: 'Error!'});
				}
			});
		}
	}]
)
