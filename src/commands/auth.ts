import {Command, flags} from "@oclif/command"
import {cli} from "cli-ux"
import {config} from "dotenv"
import {getAccessToken} from "../auth/getAccessToken"

interface Tokens {
  readonly accessToken: string
  readonly refreshToken: string
}

type TokenPrinter = (tokens: Tokens) => void

const defaultTokenPrinter: TokenPrinter = cli.styledObject
const envTokenPrinter: TokenPrinter = ({accessToken, refreshToken}) => {
  process.stdout.write(`export YAHOO_ACCESS_TOKEN="${accessToken}"\n`)
  process.stdout.write(`export YAHOO_REFRESH_TOKEN="${refreshToken}"\n`)
}

export default class Auth extends Command {
  static description = "get access token and refresh token"

  static flags = {
    help: flags.help({char: "h"}),
    username: flags.string({
      description: "Yahoo! ID username/email address",
      char: "u",
      env: "YAHOO_ID_USERNAME",
      required: true,
    }),
    password: flags.string({
      description: "Yahoo! ID password",
      char: "p",
      env: "YAHOO_ID_PASSWORD",
      required: true,
    }),
    applicationId: flags.string({
      description: "the application ID",
      char: "a",
      env: "YAHOO_APPLICATION_ID",
      required: true,
    }),
    secret: flags.string({
      description: "the application secret",
      char: "s",
      env: "YAHOO_SECRET",
      required: true,
    }),
    callbackUrl: flags.string({
      description: "the application callback URL",
      char: "c",
      env: "YAHOO_CALLBACK_URL",
      required: true,
    }),
    style: flags.string({
      description: "output style of access token and refresh token",
      options: ["default", "export_env"],
    }),
  }

  async run() {
    const {flags} = this.parse(Auth)
    const ret = await getAccessToken(flags, {
      async start(message: string): Promise<void> {
        cli.action.start(message)
      },
      async end(message: string): Promise<void> {
        cli.action.stop(message)
      },
    })

    const tokenPrinter = flags.style === "export_env" ? envTokenPrinter : defaultTokenPrinter
    tokenPrinter(ret)
  }

  protected async init(): Promise<any> {
    config({path: __dirname + '/../../.env'}) // load .env
  }
}
