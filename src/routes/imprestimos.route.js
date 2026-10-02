import { Router } from 'express'
import * as controller from '../controllers/emprestimos.controller.js'

const router = Router()

router.get('/', controller.listEmprestimosAtivos)
router.get('/:id', controller.getEmprestimoById)
router.post('/', controller.createEmprestimo)
router.put('/:id', controller.updateFullEmprestimo)
router.patch('/:id', controller.updatePartialEmprestimo)
router.delete('/:id', controller.removeEmprestimoSoft)

export default router