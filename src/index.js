const ContextStategy = require("./db/strategies/base/contextStrategy")
const Postgres = require("./db/strategies/postgres/postgres")
const MongoDB = require("./db/strategies/mongodb")

const contextMongo = new ContextStategy(new MongoDB())
contextMongo.create('teste')

const contextPostgres = new ContextStategy(new Postgres())
contextPostgres.create('teste')