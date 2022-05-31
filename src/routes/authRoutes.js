const Joi = require('joi')
const BaseRoute = require('./base/baseRoute')
const Boom = require('boom')
const JWT = require('jsonwebtoken')
const PasswordHelper = require('../helpers/passwordHelper')

const USER = {
    username: 'Xuxadasilva',
    password: '123'
}

class AuthRoutes extends BaseRoute {
    constructor(secret, db) {
        super()
        this.secret = secret
        this.db = db
    }

    login() {
        return {
            path: '/login',
            method: 'POST',
            config: {
                auth: false,
                tags: ['api'],
                description: 'Obter token',
                notes: 'faz login com user e senha do banco',
                validate: {
                    failAction: (request, headers, erro) => {
                        console.log('deu ruim')
                        throw new Error(erro);
                    },
                    payload: ({username, password}) => {
                        const schema = Joi.object({
                            username: Joi.string().required(),
                            password: Joi.string().required(),
                        })
                        return schema.validate({username, password})
                    }
                }
            },
            handler: async (request, headers) => {
                const {username, password} = request.payload.value

                console.log(request.payload)

                const [usuario] = await this.db.read({
                    username: username.toLowerCase()
                })

                if (!usuario) {
                    return Boom.unauthorized('O usuário informado não existe!')
                }

                const match = await PasswordHelper.comparePassword(password, usuario.password)

                if (!match) {
                    return Boom.unauthorized('O usuario ou senha ivalidos!')
                }

                const token = JWT.sign({
                    username: username,
                    id: usuario.id
                }, this.secret)
                console.log('token ==> ', token)
                return {token: token}
            }
        }
    }
}

module.exports = AuthRoutes