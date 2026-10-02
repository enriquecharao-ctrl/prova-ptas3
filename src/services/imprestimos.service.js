import { emprestimosModel } from '../models/emprestimos.model.js'

export const emprestimosService = {
  
  async listAtivos() {
    const emprestimos = await emprestimosModel.findAll()
    return emprestimos.filter(emp => emp.devolvidoEm === null)
  },

  
  async createEmprestimo(data) {
    const ativos = await this.listAtivos()
    const livroJaEmprestado = ativos.some(emp => emp.livro.toLowerCase() === data.livro.toLowerCase())

    if (livroJaEmprestado) {
      const erro = new Error('Este livro já possui um empréstimo ativo no momento')
      erro.status = 409 
      throw erro
    }

    return await emprestimosModel.create(data)
  },

  
  async replaceEmprestimo(id, data) {
    const atualizado = await emprestimosModel.update(id, { ...data, devolvidoEm: null })
    if (!atualizado) {
      const erro = new Error('Empréstimo não encontrado')
      erro.status = 404
      throw erro
    }
    return atualizado
  },

 
  async updatePartialEmprestimo(id, bodyPayload) {
    const emprestimos = await emprestimosModel.findAll()
    const emprestimo = emprestimos.find(e => e.id === id)
    
    if (!emprestimo) {
      const erro = new Error('Empréstimo não encontrado')
      erro.status = 404
      throw erro
    }

    
    const { id: _, devolvidoEm: __, ...dadosPermitidos } = bodyPayload || {}
    Object.assign(emprestimo, dadosPermitidos)
    
    await emprestimosModel.save(emprestimos)
    return emprestimo
  },

  
  async softDeleteEmprestimo(id) {
    const emprestimos = await emprestimosModel.findAll()
    const emprestimo = emprestimos.find(e => e.id === id)

    if (!emprestimo) {
      const erro = new Error('Empréstimo não encontrado')
      erro.status = 404
      throw erro
    }

    if (emprestimo.devolvidoEm !== null) {
      const erro = new Error('Empréstimo já devolvido anteriormente')
      erro.status = 409
      throw erro
    }

    emprestimo.devolvidoEm = new Date().toISOString()
    await emprestimosModel.save(emprestimos)
  }
}
