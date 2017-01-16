var app = angular.module('coop', ['ngResource','ngRoute']);

app.config(['$routeProvider',
    function($routeProvider) {

        // Système de routage
        $routeProvider
            .when('/home', {
                templateUrl: 'templates/home.html',
                controller: 'homeController'
            })
            .when('/login', {
                templateUrl: 'templates/login.html',
                controller: 'startController'
            })
            .when('/signup',{
                templateUrl: 'templates/login.html',
                controller: 'signupController'
            })
            .otherwise({
                redirectTo: '/home'
            });
    }
]);

app.constant('api', {'key': '0e03c5b3171e406c9c155ee8acd57992', 'url': 'http://coop.api.netlor.fr/api'});

app.config(['$httpProvider', 'api', function ($httpProvider, api) {
    $httpProvider.defaults.headers.common.Authorization = "Token token=" + api.key;

    $httpProvider.interceptors.push(['TokenService',function (TokenService) {
        return {
            request : function (config) {
                var token = TokenService.getToken();
                if(token != ""){
                    config.url += ((config.url.indexOf('?') >= 0) ? '&' : '?')+'token='+token;
                }
                return config;
            }
        }
    }])
}]);

app.factory("Member", ['$resource', 'api', function ($resource, api) {
    return $resource(api.url + "/members/:id", {id: '@_id'},
        {
            update: {method: 'PUT'},
            signin: {method: 'POST',url:api.url+'/members/signin'}
        });
}]);

app.service('TokenService',[function () {
    this.token = "";
    this.setToken = function (t) {
        this.token = t;
    };
    this.getToken = function(){
        return this.token;
    }
}]);


app.controller("homeController", ['$scope', function ($scope) {

}]);

app.controller("startController", ['$scope', 'Member','TokenService', '$location',function ($scope, Member,TokenService, $location) {


    //FONCTION CONNEXION
    $scope.login = function(){
      Member.signin({email: $scope.email, password: $scope.password} ,function (m) {
          $scope.member = m;
          $scope.members = Member.query({token:$scope.member.token},function (membres) {
              //console.log($scope.members);
              $location.path("/homeCo");
              localStorage.setItem("token", $scope.member.token);

          }, function (error) {
              //error
              console.log(error)
          });
      });
    }


    // FONCTION POUR INSCRIPTION
   /* $scope.newMember = new Member({
        fullname:'Guillaume LAUNAY',
        email:'guillaume.launay5@etu.univ-lorraine.fr',
        password:'Password1'
    });

    $scope.newMember.$save(function (m) {
        console.log($scope.newMember);
    }, function (error) {
        //error
        console.log(error)
    });
*/

}]);
