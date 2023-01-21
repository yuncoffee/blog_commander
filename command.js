#!/usr/bin/env node
import { program } from "commander"
import * as fs from "fs"
import * as path from "path"
import inquirer from "inquirer"
import chalk from "chalk"

// const program = commander.program
const getCurrentKstDate = () => {
    const date = new Date()
    const offset = date.getTimezoneOffset() * 60000
    const dateOffset = new Date(date.getTime() - offset).toISOString()
    return dateOffset
}

const COLOR_SUCCESS = "#48D597"
const COLOR_FAIL = "#FF2929"
const COLOR_QUERY = "#EBEBEB"
const COLOR_QUERYEND = "#C4C4C4"
const COLOR_NOTICE = "#F8E03B"
const DATE_KST = getCurrentKstDate()

const NOTE_TEMPLATE = (name, date, count) => {
    return `---
slug: ${count}장
title: "#${count} ${name}"
description: "설명을 작성해주세요."
authors: coffee
tags: [Notes]
date: ${date}
draft: true
---

{/* intro title */}

<!--truncate-->

{/* intro */}

## Wirte Intro header

// 여기에 이미지가 있으면 좋을 듯 ㅎ?

### Write Section Title

write contents!

## Write Outro header

`
}

const exist = (dir) => {
    try {
        fs.accessSync(
            dir,
            fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK
        )
        return true
    } catch (e) {
        return false
    }
}

const makeDir = (date, count) => {
    const postDirName = `./blog/${date.split("T")[0]}-${count}장/img`
    const dirname = path
        .relative(".", path.normalize(postDirName))
        .split(path.sep)
        .filter((p) => !!p)

    dirname.forEach((d, idx) => {
        const pathBuilder = dirname.slice(0, idx + 1).join(path.sep)

        if (!exist(pathBuilder)) {
            fs.mkdirSync(`${pathBuilder}`)
            console.log(chalk.bold.hex(`${COLOR_SUCCESS}`)("폴더 생성 완료."))
        } else {
            console.error(
                chalk.bold.hex(`${COLOR_FAIL}`)(
                    "이미 동일한 폴더명이 존재합니다."
                )
            )
        }
    })
}

const createNote = (name, date, count) => {
    makeDir(date, count)
    const _dir = `./blog/${date.split("T")[0]}-${count}장`
    const fileList = [
        [path.join(`${_dir}`, `index.mdx`), NOTE_TEMPLATE(name, date, count)],
    ]

    fileList.forEach((file, index) => {
        if (exist(file)) {
            console.error(
                chalk.bold.hex(`${COLOR_FAIL}`)("이미 해당 파일이 존재합니다")
            )
        } else {
            fs.writeFileSync(file[0], file[1])
            console.log(
                chalk.bold.hex(`${COLOR_SUCCESS}`)(file[0], "생성 완료")
            )
        }
    })
}

program.version("1.0.0", "-v, --version")

program
    .command("note <name>")
    .usage("<name> --date --count --path")
    .description("Note 템플릿을 생성합니다")
    .alias("nt")
    .option("-d, --date", "생성일", `${DATE_KST}`)
    .option("-c, --count", "포스팅 카운트", 0)
    .option("-p, --path ", "생성할 경로", "./blog")
    .action((name, options) => {
        createNote(name, options.date, options.count)
    })

// program
//     .command("book <name>")
//     .usage("<name> --directory [path]")
//     .description("컴포넌트 템플릿을 생성합니다")
//     .alias("book")
//     .option("-d, --directory [path]", "생성할 경로", ".")
//     .action((name, options) => {
//         createBook(name, options.directory)
//     })

program
    .command("post")
    .description("컴포넌트 템플릿 질의응답")
    .action(() => {
        console.log(
            chalk.hex(`${COLOR_NOTICE}`)(`현재 시간은 : ${DATE_KST}다..`)
        )
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "type",
                    message: chalk.hex(`${COLOR_QUERY}`)(
                        "어떤 글을 작성할거니? note | book"
                    ),
                    default: "note",
                },
                {
                    type: "input",
                    name: "name",
                    message: chalk.hex(`${COLOR_QUERY}`)(
                        "작성할 글의 제목은 무엇이니?"
                    ),
                    default: "오늘의 끄적임",
                },
                {
                    type: "input",
                    name: "count",
                    message: chalk.hex(`${COLOR_QUERY}`)("몇번째 글이니?"),
                    default: 0,
                },
                {
                    type: "confirm",
                    name: "confirm",
                    message: chalk.hex(`${COLOR_QUERY}`)("만든다?"),
                },
            ])
            .then((answers) => {
                if (answers.confirm) {
                    createNote(answers.name, `${DATE_KST}`, answers.count)
                    console.log(
                        chalk.hex(`${COLOR_QUERYEND}`)("터미널을 종료합니다.")
                    )
                }
            })
    })

program
    .action((cmd, args) => {
        if (args) {
            console.log(
                chalk.bold.hex(`${COLOR_NOTICE}`)(
                    "해당 명령어를 찾을 수 없습니다."
                )
            )
            program.help()
        }
    })
    .parse(process.argv)
