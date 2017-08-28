/**
 * Created by Administrator on 2016/10/21 0021.
 */
var indexApp = angular.module('indexApp', []);

indexApp.controller('mainCtrl', function ($scope, $http) {
    $scope.username = "";
    $scope.password = "";
    $scope.new_password = "";
    $scope.old_password = "";
    $scope.verify_password = "";
    $http({
        method: 'GET',
        url: 'http://119.23.73.86:8030/checkLogin'
    }).then(function successCallback(response){
        if(response.data.result == "TRUE"){
            $scope.username = response.data.data;
            $scope.no_log = false;
            $scope.logged = true;
        }else{
            $scope.no_log = true;
            $scope.logged = false;
        }
    },function errorCallback(response){
        $scope.no_log = true;
        $scope.logged = false;
        console.log(response.data);
    });
    $scope.getEmail = function(){
        $http({
            method: 'GET',
            url: 'http://119.23.73.86:8030/getEmail'
        }).then(function successCallback(response) {
            console.log(response.data);
            if (response.data.result == "TRUE") {
                alert(response.data.data);
            } else {
                alert("获取Email失败！");
            }
        }, function errorCallback(response) {
            console.log(response.data);
        });
    };
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
            }else{
                console.log(response.data);
                alert("登录失败！");
            }
        },function errorCallback(response){
            console.log(response.data);
        });
    }
    $scope.chgPwd = function(){
        if($scope.new_password != $scope.verify_password){
            alert("两次输入的密码不一致！");
        }else if(!$scope.old_password){
            alert("请输入旧密码");
        }else {
            $http({
                method: 'POST',
                url: 'http://119.23.73.86:8030/changePassword',
                data: {
                    old_password: $scope.old_password,
                    new_password: $scope.new_password
                }
            }).then(function successCallback(response) {
                console.log(response.data);
                if (response.data.result == "TRUE") {
                    $scope.new_password = "";
                    $scope.old_password = "";
                    $scope.verify_password = "";
                    alert(response.data.data);
                } else {
                    alert("修改失败！");
                }
            }, function errorCallback(response) {
                console.log(response.data);
            });
        }
    }
});