app.controller('menuSortCtrl', [ '$scope', '$http', '$location', '$stateParams', '$log', 'growl',
	function( $scope, $http, $location, $stateParams, $log, growl){

		var urlParams = $stateParams.params.match(/[^\/]+/g),
			getParams;

		if (urlParams) {
			getParams = $stateParams.params;
		} else {
			getParams = 'index';
		}
		$scope.workMenus=function(type){
			if($scope.menusAllMenus.hasOwnProperty(type)){
				$scope.menus=$scope.menusAllMenus[type];
			}else{
				$scope.menus=[];
			}
		}

		$scope.saveOrder=function(){

			/*var list   = e.length ? e : $(e.target),*/
			var	output = $('.sortList').data('output');
			var newMenu=$('.sortList').nestable('serialize');
			// WORK NEW WEIGTH [_id:weigth]
			var outputNgm = {};
			for(var ngm in newMenu){
				outputNgm[newMenu[ngm].id]=ngm;
			}


			 $http({
			 	url: '/api/menus/edit',
			 		method: "POST",
			 		data: {
						data: outputNgm
					}
			 	}).success(function(data, status, headers, config) {
			 		console.log(data);
			 	}).error(function(data, status, headers, config) {
			 		console.log(status);
			 });



		}

		$scope.filterGroup=function(group){
			$scope.workMenus(group);
			$scope.groupName=group;
		}

		$scope.path=getParams;
		$scope.title=getParams;
		$scope.cateTitle='';
		$scope.category = commonVal.categories;
		$scope.groups = commonVal.groups;
		$scope.menusAllMenus=(commonVal.allMenus || '');
		$scope.groupName='admin';
		$scope.workMenus('admin');

		$scope.$on('initFinish', function() {
			$scope.category = commonVal.categories;
			$scope.groups = commonVal.groups;
			$scope.menusAllMenus=commonVal.allMenus;
			$scope.workMenus('admin');
		});

		$scope.remove = function(id){
			console.log(id,'remove')
		}
		$scope.edit = function(id){
			window.location = "/admin/#/menus/edit/"+id

		}
		var updateOutput = function(e)
    {
      /*  var list   = e.length ? e : $(e.target),
            output = list.data('output');
        if (window.JSON) {
            console.log(list.nestable('serialize'));//, null, 2));
        } else {
            console.log('JSON browser support required for this demo.');
        }
				//console.log(output)*/
    };

		$('.sortList').nestable('serialize').on('change', updateOutput);

}]
)
