#!/usr/bin/env node

import inquirer from "inquirer"
import DatePrompt from "inquirer-date-prompt"
import NodeCache from "node-cache"
import { initialPrompt, datePrompt, tokenPrompt, shortenDate } from "./prompts.js"
import { createSpinner } from "nanospinner"
import fs from "fs"
import axios from "axios"

inquirer.registerPrompt("date", DatePrompt)

const CCBaseURL = 'https://min-api.cryptocompare.com/data/pricemulti?'
const headersFormat = ['date', 'tx-type', 'token', 'amount']
const fileName = 'transactions.csv'
const txCache = new NodeCache()
const spinner = createSpinner('Fetching portfolio.')

let tokenObj = {}
let answers = {}

const readCsv = async (opt = { token: '', date: 0 }) => {
    const readStream = fs.createReadStream(fileName, { encoding: "utf-8" })

    try {
        return new Promise((resolve, reject) => {
            readStream
                .on("data", (chunk) => {
                    let chunkString = chunk.toString()
                    let chunked = chunkString.slice(chunkString.indexOf("\n") + 1).split("\n")

                    chunked.map(function (row) {
                        const values = row.split([','])
                        let dateIncluded = opt.date && opt.date < parseInt(values[headersFormat.indexOf('date')]) ? false : true

                        if (headersFormat.length == values.length) {
                            if (!tokenObj[values[headersFormat.indexOf('token')]]) {
                                tokenObj[values[headersFormat.indexOf('token')]] = {
                                    totalAmount: 0
                                }
                            }

                            let tokenAmount = parseFloat(values[headersFormat.indexOf('amount')])

                            if (tokenAmount && dateIncluded) {
                                switch (values[headersFormat.indexOf('tx-type')]) {
                                    case 'DEPOSIT':
                                        tokenObj[values[headersFormat.indexOf('token')]]['totalAmount'] += tokenAmount
                                        break
                                    case 'WITHDRAWAL':
                                        tokenObj[values[headersFormat.indexOf('token')]]['totalAmount'] -= tokenAmount
                                        break
                                    default:
                                }
                            }
                        }
                    })
                })
            readStream.on("end", () => {
                resolve(tokenObj)
                tokenObj = {}
            })
            readStream.on("error", (err) => {
                reject(err)
            })
        })
    } catch (err) {
        throw err
    }
}

const getTokenInUsdAmount = async (data, format = {}) => {
    if (!txCache.has("tokenInUSD")) {
        let ownedTokens = ''
        const [key, value] = Object.entries(data).pop()

        for (const token in data) {
            ownedTokens += token + (key == token ? '' : ',')
        }

        await axios.get(`${CCBaseURL}fsyms=${ownedTokens}&tsyms=USD`, {
            headers: { "apiKey": process.env['CRYPTO_COMPARE_API_KEY'] }
        }).then(res => {
            txCache.set("tokenInUSD", res.data, 36000)
            resultFormatter(data, format)
        })

    } else {
        resultFormatter(data, format)
    }
}

const resultFormatter = async (data, logFormat) => {
    spinner.success({ text: 'Porfolio fetched succesfully!' })
    const { format } = new Intl.NumberFormat('us-EN',
        {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 3
        })

    let usdConversion = txCache.get("tokenInUSD")
    let formatted = {}

    for (const token in data) {
        formatted[token] = {
            [token]: data[token].totalAmount,
            USD: format(data[token].totalAmount * usdConversion[token]['USD'])
        }
    }

    formatted = {
        [logFormat.dateCacheId ? logFormat.dateCacheId : 'Latest']
            : logFormat.token ? formatted[logFormat.token] : formatted
    }
    console.log('\n\n\n Your Portfolio')
    console.table(formatted)
    console.log('\n\n')
    await getPortfolioDetails()
}

const handleAnswer = async (answer) => {
    const cacheId = answer.dateCacheId ? answer.dateCacheId : 'allToken'

    spinner.start()
    if (txCache.has(cacheId)) {
        getTokenInUsdAmount(txCache.get(cacheId), answer)
    } else {
        await readCsv(answer).then(res => {
            getTokenInUsdAmount(res, answer)
            txCache.set(cacheId, res, 36000)
        })
    }

    answers = {}
}

const getPortfolioDetails = async () => {

    await inquirer.prompt(initialPrompt).then(async (answer) => {
        let timestamp, coinInput, dateCacheId
        switch (answer.proceed) {
            case "noParams":
                break

            case "Token":
                coinInput = await inquirer.prompt(tokenPrompt).then(res => { return res.coinInput })
                answers.token = coinInput.toString().toUpperCase()
                break

            case "Date":
                timestamp = await inquirer.prompt(datePrompt).then(res => { return res.timestamp })
                dateCacheId = shortenDate(timestamp)

                answers.date = timestamp
                answers.dateCacheId = dateCacheId
                break

            case "TokenDate":
                timestamp = await inquirer.prompt(datePrompt).then(res => { return res.timestamp })
                coinInput = await inquirer.prompt(tokenPrompt).then(res => { return res.coinInput })
                dateCacheId = shortenDate(timestamp)

                answers = { token: coinInput.toString().toUpperCase(), date: timestamp }
                answers.dateCacheId = dateCacheId
                break
        }

        handleAnswer(answers)
    })
}

await getPortfolioDetails()