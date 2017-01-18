var app = angular.module('coop', ['ngResource', 'ngRoute', 'ngSanitize']);
app.constant('api', {'key': '0e03c5b3171e406c9c155ee8acd57992', 'url': 'http://coop.api.netlor.fr/api'});


//Routage
app.config(['$routeProvider',
    function ($routeProvider) {
        // Système de routage
        $routeProvider
            .when('/home', {
                templateUrl: 'templates/home.html'
            })
            .when('/login', {
                templateUrl: 'templates/login.html',
                controller: 'startController'
            })
            .when('/signup', {
                templateUrl: 'templates/inscription.html',
                controller: 'signupController'
            })
            .when('/homeCo', {
                templateUrl: 'templates/homeCo.html',
                controller: 'homeCoController'
            })
            .when('/newChannel', {
                templateUrl: 'templates/newChannel.html',
                controller: 'newChannelController'
            })
            .when('/channel/:id', {
                templateUrl: 'templates/channel.html',
                controller: 'channelController'
            })
            .otherwise({
                redirectTo: '/home'
            });
    }
]);

//Verification de connexion
app.run(['$rootScope', '$location', 'Member', 'TokenService', function ($rootScope, $location, Member, TokenService) {
    $rootScope.disconnect = function () {
        TokenService.setToken(null);
        localStorage.clear();
        $location.path("/home");

    };
    TokenService.setToken(localStorage.getItem('token'));
    Member.testCo({id :localStorage.getItem('id')},function (m) {
        $rootScope.fullname = m.fullname
    },function (error) {
        localStorage.clear();
        TokenService.setToken('');
    });

    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if (next.templateUrl == 'templates/home.html' || next.templateUrl == 'templates/login.html' || next.templateUrl == 'templates/inscription.html') {
            //Si Connecté
            if (localStorage.getItem('token') != null) {
                //Si encore valide
                TokenService.setToken(localStorage.getItem('token'));
                Member.testCo({id: localStorage.getItem('id')}, function (m) {
                    $location.path("/homeCo")
                }, function (error) {
                    TokenService.setToken("");
                    localStorage.clear();
                    $location.path("/home");
                });
            }
        } else {
            if (localStorage.getItem('token') == null) {
                $location.path("/home")
            } else {
                TokenService.setToken(localStorage.getItem('token'));
                Member.testCo({id: localStorage.getItem('id')}, function (m) {
                }, function (error) {
                    TokenService.setToken("");
                    localStorage.clear();
                    $location.path("/home");
                });
            }
        }
    });
}]);
//Middleware por ajouter le token en fin d'url
app.config(['$httpProvider', 'api', function ($httpProvider, api) {
    $httpProvider.defaults.headers.common.Authorization = "Token token=" + api.key;

    $httpProvider.interceptors.push(['TokenService', function (TokenService) {
        return {
            request: function (config) {
                var token = TokenService.getToken();
                if (token != "") {
                    config.url += ((config.url.indexOf('?') >= 0) ? '&' : '?') + 'token=' + token;
                }
                return config;
            }
        }
    }])
}]);
//Factory
app.factory("Member", ['$resource', 'api', function ($resource, api) {
    return $resource(api.url + "/members/:id", {id: '@_id'},
        {
            signin: {method: 'POST', url: api.url + '/members/signin'},
            testCo: {method: 'GET', url: api.url + '/members/:id/signedin'},
            suppr: {method: 'DELETE', url: api.url + '/members/:id'}
        });
}]);

app.factory('Channel', ['$resource', 'api', function ($resource, api) {
    return $resource(api.url + "/channels/:id", {id: '@_id'},
        {
            suppr: {method: 'DELETE', url: api.url + '/channels/:id'},
            getPost : {method : 'GET', url: api.url + '/channels/:id/posts', isArray: true},
            addPost : {method : 'POST', url: api.url + '/channels/:id/posts'},
            setPost :{method : 'PUT', url: api.url + '/channels/:id/posts/:id_post'},
            delPost : {method : 'DELETE', url: api.url + '/channels/:id/posts/:id_post'}
        });
}]);
//Services
app.service('TokenService', [function () {
    this.token = "";
    this.setToken = function (t) {
        this.token = t;
    };
    this.getToken = function () {
        return this.token;
    }
}]);

app.service('DateService',function () {
   this.getDate = function (d) {
        var array = d.split('T');
        var date = array[0];
        var time = array[1];
        var date_refactor = date.split('-').reverse().join('-');
        var array_time = time.split(':');
        var time_refactor = array_time[0]+":"+array_time[1];
        return "Le "+date_refactor+" à "+time_refactor;
   }
});

// Controllers
app.controller("homeCoController", ['$rootScope', '$scope', 'Member', 'Channel', function ($rootScope, $scope, Member, Channel) {
    
    $scope.members = Member.query(function (membres) {
        for (var i = 0; i < $scope.members.length; i++) {
            angular.forEach(membres, function(value, key) {
                value.me = value._id == localStorage.getItem('id');
            });

        }
    }, function (error) {
        //error
        console.log(error)
    });

    $scope.suppr_m = function (m) {
        Member.suppr({id: m._id}, function () {
            $scope.members = Member.query(function (membres) {

            }, function (error) {
                //error
                console.log(error)
            });
        }, function (error) {
            console.log(error)
        })
    };

    $scope.channels = Channel.query(function (channels) {
    }, function (error) {
        console.log(error);
    });

    $scope.suppr_c = function (m) {
        Channel.suppr({id: m._id}, function () {
            $scope.channels = Channel.query(function (membres) {

            }, function (error) {
                //error
                console.log(error)
            });
        }, function (error) {
            console.log(error)
        })
    };
}]);
app.controller('channelController', ['$scope','Member', 'Channel', '$routeParams','DateService', function ($scope,Member, Channel, $routeParams, DateService) {
    $scope.channel = Channel.get({id: $routeParams.id}, function (success) {

    }, function (error) {

    });
    $scope.posts = Channel.getPost({id:$routeParams.id},function (posts) {
        angular.forEach(posts, function(value, key) {
            value.time = DateService.getDate(value.created_at);
            Member.query(function (members) {
                var find = false;
                angular.forEach(members, function (val,k) {
                    if (val._id == value.member_id || !find){
                        value.member_fullname = val.fullname;
                        find = true
                    }
                });
                if (!find){
                    value.member_fullname ="Ancien membre";
                }
            },function (error) {
                console.log(error)
            })
        });
    },function (error) {

    });

    $scope.addMessage = function () {
        if($scope.message != ""){
            Channel.addPost({id:$routeParams.id},{message:$scope.message},function (success) {
                $scope.message ="";
                $scope.posts = Channel.getPost({id:$routeParams.id},function (posts) {
                    angular.forEach(posts, function(value, key) {
                        value.time = DateService.getDate(value.created_at);
                        Member.query(function (members) {
                            var find = false;
                            angular.forEach(members, function (val,k) {
                                if (val._id == value.member_id || !find){
                                    value.member_fullname = val.fullname;
                                    find = true
                                }
                            });
                            if (!find){
                                value.member_fullname ="Ancien membre";
                            }
                        },function (error) {
                            console.log(error)
                        })
                    });
                },function (error) {
                    console.log(error)
                });
            },function (error) {
                console.log(error)

            });
        }

    };

}]);

app.controller("signupController", ['$scope', 'Member', '$location', function ($scope, Member, $location) {
    $scope.signup = function () {
        $scope.newMember = new Member({
            fullname: $scope.fullname,
            email: $scope.email,
            password: $scope.password
        });

        $scope.newMember.$save(function (m) {
            $location.path("/login");
        }, function (error) {
            $scope.erreur_div = "<div class='alert alert-danger' role='alert'>Erreur : " + error.data.error + "</div>"
            /*  */
        });
    }

}]);
app.controller("newChannelController", ['$scope', 'Channel', '$location', function ($scope, Channel, $location) {
    $scope.newChannel = function () {
        if ($scope.topic == null) {
            $scope.topic = "Pas de sujet spécifié"
        }
        $scope.channel = new Channel({
            label: $scope.label,
            topic: $scope.topic
        });

        $scope.channel.$save(function () {
            $location.path('/homeCo');
        }, function (error) {
            $scope.erreur_div = "<div class='alert alert-danger' role='alert'>Erreur : " + error.data.error + "</div>"
        })
    }
}]);

app.controller("startController", ['$scope', 'Member', 'TokenService', '$location', function ($scope, Member, TokenService, $location) {

    //FONCTION CONNEXION
    $scope.login = function () {
        Member.signin({email: $scope.email, password: $scope.password}, function (m) {
            $scope.member = m;
            TokenService.setToken($scope.member.token);
            localStorage.setItem('token', $scope.member.token);
            localStorage.setItem('id', $scope.member._id);
            $location.path("/homeCo");
        }, function (error) {
            $scope.erreur_div = "<div class='alert alert-danger' role='alert'>Erreur : " + error.data.error + "</div>"
        });
    };

}]);


//TODO : Verifier la validité du token avant chaque action