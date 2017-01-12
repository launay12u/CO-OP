var app = angular.module('coop', ['ngResource']);

app.const('api',{'key' : '0e03c5b3171e406c9c155ee8acd57992', 'url' : 'http://coop.api.netlor.fr/api'});

app.config(['$httpProvider', 'api', function($httpProvider, api){
  $httpProvider.defaults.headers.common.Authorization = "Token token="+api.key;
}]);

app.factory("Member", ['$resource', 'api', function($resource, api){
  return $resource(api.url+"/members/:id", {id: '@_id'}, {update: {method: 'PUT'}});
}]);


app.controller("StartController", ['$scope', 'Member', function($scope, Member){
  $scope.members = Member.query();
}]);
