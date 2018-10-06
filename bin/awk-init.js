#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const fs = require('fs')
const inquirer = require('inquirer')
const download = require('download-git-repo')
const ora = require('ora')

program
  .usage('<template-type>')
/* help */
program.on('--help', function () {
    console.log(`
    Examples:

        $ awk init ${chalk.grey('[template-type]')}

        [template-type] : default ${chalk.grey('其他类型待添加')}
    `)
})
program.parse(process.argv);

const templateType = program.args[0] || 'default'
let template // 模版仓库地址
let templateSusscedTips // 初始化完成后的提示
switch(templateType) {
    case 'default':
        template = 'aweikalee/awk-template-default'
        templateSusscedTips = `
${chalk.grey('-----------------------------------------------')}

    打开文件夹后 可以进行以下操作：

        ${chalk.cyan('$ npm run dev')}

        ${chalk.cyan('$ npm run build')}
        `
        break
    default:
        console.log('')
        console.log(
            chalk.white.bgRed('ERROR')
            + ' [template-type] : '
            + chalk.yellow(templateType)
            + ' 模版类型不存在'
        )
        process.exit()
}

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

const nameQuestion = {
    type: 'input',
    message: `项目名称: `,
    name: 'name',
    default: 'awk'
};

inquirer.prompt([
    nameQuestion,
]).then(function (answers) {
    console.log('')
    const spinner = ora('正在下载文件...').start();
    download(template, answers.name, function (err) {
        if (err) {
            spinner.warn(['下载失败'])
            throw err
        }
        spinner.succeed('下载完成')
        spinner.start('正在配置中..')
        fs.readFile(`${process.cwd()}/${answers.name}/package.json`, (err, data) => {
            if (err) throw err;
            let _data = JSON.parse(data.toString())
            _data.name = answers.name
            _data.version = '0.0.0'
            let str = JSON.stringify(_data, null, 4);
            fs.writeFile(`${process.cwd()}/${answers.name}/package.json`, str, function (err) {
                if (err) throw err;
                spinner.succeed('配置完成')
                if (templateSusscedTips) console.log(templateSusscedTips)
                process.exit()
            })
        })
    })
})