const Sequelize = require('sequelize')
const ICrud = require("../interfaces/interfaceCrud")

class Postgres extends ICrud {
    constructor(connection, schema) {
        super()
        this._connection = connection
        this._schema = schema
    }

    async isConnected() {
        try {
            await this._connection.authenticate()
            return true
        } catch (error) {
            console.log('fail', error)
            return false
        }
    }

    static async defineModel(connection, schema) {
        const model = connection.define(
            schema.name,
            schema.schema,
            schema.options
        )
        await model.sync()
        return model
    }

    static async connect() {
        const connection = new Sequelize(process.env.POSTGRES_URL,
            {
                quoteIdentifiers: false,
                operatorsAliases: false,
                logging: false,
                dialectOptions: {
                    // ssl:{
                    //     require: process.env.SSL_DB,
                    //     rejectUnauthorized: false,
                    // }
                }
            })
        return connection
    }

    async create(item) {
        const {dataValues} = await this._schema.create(item)
        return dataValues
    }

    async read(item = {}) {
        return this._schema.findAll({where: item, raw: true})
    }

    async update(id, item, upsert = false) {
        const fn = upsert ? 'upsert' : 'update'
        return this._schema.update(item, {where: {id: id}, raw: true})
    }
    async delete(id) {
        const query = id ?  {id} : {}
        return this._schema.destroy({where: query})
    }
}

module.exports = Postgres