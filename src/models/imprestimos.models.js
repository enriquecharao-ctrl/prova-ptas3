import { readEmprestimos, writeEmprestimos } from '../db.js'

export const emprestimosModel = {
  
  async findAll() {
    return await readEmprestimos()
  },

  
  async findById(id) {
    const emprestimo = (await readEmprestimos()).find(x => x.id === id)
    return emprestimo || null
  },


  async create(data) {
    const emprestimos = await readEmprestimos()
    const id = emprestimos.length ? Math.max(...emprestimos.map(e => e.id)) + 1 : 1
    
   
    const novo = { id, ...data, devolvidoEm: null }
    emprestimos.push(novo)
    await writeEmprestimos(emprestimos)
    return novo
  },

 
  async update(id, data) {
    const emprestimos = await readEmprestimos()
    const idx = emprestimos.findIndex(e => e.id === id)
    if (idx === -1) return null

    emprestimos[idx] = { id, ...data }
    await writeEmprestimos(emprestimos)
    return emprestimos[idx]
  },

 
  async save(listaAtualizada) {
    await writeEmprestimos(listaAtualizada)
  }
}
