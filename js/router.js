/**
 * Created by naay on 16/01/17.
 */

/**
 * Déclaration de l'application routeApp
 */
var routeApp = angular.module('routeApp', [
    // Dépendances du "module"
    'ngRoute',
    'routeAppControllers'
]);

/**
 * Configuration du module principal : routeApp
 */
routeApp.config(['$routeProvider',
    function($routeProvider) {

        // Système de routage
        $routeProvider
            .when('/home', {
                templateUrl: 'template/home.html',
                controller: 'homeController'
            })
            .when('/login', {
                templateUrl: 'template/login.html',
                controller: 'startController'
            })
            .otherwise({
                redirectTo: '/home'
            });
    }
]);