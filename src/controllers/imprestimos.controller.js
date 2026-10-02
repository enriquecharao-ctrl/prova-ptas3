import { emprestimosService } from '../services/emprestimos.service.js'
import { emprestimosModel } from '../models/emprestimos.model.js'

export async function listEmprestimosAtivos(req, res, next) {
  try {
    const ativos = await emprestimosService.listAtivos()
    res.json(ativos)
  } catch (err) {
    next(err)
  }
}

export async function getEmprestimoById(req, res, next) {
  try {
    
    const id = Number(req.params.id)
    const emprestimo = await emprestimosModel.findById(id)
    
    if (!emprestimo) {
      const erro = new Error('Empréstimo não encontrado')
      erro.status = 404
      throw erro
    }
    res.json(emprestimo)
  } catch (err) {
    next(err)
  }
}

export async function createEmprestimo(req, res, next) {
  try {
    const { nomeAluno, livro } = req.body || {}

   
    if (!nomeAluno) {
      const erro = new Error('nomeAluno é obrigatório')
      erro.status = 400
      throw erro
    }
    if (!livro) {
      const erro = new Error('livro é obrigatório')
      erro.status = 400
      throw erro
    }

    const novo = await emprestimosService.createEmprestimo({ nomeAluno, livro })
    res.status(201).json(novo) 
  } catch (err) {
    next(err)
  }
}

export async function updateFullEmprestimo(req, res, next) {
  try {
    const id = Number(req.params.id)
    const { nomeAluno, livro } = req.body || {}

    if (!nomeAluno || !livro) {
      const erro = new Error('nomeAluno e livro são obrigatórios para PUT (substituição completa)')
      erro.status = 400
      throw erro
    }

    const atualizado = await emprestimosService.replaceEmprestimo(id, { nomeAluno, livro })
    res.json(atualizado)
  } catch (err) {
    next(err)
  }
}

export async function updatePartialEmprestimo(req, res, next) {
  try {
    const id = Number(req.params.id)
    const atualizado = await emprestimosService.updatePartialEmprestimo(id, req.body)
    res.json(atualizado)
  } catch (err) {
    next(err)
  }
}

export async function removeEmprestimoSoft(req, res, next) {
  try {
    const id = Number(req.params.id)
    await emprestimosService.softDeleteEmprestimo(id)
    res.status(204).end() 
  } catch (err) {
    next(err)
  }
}
