#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const program = require('commander');
const inquirer = require('inquirer')
const download = require('download-git-repo');
const chalk = require('chalk');
const ora = require('ora');

// 删除文件夹
function deleteFolder(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
        var curPath = path + "/" + file;
        if (fs.statSync(curPath).isDirectory()) { // recurse
            deleteFolder(curPath);
        } else { // delete file
            fs.unlinkSync(curPath);
        }
        });
        fs.rmdirSync(path);
    }
}

program
    .version('0.0.1')
    .option('i, init', '初始化项目')

program.parse(process.argv);

const nameQuestion = {
    type: 'input',
    message: `项目名称: `,
    name: 'name',
    default: 'awk'
};

if (program.init) {
    console.info('');
    inquirer.prompt([
        nameQuestion,
    ]).then(function (answers) {
        const spinner = ora('正在下载文件').start();
        download('aweikalee/awk-cli-init', answers.name, function (err) {
            if (!err) {
                spinner.clear()
                console.info('');
                console.info(chalk.green('-----------------------------------------------------'));
                console.info('');
                spinner.succeed(['项目创建成功,请继续进行以下操作:'])
                console.info('');
                console.info(chalk.green('-----------------------------------------------------'));
                console.info('');
                
                fs.readFile(`${process.cwd()}/${answers.name}/package.json`, (err, data) => {
                    if (err) throw err;
                    let _data = JSON.parse(data.toString())
                    _data.name = answers.name
                    let str = JSON.stringify(_data, null, 4);
                    fs.writeFile(`${process.cwd()}/${answers.name}/package.json`, str, function (err) {
                        if (err) throw err;
                        process.exit()
                    })
                });
            } else {
                spinner.warn(['下载失败'])
                process.exit()
            }
        })
    });
}