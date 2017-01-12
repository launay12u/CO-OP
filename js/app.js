var app = angular.module('coop', ['ngResource']);

app.constant('api', {'key': '0e03c5b3171e406c9c155ee8acd57992', 'url': 'http://coop.api.netlor.fr/api'});

app.config(['$httpProvider', 'api','TokenServiceProvider', function ($httpProvider, api,TokenServiceProvider) {
    $httpProvider.defaults.headers.common.Authorization = "Token token=" + api.key;
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


app.controller("StartController", ['$scope', 'Member','TokenService',function ($scope, Member,TokenService) {


    //FONCTION CONNEXION
    Member.signin({email:'guillaume.launay5@etu.univ-lorraine.fr',password:'Password1'},function (m) {
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
