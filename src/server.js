import express from 'express'
import { readEmprestimos, writeEmprestimos } from './db.js'

const app = express()
const PORT = 3000


app.use(express.json())


app.use((req, res, next) => {
  const inicio = Date.now()

  
  res.on('finish', () => {
    const ms = Date.now() - inicio
    console.log(`${req.method} ${req.url} — ${ms}ms`)
  })

  next() 
})

app.get('/emprestimos', async (req, res, next) => {
  try {
    const emprestimos = await readEmprestimos()
    
    
    const ativos = emprestimos.filter(emp => emp.devolvidoEm === null)
    
    res.json(ativos)
  } catch (err) {
    next(err) 
  }
})


app.get('/emprestimos/:id', async (req, res, next) => {
  try {
    const emprestimos = await readEmprestimos()
    
    
    const id = Number(req.params.id)
    const emprestimo = emprestimos.find(emp => emp.id === id)
    
    if (!emprestimo) {
      const erro = new Error('Empréstimo não encontrado')
      erro.status = 404
      return next(erro)
    }
    
    res.json(emprestimo)
  } catch (err) {
    next(err)
  }
})


app.post('/emprestimos', async (req, res, next) => {
  try {
    const { nomeAluno, livro } = req.body || {}

   
    if (!nomeAluno || typeof nomeAluno !== 'string') {
      const erro = new Error('nomeAluno é obrigatório')
      erro.status = 400
      return next(erro)
    }
    if (!livro || typeof livro !== 'string') {
      const erro = new Error('livro é obrigatório')
      erro.status = 400
      return next(erro)
    }

    const emprestimos = await readEmprestimos()

    
    const livroJaEmprestado = emprestimos
      .filter(emp => emp.devolvidoEm === null)
      .some(emp => emp.livro.toLowerCase() === livro.toLowerCase())

    if (livroJaEmprestado) {
      const erro = new Error('Este livro já possui um empréstimo ativo no momento')
      erro.status = 409 
      return next(erro)
    }
    
    
   
    const novoId = emprestimos.length ? Math.max(...emprestimos.map(e => e.id)) + 1 : 1

    const novo = { 
      id: novoId, 
      nomeAluno, 
      livro, 
      devolvidoEm: null 
    }
    
    emprestimos.push(novo)
    await writeEmprestimos(emprestimos)

    
    res.status(201).json(novo)
  } catch (err) {
    next(err)
  }
})


app.put('/emprestimos/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { nomeAluno, livro } = req.body || {}

    
    if (!nomeAluno || !livro) {
      const erro = new Error('nomeAluno e livro são obrigatórios para PUT (substituição completa)')
      erro.status = 400
      return next(erro)
    }

    const emprestimos = await readEmprestimos()
    
   
    const idx = emprestimos.findIndex(e => e.id === id)
    if (idx === -1) {
      const erro = new Error('Empréstimo não encontrado')
      erro.status = 404
      return next(erro)
    }

    
    emprestimos[idx] = { id, nomeAluno, livro, devolvidoEm: null }
    
    await writeEmprestimos(emprestimos)
    res.json(emprestimos[idx]) 
  } catch (err) {
    next(err)
  }
})


app.patch('/emprestimos/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const emprestimos = await readEmprestimos()
    
    const emprestimo = emprestimos.find(e => e.id === id)
    if (!emprestimo) {
      const erro = new Error('Empréstimo não encontrado')
      erro.status = 404
      return next(erro)
    }

    
    const { id: _, devolvidoEm: __, ...dadosPermitidos } = req.body || {}
    
    
    Object.assign(emprestimo, dadosPermitidos)
    
    await writeEmprestimos(emprestimos)
    res.json(emprestimo) 
  } catch (err) {
    next(err)
  }
})


app.delete('/emprestimos/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const emprestimos = await readEmprestimos()
    
    const emprestimo = emprestimos.find(e => e.id === id)
    if (!emprestimo) {
      const erro = new Error('Empréstimo não encontrado')
      erro.status = 404
      return next(erro)
    }

   
    if (emprestimo.devolvidoEm !== null) {
      const erro = new Error('Empréstimo já devolvido')
      erro.status = 409
      return next(erro)
    }

    
    emprestimo.devolvidoEm = new Date().toISOString()
    
    await writeEmprestimos(emprestimos)
    
    
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})




app.use((req, res) => {
  res.status(404).json({ erro: `rota ${req.method} ${req.url} não existe` })
})

app.use((err, req, res, next) => {
  console.error(err.stack) 

  const status = err.status || 500
  res.status(status).json({ erro: err.message || 'Erro interno' })
})

app.listen(PORT, () => console.log(`API da biblioteca rodando em http://localhost:${PORT}`))