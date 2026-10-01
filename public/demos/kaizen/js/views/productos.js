registerView('productos', async (container) => {
  const [productos, categorias] = await Promise.all([
    window.api.productos.listar(),
    window.api.categorias.listar(),
  ])

  const catOpts = `<option value="">Sin categoría</option>` +
    categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
      <h1 class="view-title" style="margin:0">Productos</h1>
      <button class="btn btn-primary" id="btn-nuevo">+ Nuevo</button>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th>Precio venta</th>
            <th>Precio costo</th>
            <th>Margen</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>

    <!-- Modal -->
    <div id="modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:200; align-items:center; justify-content:center">
      <div class="card" style="width:480px; max-height:90vh; overflow-y:auto">
        <h2 style="font-size:16px; margin-bottom:20px; color:var(--gold)" id="modal-title">Nuevo Producto</h2>

        <div class="grid-2">
          <div class="form-group">
            <label>Nombre</label>
            <input id="f-nombre" />
          </div>
          <div class="form-group">
            <label>Tipo</label>
            <select id="f-tipo">
              <option value="producto">Producto</option>
              <option value="plan">Plan / Servicio</option>
            </select>
          </div>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label>Categoría</label>
            <select id="f-categoria">${catOpts}</select>
          </div>
          <div class="form-group" id="grupo-stock">
            <label>Stock</label>
            <input id="f-stock" type="number" min="0" value="0" />
          </div>
        </div>

        <div class="form-group">
          <label>Descripción (opcional)</label>
          <input id="f-descripcion" />
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label>Precio venta</label>
            <input id="f-precio-venta" type="number" min="0" />
          </div>
          <div class="form-group">
            <label>Precio costo</label>
            <input id="f-precio-costo" type="number" min="0" value="0" />
          </div>
        </div>

        <div style="display:flex; gap:10px; justify-content:space-between; margin-top:8px">
          <button class="btn btn-danger" id="btn-desactivar" style="display:none">Eliminar</button>
          <div style="display:flex; gap:8px; margin-left:auto">
            <button class="btn btn-ghost" id="btn-cancelar">Cancelar</button>
            <button class="btn btn-primary" id="btn-guardar">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  `

  let editandoId = null

  function fmt(v) { return '$' + Math.round(v).toLocaleString('es-CO') }

  function renderTabla(lista) {
    document.getElementById('tbody').innerHTML = lista.map(p => {
      const margen = p.precio_costo > 0
        ? ((p.precio_venta - p.precio_costo) / p.precio_costo * 100).toFixed(1) + '%'
        : '—'
      return `
        <tr>
          <td style="font-weight:500">${p.nombre}</td>
          <td><span class="badge ${p.tipo === 'plan' ? 'badge-gold' : 'badge-gray'}">${p.tipo === 'plan' ? 'Plan' : 'Producto'}</span></td>
          <td class="text-muted">${p.categoria || '—'}</td>
          <td style="color:var(--gold)">${fmt(p.precio_venta)}</td>
          <td class="text-muted">${fmt(p.precio_costo)}</td>
          <td>${margen !== '—' ? `<span class="badge badge-green">${margen}</span>` : '—'}</td>
          <td>${p.tipo === 'plan' ? '<span class="text-muted">—</span>' : p.stock}</td>
          <td><button class="btn btn-ghost" style="padding:4px 10px; font-size:12px" data-id="${p.id}">Editar</button></td>
        </tr>
      `
    }).join('')

    document.getElementById('tbody').querySelectorAll('[data-id]').forEach(btn =>
      btn.addEventListener('click', () => abrirEditar(+btn.dataset.id, lista))
    )
  }

  function sincTipo() {
    const esPlan = document.getElementById('f-tipo').value === 'plan'
    const grupo = document.getElementById('grupo-stock')
    grupo.style.display = esPlan ? 'none' : 'block'
    if (esPlan) document.getElementById('f-stock').value = '0'
  }

  document.getElementById('f-tipo').addEventListener('change', sincTipo)

  function abrirModal(titulo) {
    document.getElementById('modal-title').textContent = titulo
    document.getElementById('modal').style.display = 'flex'
    sincTipo()
  }

  function cerrarModal() {
    document.getElementById('modal').style.display = 'none'
    editandoId = null
    document.getElementById('btn-desactivar').style.display = 'none'
    ;['f-nombre','f-descripcion','f-precio-venta','f-precio-costo'].forEach(id => {
      document.getElementById(id).value = ''
    })
    document.getElementById('f-stock').value = '0'
    document.getElementById('f-tipo').value = 'producto'
    document.getElementById('f-categoria').value = ''
    sincTipo()
  }

  function abrirEditar(id, lista) {
    const p = lista.find(x => x.id === id)
    editandoId = id
    document.getElementById('f-nombre').value        = p.nombre
    document.getElementById('f-descripcion').value   = p.descripcion || ''
    document.getElementById('f-precio-venta').value  = p.precio_venta
    document.getElementById('f-precio-costo').value  = p.precio_costo
    document.getElementById('f-stock').value         = p.stock
    document.getElementById('f-tipo').value          = p.tipo
    document.getElementById('f-categoria').value     = p.categoria_id || ''
    document.getElementById('btn-desactivar').style.display = 'inline-flex'
    abrirModal('Editar Producto')
  }

  document.getElementById('btn-nuevo').addEventListener('click', () => abrirModal('Nuevo Producto'))
  document.getElementById('btn-cancelar').addEventListener('click', cerrarModal)

  document.getElementById('btn-guardar').addEventListener('click', async () => {
    const tipo = document.getElementById('f-tipo').value
    const data = {
      nombre:       document.getElementById('f-nombre').value.trim(),
      descripcion:  document.getElementById('f-descripcion').value.trim(),
      precio_venta: +document.getElementById('f-precio-venta').value,
      precio_costo: +document.getElementById('f-precio-costo').value,
      stock:        tipo === 'plan' ? 0 : +document.getElementById('f-stock').value,
      tipo,
      categoria_id: document.getElementById('f-categoria').value || null,
    }
    if (!data.nombre || !data.precio_venta) return alert('Nombre y precio de venta son requeridos')

    const res = editandoId
      ? await window.api.productos.actualizar(editandoId, data)
      : await window.api.productos.crear(data)
    if (res?.error) return alert(res.error)

    cerrarModal()
    navigateTo('productos')
  })

  document.getElementById('btn-desactivar').addEventListener('click', async () => {
    if (!confirm('¿Eliminar este producto?')) return
    await window.api.productos.desactivar(editandoId)
    cerrarModal()
    navigateTo('productos')
  })

  renderTabla(productos)
})
