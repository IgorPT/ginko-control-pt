app.controller('tableCtrl', ['$scope', '$rootScope', '$http', '$location', '$stateParams', '$log', 'growl', 'uiGridConstants', (
            function ($scope, $rootScope, $http, $location, $stateParams, $log, growl, uiGridConstants) {

                var urlParams = $stateParams.params.match(/[^\/]+/g),
                        getParams;

                if (urlParams) {
                    getParams = $stateParams.params;
                } else {
                    getParams = 'index';
                }
                $scope.path = getParams;
                $scope.title = getParams;
                $scope.cateTitle = '';
                $scope.selectedCat = [];
                $scope.selectedCatView = [];
                $scope.categories = [];
                $scope.selectedGroupView = '';
                $scope.gridOptions = {
                    paginationPageSizes: [25, 50, 75],
                    paginationPageSize: 25,
                    enableVerticalScrollbar : uiGridConstants.scrollbars.NEVER,
                    enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
                    selectedItems: $scope.selectedItems,
                    enableRowSelection: true,
                    enableSelectAll: true,
                    showGridFooter: false,
                    minRowsToShow: 10,
                    enableFiltering: false
                };

                if (getParams === "tickets") {

                    $scope.gridOptions.columnDefs = [
                        {field: 'title', enableHiding: false},
                        {field: 'status', enableHiding: false},
                        {field: 'lastchange', enableHiding: false},
                        {field: 'actions',
                            enableFiltering: false,
                            enableSorting: false,
                            enableHiding: false,
                            cellTemplate: '<button class="grid_action_btns" style="width:100%" data-link="#/tickets/show/{{row.entity._id}}" onclick="grid_link_btns(this);" >Open</button>'
                        }
                    ];

                } else {
                    $scope.gridOptions.columnDefs = [];
                }

                $('.navbar-right .dropdown.actions').hide();


                $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                    $('.categ ul li, .categ ul li input, .categ ul li a, .categ a ul li a, .filterBut').click(function (e) {
                        e.stopPropagation();
                    });
                });

                $scope.clearSort = function () {
                    $scope.cateTitle = '';
                    $scope.gridOptions.data = $scope.griData;
                    $scope.selectedGroupView = '';
                    for (var grp in $scope.groups) {
                        $scope.groups[grp].selected = '';
                    }
                }
                $scope.deleteRow = function (row) {
                    var index = $scope.gridOptions.data.indexOf(row);
                    $scope.gridOptions.data.splice(index, 1);
                };
                $scope.selectionCat = function () {

                    var addItems = [];
                    var gridElemts = $scope.gridApi.selection.getSelectedRows();
                    var elNew = false;

                    for (rows in gridElemts) {
                        addItems.push(gridElemts[rows]._id);
                    }

                    if (gridElemts.length > 0)
                        elNew = false;

                    $http({
                        url: '/api/ctype/category/' + urlParams[0],
                        method: "PUT",
                        data: {
                            new : elNew,
                            category: $scope.selectedCat,
                            items: addItems
                        }
                    }).success(function (data, status, headers, config) {
                        if (data.status == 'ok') {
                            growl.success('The items category where updated', {title: 'Success!'});
                            for (rows in gridElemts) {
                                gridElemts[rows].category = $scope.selectedCat.join(', ');
                            }

                        } else {
                            if (data.message == 'existing') {
                                growl.error('The category already exists.', {disableCountDown: true, title: 'Error!'});
                            }
                        }
                    }).error(function (data, status, headers, config) {
                        growl.error(status, {disableCountDown: true, title: 'Error!'});
                    });

                };

                //	$scope.scopeUpdateGrid();

                $scope.scopeUpdateGrid = function (what) {
                    var newRows = [];


                    for (row in $scope.griData) {
                        for (col in $scope.griData[row]) {
                            var count = 0,
                                    thisCats = [],
                                    found = false;

                            if (col == 'category' && what == 'category') {
                                if ($scope.selectedCatView.length > 0) {
                                    var thisCats = $scope.griData[row][col].split(', ');
                                    for (cat in $scope.selectedCatView) {
                                        if (thisCats.indexOf($scope.selectedCatView[cat]) != -1) {
                                            count++;
                                            found = true;
                                        }
                                    }
                                    if (count == thisCats.length || found)
                                        newRows.push($scope.griData[row]);
                                }
                            } else if (col == 'groups' && what == 'groups') {
                                if ($scope.selectedGroupView != '') {
                                    var thisGroups = $scope.griData[row][col].split(', ');
                                    if (thisGroups.indexOf($scope.selectedGroupView) != -1) {
                                        //newRows.push($scope.griData[row])
                                        newRows.push($scope.griData[row]);
                                    }
                                }

                            }

                        }
                    }
                    $scope.gridOptions.data = uniq(newRows);
                }

                $scope.filterCat = function (name, update) {
                    for (cat in $scope.categories) {
                        if ($scope.categories[cat].slug == name) {
                            if (update == 'update') {
                                if ($scope.categories[cat].selectedView == '') {
                                    $scope.categories[cat].selectedView = 'active';
                                    $scope.selectedCatView.push($scope.categories[cat].name);
                                } else {
                                    $scope.categories[cat].selectedView = '';
                                    removefromArray($scope.selectedCatView, $scope.categories[cat].name);
                                }
                            } else {
                                if ($scope.categories[cat].selected == '') {
                                    $scope.categories[cat].selected = 'active';
                                    $scope.selectedCat.push($scope.categories[cat].name);
                                } else {
                                    $scope.categories[cat].selected = '';
                                    removefromArray($scope.selectedCat, $scope.categories[cat].name);
                                }
                            }
                        }
                    }
                    if (update == 'update') {
                        if ($scope.selectedCatView.length > 0) {
                            $scope.cateTitle = $scope.selecCatView = $scope.selectedCatView.join(', ');
                            for (var grp in $scope.groups) {
                                $scope.groups[grp].selected = '';
                            }
                            $scope.scopeUpdateGrid('category');
                        } else {
                            $scope.cateTitle = '';
                            $scope.gridOptions.data = $scope.griData;
                        }
                    } else {
                        $scope.selecCat = $scope.selectedCat.join(', ');
                    }
                    //console.log($scope.gridOptions.data);
                    //$scope.cateTitle=$scope.selectedCat.join(', ')
                };

                $scope.filterGroup = function (name) {

                    //Clear categorie
                    for (var cat in $scope.categories) {
                        $scope.categories[cat].selected = '';
                    }
                    $scope.cateTitle = '';

                    //SET NEW button
                    for (var grp in $scope.groups) {
                        if ($scope.groups[grp].name.toLowerCase() == name && $scope.groups[grp].selected != 'active') {
                            $scope.groups[grp].selected = 'active';
                        } else {
                            $scope.groups[grp].selected = '';
                        }
                    }


                    if ($scope.selectedGroupView == name) {
                        $scope.selectedGroupView = '';
                        $scope.gridOptions.data = $scope.griData;
                    } else {
                        $scope.selectedGroupView = name;
                        $scope.scopeUpdateGrid('groups');
                    }
                    ;
                };

                $scope.toggleFiltering = function () {
                    $scope.gridOptions.enableFiltering = !$scope.gridOptions.enableFiltering;
                    $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
                };

                $scope.saveNewCat = function (newcat) {
                    var addItems = [];
                    var gridElemts = $scope.gridApi.selection.getSelectedRows();
                    var elNew = true;

                    for (rows in gridElemts) {
                        addItems.push(gridElemts[rows]._id);
                    }

                    if (gridElemts.length > 0)
                        elNew = false;

                    $http({
                        url: '/api/ctype/category/' + urlParams[0],
                        method: "PUT",
                        data: {
                            new : elNew,
                            category: [newcat],
                            items: addItems
                        }
                    }).success(function (data, status, headers, config) {
                        if (data.status == 'ok') {
                            growl.success('The category ' + newcat + ' was saved', {title: 'Success!'});
                        } else {
                            if (data.message == 'existing') {
                                growl.error('The category already exists.', {disableCountDown: true, title: 'Error!'});
                            }
                        }
                    }).error(function (data, status, headers, config) {
                        growl.error(status, {disableCountDown: true, title: 'Error!'});
                    });


                };

                // FULL HEIGHT
                $scope.$watch('gridApi.core.getVisibleRows().length', function() {
                 if ($scope.gridApi) {
                 $scope.gridApi.core.refresh();
                 var row_height = 80;
                 var header_height = 80;
                 var height = row_height * $scope.gridApi.core.getVisibleRows().length + header_height;
                 $('.grid').height(height);
                 $scope.gridApi.grid.handleWindowResize();


                 }
                 });

                /*////////////
                 // TABLE
                 ////////////*/
                $scope.gridOptions.onRegisterApi = function (gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row) {

                        $('.navbar-right .dropdown.actions').show();
                        if ($scope.gridApi.selection.getSelectedCount() < 1) {
                            $('.navbar-right .dropdown.actions').hide();
                        }
                        $('.editBut').attr('href', '#/' + $stateParams.params + '/edit/' + row.entity._id);
                        $('.delBut').unbind('click').bind('click', function (e) {
                            e.preventDefault();
                            var delUrl = '/api/ctype/' + $scope.path+'/';
                            //if ($scope.path == 'permissions' || $scope.path == 'media')
                              //  delUrl = '/api/' + $scope.path;
                            var rowSelet = $scope.gridApi.selection.getSelectedRows();
                            for (var row in rowSelet) {
                                if (rowSelet[row].name != 'users' && rowSelet[row].name != 'permissions' && rowSelet[row].name != 'menus' && $scope.path != 'media') {
                                    /// TODO: CREATE ROUTE TO DELETE ARRAY OF ITEMS
                                    $http.delete(delUrl + rowSelet[row]._id).success(function (data) {
                                        //$scope.gridOptions.data = data.data;
                                        $scope.deleteRow(rowSelet[row]);
                                        //$rootScope.$broadcast('UpdateSytem');
                                    });
                                } else if ($scope.path == 'media') {
                                    delUrl += '/del'
                                    var toDelete = {pathFile: rowSelet[row]._id};
                                    $http.post(delUrl, toDelete).then(function (data) {
                                        $scope.deleteRow(rowSelet[row]);

                                    })
                                }
                            }
                        });
                    });

                }
                /*//////////
                 ////// GET DATA
                 /////////////*/
                $http.post('/api/ctype/' + getParams).success(function (data) {
                    $scope.griData = [];
                    var toDelete = [];
                    for (var inf in data.data) {
                        $scope.griData[inf] = {};
                        delete data.data[inf].type;
                        for (var ele in data.data[inf]) {
                            // CHECK IF EMPTY FOR REMOVAL
                            if (typeof toDelete[ele] == 'undefined')
                                toDelete[ele] = false;
                            toDelete[ele] = ((typeof toDelete[ele] !== 'undefined' && toDelete[ele] !== false) && (data.data[inf][ele] == '' || data.data[inf][ele].length == 0 || typeof data.data[inf][ele] == 'undefined')) ? true : false;

                            if (ele == 'category') {
                                var thisCats = [];
                                for (var cat in data.data[inf][ele]) {
                                    thisCats.push(data.data[inf][ele][cat].name);
                                }
                                $scope.griData[inf][ele] = thisCats.join(', ');
                            } else if (ele == 'groups') {
                                var thisGroups = [];
                                for (var cat in data.data[inf][ele]) {
                                    thisGroups.push(data.data[inf][ele][cat].name.toLowerCase());
                                }
                                $scope.griData[inf][ele] = thisGroups.join(', ');
                            } else if (ele == 'content') {

                                /*if(typeof data.data[inf][ele] !== 'undefined' || data.data[inf][ele] !==''){
                                 for(var ct in data.data[inf][ele][0]){
                                 var splitName = ct.split('_')
                                 //console.log($scope.griData[inf].hasOwnProperty(ct))
                                 var columnName = ($scope.griData[inf].hasOwnProperty(splitName[0]))?ct:splitName[0];
                                 $scope.griData[inf][columnName] =data.data[inf][ele][0][ct]
                                 }
                                 }*/
                            } else {
                                $scope.griData[inf][ele] = data.data[inf][ele];
                            }
                        }
                    }
                    // REMOVE EMPTY
                    for (var inf in data.data) {
                        for (var ele in data.data[inf]) {
                            if (toDelete[ele]) {
                                delete $scope.griData[inf][ele]
                            }
                        }
                    }

                    $scope.gridOptions.data = $scope.griData;
                    $scope.groups = commonVal.groups;

                    var categories = {};
                    for (var cat in data.categories) {
                        if (typeof data.categories[cat] !== 'undefined')
                        {
                            if (typeof data.categories[cat].slug != 'undefined') {
                                categories[data.categories[cat].slug] = {name: data.categories[cat].name, slug: data.categories[cat].slug, selected: '', selectedView: ''};
                            }
                            //categories.push({name:data.data[cat].category[chilcat].name,slug:data.data[cat].category[chilcat].slug,selected:''});
                        }
                    }

                    commonVal.categories = $scope.categories = categories;

                });
                if ($scope.categories.length == 0) {
                    setTimeout(function cb1() {
                        $('.categ ul li, .categ ul li input, .categ ul li a, .categ a ul li a, .filterBut').click(function (e) {
                            e.stopPropagation();
                        });
                    }, 0);
                }


            })]
        )
