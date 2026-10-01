registerView('egresos', async (container) => {
  const _d = new Date()
  const hoy = `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`

  const [categoriasProducto, metodosPago, productos] = await Promise.all([
    window.api.categorias.listar(),
    window.api.metodosPago.listar(),
    window.api.productos.listar(),
  ])

  function fmt(v) { return '$' + Math.round(v).toLocaleString('es-CO') }

  const catProductoOpts = `<option value="">Sin categoría</option>` +
    categoriasProducto.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')
  const metodoOpts = `<option value="">—</option>` +
    metodosPago.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('')
  const productoOpts = `<option value="">+ Producto nuevo</option>` +
    productos.filter(p => p.tipo === 'producto').map(p => `<option value="${p.id}">${p.nombre} (stock: ${p.stock})</option>`).join('')

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
      <h1 class="view-title" style="margin:0">Egresos</h1>
      <div style="display:flex; gap:10px; align-items:center">
        <input type="date" id="filtro-fecha" value="${hoy}" style="width:160px" />
        <button class="btn btn-primary" id="btn-nuevo">+ Nuevo egreso</button>
      </div>
    </div>

    <div id="resumen" style="display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-bottom:20px"></div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Hora</th>
            <th>Concepto</th>
            <th>Total</th>
            <th>Método de pago</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>

    <!-- Modal nuevo egreso -->
    <div id="modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:200; align-items:center; justify-content:center">
      <div class="card" style="width:640px; max-height:90vh; overflow-y:auto">
        <h2 style="font-size:16px; margin-bottom:20px; color:var(--gold)">Nuevo Egreso</h2>

        <div class="form-group">
          <label>Concepto</label>
          <input id="f-concepto" placeholder="Compra de proteínas, pago de arriendo..." />
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label>Método de pago</label>
            <select id="f-metodo">${metodoOpts}</select>
          </div>
          <div class="form-group">
            <label>Notas (opcional)</label>
            <input id="f-notas" />
          </div>
        </div>

        <div class="form-group" style="display:flex; align-items:center; gap:8px">
          <input type="checkbox" id="f-con-items" style="width:auto" />
          <label style="margin:0">Este egreso incluye compra de productos (mercancía)</label>
        </div>

        <!-- Monto manual (sin items) -->
        <div class="form-group" id="grupo-monto">
          <label>Monto total</label>
          <input id="f-monto" type="number" min="0" />
        </div>

        <!-- Items de mercancía -->
        <div id="grupo-items" style="display:none">
          <div style="display:grid; grid-template-columns:1fr 90px 130px auto; gap:6px; margin-bottom:6px; font-size:12px; color:var(--muted)">
            <span>Producto</span>
            <span>Cantidad</span>
            <span>Valor total de la compra</span>
            <span></span>
          </div>
          <div id="items-lista"></div>
          <button class="btn btn-ghost" id="btn-add-item" style="margin-top:6px; font-size:12px">+ Agregar producto</button>
          <div style="display:flex; justify-content:space-between; margin-top:14px; padding-top:10px; border-top:1px solid var(--border); font-size:15px; font-weight:700">
            <span>Total</span><span id="items-total" style="color:var(--gold)">$0</span>
          </div>
        </div>

        <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:16px">
          <button class="btn btn-ghost" id="btn-cancelar">Cancelar</button>
          <button class="btn btn-primary" id="btn-guardar">Guardar egreso</button>
        </div>
      </div>
    </div>

    <!-- Detalle modal -->
    <div id="modal-detalle" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:200; align-items:center; justify-content:center">
      <div class="card" style="width:500px; max-height:80vh; overflow-y:auto">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
          <h2 style="font-size:16px; color:var(--gold)">Detalle de egreso</h2>
          <button class="btn btn-ghost" id="btn-cerrar-detalle" style="padding:4px 10px">✕</button>
        </div>
        <div id="detalle-content"></div>
      </div>
    </div>
  `

  let items = []

  function itemRowHtml(item, i) {
    return `
      <div data-row="${i}" style="display:grid; grid-template-columns:1fr 90px 130px auto; gap:6px; align-items:start; margin-bottom:4px">
        <select data-if="producto" style="font-size:12px; padding:6px 8px">${productoOpts}</select>
        <input data-if="cantidad" type="number" min="1" value="${item.cantidad}" placeholder="Cant." style="font-size:12px; padding:6px 8px" />
        <input data-if="total" type="number" min="0" value="${item.total_compra || ''}" placeholder="$0" style="font-size:12px; padding:6px 8px" />
        <button class="btn btn-danger" data-ir="${i}" style="padding:4px 8px; font-size:12px">✕</button>
      </div>
      <div class="form-group" style="margin:0 0 10px 0">
        <label>Valor unitario (opcional — se calcula automáticamente si se deja vacío)</label>
        <input data-if="unitario" type="number" min="0" value="${item.costo_unitario || ''}" placeholder="Se calcula automáticamente" style="font-size:12px; padding:6px 8px" />
      </div>
      <div data-if="nuevo-fields" style="display:none; grid-template-columns:1fr 1fr; gap:6px; margin:-2px 0 10px 0">
        <div class="form-group" style="margin-bottom:10px">
          <label>Nombre del producto nuevo</label>
          <input data-if="nombre" placeholder="Ej: Proteína whey 1kg" style="font-size:12px; padding:6px 8px" />
        </div>
        <div class="form-group" style="margin-bottom:10px">
          <label>Categoría del producto</label>
          <select data-if="cat-producto" style="font-size:12px; padding:6px 8px">${catProductoOpts}</select>
        </div>
        <div class="form-group" style="grid-column:1/3; margin-bottom:10px">
          <label>Precio de venta</label>
          <input data-if="precio-venta" type="number" min="0" placeholder="0" style="font-size:12px; padding:6px 8px; width:100%" />
        </div>
      </div>
    `
  }

  function renderItems() {
    const cont = document.getElementById('items-lista')
    cont.innerHTML = items.map((it, i) => itemRowHtml(it, i)).join('')

    cont.querySelectorAll('[data-row]').forEach(row => {
      const i = +row.dataset.row
      const selProd = row.querySelector('[data-if="producto"]')
      selProd.value = items[i].producto_id || ''
      const grupoUnitario = row.nextElementSibling
      const nuevoFields = grupoUnitario.nextElementSibling

      function sincNuevo() {
        const esNuevo = !selProd.value
        nuevoFields.style.display = esNuevo ? 'grid' : 'none'
      }
      sincNuevo()

      selProd.addEventListener('change', () => {
        items[i].producto_id = selProd.value ? +selProd.value : null
        sincNuevo()
      })
      row.querySelector('[data-if="cantidad"]').addEventListener('input', e => {
        items[i].cantidad = +e.target.value
        actualizarTotal()
      })
      row.querySelector('[data-if="total"]').addEventListener('input', e => {
        items[i].total_compra = +e.target.value
        actualizarTotal()
      })
      grupoUnitario.querySelector('[data-if="unitario"]').addEventListener('input', e => {
        items[i].costo_unitario = +e.target.value
      })
      nuevoFields.querySelector('[data-if="nombre"]').addEventListener('input', e => items[i].nombre = e.target.value)
      nuevoFields.querySelector('[data-if="cat-producto"]').addEventListener('change', e => items[i].categoria_id = e.target.value || null)
      nuevoFields.querySelector('[data-if="precio-venta"]').addEventListener('input', e => items[i].precio_venta = +e.target.value)

      row.querySelector('[data-ir]').addEventListener('click', () => {
        items.splice(i, 1)
        renderItems()
        actualizarTotal()
      })
    })
  }

  function actualizarTotal() {
    const total = items.reduce((s, i) => s + (i.total_compra || 0), 0)
    document.getElementById('items-total').textContent = fmt(total)
  }

  function agregarItem() {
    items.push({ producto_id: null, cantidad: 1, total_compra: 0, costo_unitario: 0, nombre: '', categoria_id: null, precio_venta: 0 })
    renderItems()
    actualizarTotal()
  }

  function sincConItems() {
    const conItems = document.getElementById('f-con-items').checked
    document.getElementById('grupo-monto').style.display = conItems ? 'none' : 'block'
    document.getElementById('grupo-items').style.display = conItems ? 'block' : 'none'
    if (conItems && !items.length) agregarItem()
  }

  document.getElementById('f-con-items').addEventListener('change', sincConItems)
  document.getElementById('btn-add-item').addEventListener('click', agregarItem)

  function abrirModal() {
    document.getElementById('modal').style.display = 'flex'
  }

  function cerrarModal() {
    document.getElementById('modal').style.display = 'none'
    document.getElementById('f-concepto').value = ''
    document.getElementById('f-metodo').value = ''
    document.getElementById('f-notas').value = ''
    document.getElementById('f-monto').value = ''
    document.getElementById('f-con-items').checked = false
    items = []
    renderItems()
    sincConItems()
  }

  document.getElementById('btn-nuevo').addEventListener('click', abrirModal)
  document.getElementById('btn-cancelar').addEventListener('click', cerrarModal)

  document.getElementById('btn-guardar').addEventListener('click', async () => {
    const concepto = document.getElementById('f-concepto').value.trim()
    if (!concepto) return alert('El concepto es requerido')

    const conItems = document.getElementById('f-con-items').checked

    let payloadItems = []
    if (conItems) {
      if (!items.length) return alert('Agrega al menos un producto')
      for (const it of items) {
        if (!it.cantidad || it.cantidad <= 0) return alert('Cada producto necesita una cantidad válida')
        if (!it.total_compra || it.total_compra <= 0) return alert('Indica cuánto valió la compra de cada producto')
        if (!it.producto_id && !it.nombre?.trim()) return alert('Indica el nombre del producto nuevo')
      }
      payloadItems = items.map(it => it.producto_id
        ? { producto_id: it.producto_id, cantidad: it.cantidad, total_compra: it.total_compra, costo_unitario: it.costo_unitario || null }
        : {
            producto_nuevo: {
              nombre: it.nombre.trim(),
              precio_venta: it.precio_venta || 0,
              categoria_id: it.categoria_id || null,
            },
            cantidad: it.cantidad,
            total_compra: it.total_compra,
            costo_unitario: it.costo_unitario || null,
          }
      )
    }

    const totalManual = +document.getElementById('f-monto').value
    if (!conItems && (!totalManual || totalManual <= 0)) return alert('Indica el monto del egreso')

    const btn = document.getElementById('btn-guardar')
    btn.disabled = true
    btn.textContent = 'Guardando...'

    const res = await window.api.egresos.crear({
      concepto,
      metodo_pago_id: document.getElementById('f-metodo').value || null,
      notas: document.getElementById('f-notas').value.trim() || null,
      usuario_id: window._session?.usuario_id ?? 1,
      items: payloadItems,
      total_manual: totalManual,
    })

    btn.disabled = false
    btn.textContent = 'Guardar egreso'

    if (res?.error) return alert(res.error)

    cerrarModal()
    navigateTo('egresos')
  })

  async function verDetalle(id) {
    const d = await window.api.egresos.detalle(id)
    document.getElementById('detalle-content').innerHTML = `
      <div style="font-size:12px; color:var(--muted); margin-bottom:14px">${d.fecha} — ${d.usuario}</div>
      <div style="margin-bottom:10px"><strong>${d.concepto}</strong></div>
      <div style="font-size:12px; color:var(--muted); margin-bottom:14px">
        ${d.metodo_pago || 'Sin método'}
        ${d.notas ? `<br>${d.notas}` : ''}
      </div>
      ${d.items.length ? `
        <table style="margin-bottom:14px">
          <thead><tr><th>Producto</th><th>Cant.</th><th>Costo</th><th>Subtotal</th></tr></thead>
          <tbody>
            ${d.items.map(i => `
              <tr>
                <td>${i.producto}</td>
                <td class="text-muted">${i.cantidad}</td>
                <td class="text-muted">${fmt(i.costo_unitario)}</td>
                <td style="color:var(--red)">${fmt(i.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
      <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:700; border-top:1px solid var(--border); padding-top:10px">
        <span>Total</span><span style="color:var(--red)">${fmt(d.total)}</span>
      </div>
    `
    document.getElementById('modal-detalle').style.display = 'flex'
  }

  document.getElementById('btn-cerrar-detalle').addEventListener('click', () => {
    document.getElementById('modal-detalle').style.display = 'none'
  })

  async function cargar(fecha) {
    const egresos = await window.api.egresos.listar({ fecha })
    const total = egresos.reduce((s, e) => s + e.total, 0)

    document.getElementById('resumen').innerHTML = [
      { label: 'Egresos', val: egresos.length },
      { label: 'Total del día', val: fmt(total), color: 'var(--red)' },
    ].map(c => `
      <div class="card">
        <div style="font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px">${c.label}</div>
        <div style="font-size:22px; font-weight:700; color:${c.color || 'var(--text)'}">${c.val}</div>
      </div>
    `).join('')

    const tbody = document.getElementById('tbody')
    tbody.innerHTML = egresos.map(e => `
      <tr>
        <td class="text-muted">${e.fecha.split(' ')[1]?.slice(0,5) || '—'}</td>
        <td style="font-weight:500">${e.concepto}</td>
        <td style="color:var(--red); font-weight:600">${fmt(e.total)}</td>
        <td class="text-muted">${e.metodo_pago || '—'}</td>
        <td><button class="btn btn-ghost" style="padding:3px 10px; font-size:12px" data-id="${e.id}">Ver</button></td>
      </tr>
    `).join('') || `<tr><td colspan="5" class="text-muted" style="text-align:center; padding:30px">Sin egresos para esta fecha</td></tr>`

    tbody.querySelectorAll('[data-id]').forEach(btn =>
      btn.addEventListener('click', () => verDetalle(+btn.dataset.id))
    )
  }

  document.getElementById('filtro-fecha').addEventListener('change', e => cargar(e.target.value))

  sincConItems()
  cargar(hoy)
})
