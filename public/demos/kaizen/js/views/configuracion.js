registerView('configuracion', async (container) => {
  let tab = 'categorias'

  async function render() {
    const [categorias, metodos] = await Promise.all([
      window.api.categorias.listar(),
      window.api.metodosPago.listar(),
    ])

    const items = tab === 'categorias' ? categorias : metodos

    container.innerHTML = `
      <h1 class="view-title">Configuración</h1>

      <div style="display:flex; gap:8px; margin-bottom:20px">
        <button class="btn ${tab === 'categorias' ? 'btn-primary' : 'btn-ghost'}" id="tab-cat">Categorías</button>
        <button class="btn ${tab === 'metodos' ? 'btn-primary' : 'btn-ghost'}" id="tab-met">Métodos de pago</button>
      </div>

      <div class="card" style="max-width:520px">
        <table>
          <thead><tr><th>Nombre</th><th style="width:140px"></th></tr></thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="font-weight:500">${item.nombre}</td>
                <td>
                  <div style="display:flex; gap:6px; justify-content:flex-end">
                    <button class="btn btn-ghost" style="padding:3px 10px; font-size:12px" data-edit="${item.id}" data-nombre="${item.nombre}">Editar</button>
                    <button class="btn btn-danger" style="padding:3px 10px; font-size:12px" data-del="${item.id}" data-nombre="${item.nombre}">Eliminar</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display:flex; gap:8px; margin-top:16px; padding-top:16px; border-top:1px solid var(--border)">
          <input id="input-nuevo" placeholder="Nuevo nombre..." style="flex:1" />
          <button class="btn btn-primary" id="btn-agregar">Agregar</button>
        </div>
      </div>
    `

    document.getElementById('tab-cat').addEventListener('click', () => { tab = 'categorias'; render() })
    document.getElementById('tab-met').addEventListener('click', () => { tab = 'metodos'; render() })

    document.getElementById('btn-agregar').addEventListener('click', async () => {
      const nombre = document.getElementById('input-nuevo').value.trim()
      if (!nombre) return
      const res = tab === 'categorias'
        ? await window.api.categorias.crear(nombre)
        : await window.api.metodosPago.crear(nombre)
      if (res.error) return alert(res.error)
      render()
    })

    container.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const nuevo = prompt('Nuevo nombre:', btn.dataset.nombre)
        if (!nuevo || nuevo.trim() === btn.dataset.nombre) return
        const res = tab === 'categorias'
          ? await window.api.categorias.actualizar(+btn.dataset.edit, nuevo.trim())
          : await window.api.metodosPago.actualizar(+btn.dataset.edit, nuevo.trim())
        if (res.error) alert(res.error); else render()
      })
    })

    container.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`¿Eliminar "${btn.dataset.nombre}"?`)) return
        const res = tab === 'categorias'
          ? await window.api.categorias.eliminar(+btn.dataset.del)
          : await window.api.metodosPago.eliminar(+btn.dataset.del)
        if (res.error) alert(res.error); else render()
      })
    })
  }

  render()
})
