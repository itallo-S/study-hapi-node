const assert = require('assert')
const api = require('../api')
const Context = require('../db/strategies/base/contextStrategy')
const Postgres = require('../db/strategies/postgres/postgres')
const UserSchema = require('../db/strategies/postgres/schemas/usuarioSchema')

let app = {}
const USER = {
    username: 'Xuxadasilva',
    password: '123'
}
const USER_DB = {
    username: USER.username.toLowerCase(),
    password: '$2b$04$bdAmBPsCobJtHKt.JkZMOOkuTXlqDjvFzz5jUzJ4K1DmEmHHGGOCG'
}
let connection = ''
let userCreated = ''
describe('Auth test suite', function () {
    this.beforeAll(async () => {
        app = await api
        const connectionPostgres = await Postgres.connect()
        const model = await Postgres.defineModel(connectionPostgres, UserSchema)
        connection = new Context(new Postgres(connectionPostgres, model))
        userCreated = await connection.update(null, USER_DB, true)
    })
    this.afterAll(async () => {
        await connection.delete()
    })

    it('deve obter um token', async () => {
        const result = await app.inject({
            method: 'POST',
            url: '/login',
            payload: {username: 'Xuxadasilva', password: '123'},
        })
        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.deepEqual(statusCode, 200)
        assert.ok(dados.token.length > 10)
    })

    it('deve retornar não autorizado ao tentar obter um login errado', async () => {
        const result = await app.inject({
            method: 'POST',
            url: '/login',
            payload: {
                username: 'itallo',
                password: '123'
            },
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.deepEqual(statusCode, 401)
        assert.deepEqual(dados.error, 'Unauthorized')
    })
})