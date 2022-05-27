const {config} = require('dotenv')
const {join} = require('path')
const {ok} = require('assert')

const env = process.env.NODE_ENV || "dev"
console.log('====>', env)
ok(env === "production" || env === "dev", "a env é invalida, ou dev ou prod")

const configPath = join(__dirname, './config', `.env.${env}`)
config({
  path: configPath
})

const MongoDB = require('./db/strategies/mongodb/mongodb')
const Context = require('./db/strategies/base/contextStrategy')
const HeroiSchema = require('./db/strategies/mongodb/schemas/heroisSchema')
const HeroRoute = require('./routes/heroRoutes')
const AuthRoute = require('./routes/authRoutes')
const Postgres = require('./db/strategies/postgres/postgres')
const UsuarioSchema = require('./db/strategies/postgres/schemas/usuarioSchema')

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiJwt = require('hapi-auth-jwt2')
const HapiSwagger = require('hapi-swagger');

const JWT_SECRET = process.env.JWT_KEY

const app = new Hapi.Server({
  port: process.env.PORT
})

function mapRoutes(instance, methods) {
  return methods.map(method => instance[method]())
}

async function main() {
  const connection = MongoDB.connect()
  const context = new Context(new MongoDB(connection, HeroiSchema))

  const connectionPostgres = await Postgres.connect()
  const model = await Postgres.defineModel(connectionPostgres, UsuarioSchema)
  const contextPostgres = new Context(new Postgres(connectionPostgres, model))

  const swaggerOptions = {
    info: {
      title: 'API Herois - #CursoNodeBR',
      version: 'v1.0',
    }
  }

  await app.register([
    HapiJwt,
    Vision,
    Inert,
    {
      plugin: HapiSwagger,
      options: swaggerOptions 
    }
  ])

  app.auth.strategy('jwt', 'jwt', {
    key: JWT_SECRET,
    // options: {
    //   expiresIn: 20
    // }
    validate: async (dado, request) => {
      // console.log('dadoooooo', dado)
      // const [result] = await contextPostgres.read({
      //   id: dado.id
      // })

      // if(!result) {
      //   return { isValid: false}
      // }
      return { isValid: true }
    }
  })

  app.auth.default('jwt')

  app.route([
    ...mapRoutes(new HeroRoute(context), HeroRoute.method()),
    ...mapRoutes(new AuthRoute(JWT_SECRET, contextPostgres), AuthRoute.method())
  ])

  await app.start()
  console.log('Servidor rodando na porta', app.info.port)
  return app
}
module.exports = main()