/**
 * Created by Administrator on 2016/10/21 0021.
 */
var indexApp = angular.module('indexApp', []);

indexApp.controller('mainCtrl', function ($scope, $http) {
    $scope.login = function(){
        $http({
            method: 'POST',
            url: 'http://119.23.73.86:8030/login',
            data: {
                name: "samicelus",
                password: "123edsaqw"
                }
        }).then(function successCallback(response){
            console.log(response.data)
        },function errorCallback(response){
            console.log(response.data)
        });
    }
    $scope.chgPwd = function(){
        $http({
            method: 'POST',
            url: 'http://119.23.73.86:8030/changePassword',
            data: {
                old_password: "123edsaqw",
                new_password: "123edsaqw"
            }
        }).then(function successCallback(response){
            console.log(response.data)
        },function errorCallback(response){
            console.log(response.data)
        });
    }
});