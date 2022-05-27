//cria o banco e seleciona
use herois

//mostra as coleções
show collections

db.herois.isert({
    nome: 'Flash',
    poder: 'Velocidade',
    dataNascimento: '1998-01-01'
})

db.herois.find()
db.herois.find().pretty()

// Traz a informação poder e ignora o ID para que não seja retornado junto
db.herois.find({}, {poder: 1, _id: 0}).pretty()

// Para atualizar uma informação de um documento sem alterar/apagar outras use $set:{}
db.herois.update({_id: 12343435345}, {$set: {nome: 'Lanterna Verde'}})

// remove tudo
db.herois.remove({})
// remove um
db.herois.remove({nome: "Mulher maravilha"})