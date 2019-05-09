const puppeteer = require('puppeteer')
const request = require('request-promise-native')
require('dotenv').config()

const username = process.env.YAHOO_ID_USERNAME
const password = process.env.YAHOO_ID_PASSWORD
const applicationId = process.env.YAHOO_APPLICATION_ID
const secret = process.env.YAHOO_SECRET
const callbackUrl = process.env.YAHOO_CALLBACK_URL

;

async function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay))
}

(async () => {
    console.info('Launching Puppeteer...')
    const browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()

    const authUrl = `https://auth.login.yahoo.co.jp/yconnect/v1/authorization?response_type=code+id_token&client_id=${applicationId}&redirect_uri=${callbackUrl}&scope=openid+profile&nonce=1`
    console.info(`Opening ${authUrl}...`)
    await page.goto(authUrl)

    console.info(`Filling in username...`)
    await page.type('#username', username)
    await page.click('#btnNext')

    console.info(`Filling in password...`)
    await page.waitForSelector('#passwd', {visible: true})
    await page.waitForSelector('#btnSubmit', {visible: true})
    await sleep(5000) // 速すぎると画像認証に入っちゃう
    await page.type('#passwd', password)

    console.info(`Logging in...`)
    await page.click('#btnSubmit')
    await page.waitForSelector('#msthdLoginName', {visible: true})

    const url = new URL(await page.url())
    const code = url.searchParams.get('code')
    console.log(`Code is ${code}`)

    await browser.close()

    const response = await request({
        method: 'POST',
        url: 'https://auth.login.yahoo.co.jp/yconnect/v1/token',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${applicationId}:${secret}`).toString('base64')
        },
        form: {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': callbackUrl,
        }
    })
    const data = JSON.parse(response)
    console.log(`Access token: ${data.access_token}`)
    console.log(`Refresh token: ${data.refresh_token}`)
})()
