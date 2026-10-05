require("dotenv").config()
const bcrypt = require("bcrypt")
const auth = require("./middleware/auth")
const jwt = require("jsonwebtoken")
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

app.post("/registrar", async (req,res)=>{
    try {
        const {nome, email, senha} = req.body

        if(!nome || !email || !senha){
            return res.status(400).json({
                mensagem: "Preencha todos os campos"
            })
        }

        const [usuarioExistente] = await db.query(
            "SELECT id FROM usuario WHERE email = ?",
            [email]
        )

        if(usuarioExistente.length > 0){
            return res.status(400).json({
                mensagem: "E-mail já cadastrado"
            })
        }

        const senhaHash = await bcrypt.hash(senha,10)

        await db.query(
            "INSERT INTO usuario(nome,email,senha) VALUES(?,?,?)",
            [nome, email, senhaHash]
        )

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!"
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            mensagem: "Erro interno"
        })
    }
})

app.post("/login", async (req, res)=>{
    const {email,senha} = req.body

    try {
        const[usuarios] = await db.query(
        "SELECT * FROM usuario WHERE email = ?",
        [email]
    )

    if(usuarios.length == 0){
        return res.status(401).json({
            mensagem:"Emal ou senha inválidos"
        })
    }

    const usuario = usuarios[0]

    const senhaValida = await bcrypt.compare(
        senha,
        usuario.senha
    )

    if(!senhaValida){
        return res.status(401).json({
            mensagem: "Senha inválida"
        })
    }

    const token = jwt.sign({
        id: usuario.id,
        email: usuario.email
    },
        process.env.JWT_SECRET,{
            expiresIn: '1h'
        }
    )

    res.json({
        mensagem: "Login realizado",
        token
    })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            mensagem:"Erro no login"
        })
    }
})

app.get("/produtos", auth, async (req, res)=>{
    try {
        const [produtos] = await db.query("SELECT * FROM produto")

        res.json(produtos)
    } catch (error) {
        console.log(error)
    }
})

app.post("/produtos", async (req,res)=>{
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

app.delete("/produtos/:id", async(req,res) => {
    try {
        const {id} = req.params
        await db.query ("DELETE FROM produto WHERE id = ?", [id])

        res.json({mensagem:"Produto deletado com sucesso."})

    } catch (error) {
        console.log(error)
        res.json({
            erro: "Erro ao deletar produto"
        })
    }
})

app.listen(PORT, ()=> {
    console.log("Servidor rodando na porta 3001.")
})

