var CronJob = require('cron').CronJob;

function Cron(){
	this.jobs = {};
}

//系统重启，重新读取每个人的配置添加定时任务
Cron.prototype.init = function(){
	var that = this;
	console.log('初始化定时任务...');
}

Cron.prototype.task = function(){
	var job = new CronJob('* * 18 * * *', function(){
		//执行任务的内容
		console.log("this is a cron job console...")
	}, null, true, '');
	var job_id = "ID00001"	// a job id to stop this job
	this.jobs[job_id] = job;
}


//停止定时任务
Cron.prototype.stop = function(job_id){
	this.jobs[job_id].stop();
}

module.exports = function(){
	return new Cron();
}