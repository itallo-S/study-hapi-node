const assert = require('assert')
const api = require('../api')
let app = {}

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjUzNDMzMzgwfQ.vXT5sC-7QhLszXCBBqwQnh9zRAlfjfqJNn1VJKUx1Nk'
const headers = {
    Authorization: TOKEN
}

const MOCK_HEROI_CADASTRAR = {
  nome: 'Chapolin Colorado',
  poder: 'Marreta Bionica'
}

const MOCK_HEROI_INICIAL = {
    nome: 'Gavião Negro',
    poder: 'A mira'
}

let MOCK_ID = ''

describe('Suite de testes da API Heroes', function () {
    this.beforeAll(async () => {
        app = await api
        const result = await app.inject({
            method: 'POST',
            url: '/herois',
            headers,
            payload: JSON.stringify(MOCK_HEROI_INICIAL)
        })
        const dados = JSON.parse(result.payload)
        MOCK_ID = dados._id
    })

    it('listar herois', async () => {
        const result = await (await api).inject({
            method: 'GET',
            headers,
            url: '/herois?skip=0&limit=3'
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })

    it('listar /herois - deve retornar somente 1 registro', async () => {
        const TAMANHO_LIMITE = 1
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/herois?skip=0&limit=${TAMANHO_LIMITE}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode
        assert.deepEqual(statusCode, 200)
        assert.ok(dados.length >= TAMANHO_LIMITE)
    })

    it('listar /herois - deve retornar erro com limit incorreto', async () => {
        const TAMANHO_LIMITE = 'a'
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/herois?skip=0&limit=${TAMANHO_LIMITE}`
        })

        const statusCode = result.statusCode
        assert.deepEqual(statusCode, 500)
    })

    it('listar /herois - deve filtrar um item', async () => {
        const TAMANHO_LIMITE = 200
        const NOME_HEROI = MOCK_HEROI_INICIAL.nome
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/herois?skip=0&limit=${TAMANHO_LIMITE}&nome=${NOME_HEROI}`
        })
        
        const [dados] = JSON.parse(result.payload)
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
        assert.ok(dados.nome ===  NOME_HEROI)
    })

    it('Cadastrar POST - /herois', async () => {
        const result = await app.inject({
            method: 'POST',
            url: `/herois`,
            headers,
            payload: JSON.stringify(MOCK_HEROI_CADASTRAR)
        })
        const statusCode = result.statusCode
        const {message, _id} =JSON.parse(result.payload)
        assert.ok(statusCode === 200)
        assert.notEqual(_id, undefined)
        assert.deepEqual(message, "Heroi cadastrado com sucesso!")
    })

    it('Atualizar PATCH - /herois/:id', async () => {
        const _id = MOCK_ID
        const expected = {
            poder: 'Super Mira',
        }
        const result = await app.inject({
            method: 'PATCH',
            url: `/herois/${_id}`,
            headers,
            payload: JSON.stringify(expected)
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode === 200)
        assert.deepEqual(dados.message, 'Heroi atualizado com sucesso!')
    })

    it('Atualizar PATCH - /herois/:id - não deve atualizar com ID incorreto!', async () => {
        const _id = `627b9a237d83c2089506a80d`
        const expected = {
            poder: 'Super Mira',
        }
        const result = await app.inject({
            method: 'PATCH',
            url: `/herois/${_id}`,
            headers,
            payload: JSON.stringify(expected)
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode === 412)
        assert.deepEqual(dados.message, 'ID Não encontrado no banco!')
    })

    it('remover DELETE = /herois/:id', async () => {
        const _id = MOCK_ID
        const result = await app.inject({
            method: 'DELETE',
            headers,
            url: `/herois/${_id}`
        })
        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode === 200)
        assert.deepEqual(dados.message, 'Heroi Removido com sucesso!')
    })

    it('remover DELETE - /herois/:id - não deve remover com ID incorreto', async () => {
        const _id = `627b9a237d83c2089506a80d`
        const result = await app.inject({
            method: 'DELETE',
            headers,
            url: `/herois/${_id}`
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode === 412)
        assert.deepEqual(dados.message, 'ID Não encontrado no banco!')
    })

    it('remover DELETE - /herois/:id - não deve remover com ID invalido', async () => {
        const _id = `ID_INVALIDO`
        const result = await app.inject({
            method: 'DELETE',
            headers,
            url: `/herois/${_id}`
        })

        const dados = JSON.parse(result.payload)
        const expected = {
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'An internal server error occurred'
        }

        assert.deepEqual(dados, expected)
    })
})