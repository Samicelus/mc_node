/**
 * Created by Administrator on 2016/10/21 0021.
 */
var indexApp = angular.module('indexApp', []);

indexApp.controller('mainCtrl', function ($scope, $http) {
    $scope.username = "";
    $scope.password = "";
    $scope.new_password = "";
    $scope.old_password = "";
    $http({
        method: 'GET',
        url: 'http://119.23.73.86:8030/checkLogin'
    }).then(function successCallback(response){
        if(response.data.result == "TRUE"){
            $scope.username = response.data.data;
            $scope.no_log = false;
            $scope.logged = true;
        }
    },function errorCallback(response){
        $scope.no_log = true;
        $scope.logged = false;
        console.log(response.data);
    });

    $scope.login = function(){
        $http({
            method: 'POST',
            url: 'http://119.23.73.86:8030/login',
            data: {
                name: $scope.username,
                password: $scope.password
                }
        }).then(function successCallback(response){
            if(response.data.result == "TRUE"){
                $scope.username = response.data.data.username;
                $scope.no_log = false;
                $scope.logged = true;
            }
        },function errorCallback(response){
            console.log(response.data);
        });
    }
    $scope.chgPwd = function(){
        var that = this;
        $http({
            method: 'POST',
            url: 'http://119.23.73.86:8030/changePassword',
            data: {
                old_password: that.old_password,
                new_password: that.new_password
            }
        }).then(function successCallback(response){
            console.log(response.data);
        },function errorCallback(response){
            console.log(response.data);
        });
    }
});