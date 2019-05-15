import * as puppeteer from "puppeteer"
import * as request from "request-promise-native"

const sleep = async (delay: number) => new Promise(resolve => setTimeout(resolve, delay))

export interface Input {
  readonly username: string
  readonly password: string
  readonly applicationId: string
  readonly secret: string
  readonly callbackUrl: string
}

export interface Logger {
  start(message: string): Promise<void>

  end(message: string): Promise<void>
}

export interface Output {
  readonly accessToken: string
  readonly refreshToken: string
  readonly expireIn: string
}

type GetAccessToken = (input: Input, logger: Logger) => Promise<Output>

export const getAccessToken: GetAccessToken = async ({
  username,
  password,
  applicationId,
  secret,
  callbackUrl,
}, logger) => {
  await logger.start("Launching Puppeteer")
  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage()
  await logger.end("Puppeteer launched.")

  const authUrl = `https://auth.login.yahoo.co.jp/yconnect/v1/authorization?response_type=code+id_token&client_id=${applicationId}&redirect_uri=${callbackUrl}&scope=openid+profile&nonce=1`
  await logger.start(`Opening ${authUrl}...`)
  await page.goto(authUrl)
  await logger.end("Opened auth page.")

  await logger.start("Filling in username")
  await page.type("#username", username)
  await page.click("#btnNext")
  await logger.end("Username was filled.")

  await logger.start("Filling in password")
  await page.waitForSelector("#passwd", {visible: true})
  await page.waitForSelector("#btnSubmit", {visible: true})
  await sleep(5000) // 速すぎると画像認証に入っちゃう
  await page.type("#passwd", password)
  await logger.end("Password was filled.")

  await logger.start("Logging in")
  await page.click("#btnSubmit")
  await page.waitForSelector("#msthdLoginName", {visible: true})
  await logger.end("Logged in.")

  await logger.start("Getting auth code")
  const url = new URL(await page.url())
  const code = url.searchParams.get("code")
  await logger.end(`code: ${code}`)

  await browser.close()

  await logger.start("Getting access token")
  const response = await request({
    method: "POST",
    url: "https://auth.login.yahoo.co.jp/yconnect/v1/token",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${applicationId}:${secret}`).toString("base64"),
    },
    form: {
      "grant_type": "authorization_code",
      "code": code,
      "redirect_uri": callbackUrl,
    },
  })
  await logger.end("Access token has been taken")
  const data = JSON.parse(response)
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expireIn: data.expires_in,
  }
}
