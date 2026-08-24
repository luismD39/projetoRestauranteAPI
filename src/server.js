require("dotenv").config()
const express = require("express")
const db = require("./config/database")
const cors = require("cors")

const app = express()

const PORT = 3001

app.use(cors())
app.use(express.json())

app.get("/", (req,res) => {
    res.json({
        mensagem:"API funcionando."
    })
})

app.post("/produto", async (req,res)=>{
    try {

        const {descricao, categoria, preco, imagem} = req.body
        const sql = "INSERT INTO produto(descricao, categoria, preco, imagem) VALUES(?,?,?,?)"
        const [result] = await db.execute(sql,[descricao, categoria, preco, imagem])

        res.status(201).json({
            mensagem:"Produto cadastrado com sucesso!",
            id: result.insertId,
            produto:{
                id:result.insertId,
                descricao,
                categoria,
                preco,
                imagem
            }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            mensagem:"Erro ao cadastrar produto!"
        })
    }

})

app.listen(PORT, ()=> {
    console.log("Servidor rodando na porta 3001.")
})

//CARDAPIO
app.get("/cardapio", async (req, res) =>{
    try {
        
        const {descricao, categoria, preco, imagem} = req.body
        const sql = "SELECT * FROM produto"
        const result = await db.execute(sql)

    } catch (error) {
        console.log(error)
        res.status(500).json({
            mensagem:"Erro ao listar produtos!"
        })
    }
})

