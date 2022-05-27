const Joi = require('joi')
const BaseRoute = require('./base/baseRoute')
const Boom = require('boom')


const headers = Joi.object({
    authorization: Joi.string().required()
}).unknown()

class HeroRoutes extends BaseRoute {
    constructor(db) {
        super()
        this.db = db
    }

    list() {
        return {
            method: 'GET',
            path: '/herois',
            config: {
                description: 'Deve listar herois',
                notes: 'pode paginar resultados e filtrar por nome',
                tags: ['api'],
                validate: {
                    failAction: (request, headers, erro) => {
                        console.log('deu ruim')
                        throw new Error(erro);
                    },
                    query: ({skip, limit, nome}) => {
                        const schema = Joi.object({
                            skip: Joi.number().integer().default(0),
                            limit: Joi.number().integer().default(10),
                            nome: Joi.string().min(3).max(50)
                        })
                        return schema.validate({skip: skip, limit: limit, nome: nome}, {abortEarly: false})
                        
                    },
                    headers
                }
            },
            handler: async (request, headers) => {
                try {
                    const { skip, limit, nome } = request.orig.query
                    
                    const query = nome ? { nome: {$regex: `.*${nome}*.`} } : {}

                    return await this.db.read(query, skip, limit)

                } catch (error) {
                    return Boom.internal()
                }
            }
        }
    }

    create() {
        return {
            path: '/herois',
            method: 'POST',
            config: {
                description: 'Deve cadastrar herois',
                notes: 'deve cadastrar heroi por nome e poder',
                tags: ['api'],
                validate: {
                    query: ({nome, poder}) => {
                        const schema = Joi.object({
                            nome: Joi.string().required().min(3).max(100),
                            poder: Joi.string().required().min(2).max(100),
                        })
                        return schema.validate({nome: nome, poder: poder}, {abortEarly: false})
                    },
                    headers
                }
            },
            handler: async (request) => {
                try {
                    const {nome, poder} = request.payload
                    const result = await this.db.create({nome, poder})
                    return {
                        message: 'Heroi cadastrado com sucesso!',
                        _id: result._id
                    }
                } catch(error) {
                    return Boom.internal()
                }
            }
        }
    }

    update() {
        return {
            path: '/herois/{id}',
            method: 'PATCH',
            config: {
                description: 'Deve atuaizar herois por id',
                notes: 'pode atualizar qualquer campo',
                tags: ['api'],
                validate: {
                    params: ({id}) => {
                        const schema = Joi.object({
                            nome: Joi.string().required(),
                        })
                        return schema.validate({id})
                    },
                    payload: ({nome, poder}) => {
                        const schema = Joi.object({
                            nome: Joi.string().min(3).max(100),
                            poder: Joi.string().min(2).max(100)
                        })
                        return schema.validate({nome, poder})
                    },
                    headers
                }
            },
            handler: async (request, headers) => {
                try {
                    const {id} = request.params.value

                    const payload = request.payload.value
                    const dadosString = JSON.stringify(payload)
                    const dados = JSON.parse(dadosString)

                    const result = await this.db.update(id, dados)

                    if (result.modifiedCount !== 1) return  Boom.preconditionFailed('ID Não encontrado no banco!')

                    return {message: 'Heroi atualizado com sucesso!'}
                } catch (error) {
                    return Boom.internal()
                }
            }
        }
    }

    delete() {
        return {
            path: '/herois/{id}',
            method: 'DELETE',
            config: {
                description: 'Deve remover herois por id',
                notes: 'pode remover herois por id',
                tags: ['api'],
                validate: {
                    params: ({id}) => {
                        const schema = Joi.object({
                            id: Joi.string().required()
                        })
                        return schema.validate({id})
                    },
                    headers
                }
            },
            handler: async (request, headers) => {
                try {
                    const {id} = request.params.value

                    const result = await this.db.delete({_id: id})

                    if (result.deletedCount != 1) return Boom.preconditionFailed('ID Não encontrado no banco!')

                    return { message: 'Heroi Removido com sucesso!'}
                } catch (error) {
                    return Boom.internal()
                }
            }
        }
    }
}

module.exports = HeroRoutes