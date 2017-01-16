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
                templateUrl: 'templates/inscription.html',
                controller: 'signupController'
            })
            .when('/homeCo',{
                templateUrl: 'templates/homeCo.html',
                controller: 'homeCoController'
            })
            .otherwise({
                redirectTo: '/home'
            });
    }
]) .run( function($rootScope, $location) {

    // register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
        if(next.$route.templateUrl == 'templates/home.html' || next.$route.templateUrl == 'templates/login.html' || next.$route.templateUrl == 'templates/inscrition.html'){
            if (localStorage.getItem('token') != null){
                $location.path("/homeCo")
            }
        }else {
            if (localStorage.getItem('token') == null){
                $location.path("/home")
            }
        }
    });
});



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

app.controller("signupController", ['$scope','Member','TokenService', function ($scope,Member,TokenService) {

}]);

app.controller("startController", ['$scope', 'Member','TokenService',function ($scope, Member,TokenService) {


    //FONCTION CONNEXION
    Member.signin({email: $scope.email, password: $scope.password} ,function (m) {
        $scope.member = m;
        $scope.members = Member.query({token:$scope.member.token},function (membres) {
            console.log($scope.members);
        }, function (error) {
            //error
            console.log(error)
        });
    });

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
