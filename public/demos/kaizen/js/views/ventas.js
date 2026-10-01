const _venta = {
  carrito: [],
  promoActiva: null,
  pagos: null,
  _sessionId: null,
}

registerView('ventas', async (container) => {
  // Si cambió la sesión de caja, resetear el carrito del turno anterior
  const sessionId = window._session?.id ?? null
  if (_venta._sessionId !== sessionId) {
    _venta.carrito = []
    _venta.promoActiva = null
    _venta.pagos = null
    _venta._sessionId = sessionId
  }

  const [productos, metodosPago] = await Promise.all([
    window.api.productos.listar(),
    window.api.metodosPago.listar(),
  ])

  // Restaurar o inicializar pagos
  if (!_venta.pagos) {
    _venta.pagos = [{ metodo_pago_id: metodosPago[0]?.id ?? null, monto: 0 }]
  }
  // Validar que los métodos de pago del estado guardado existan
  const metodosIds = new Set(metodosPago.map(m => m.id))
  for (const p of _venta.pagos) {
    if (!metodosIds.has(p.metodo_pago_id)) p.metodo_pago_id = metodosPago[0]?.id ?? null
  }

  container.innerHTML = `
    <h1 class="view-title">Nueva Venta</h1>
    <div style="display:grid; grid-template-columns:1fr 370px; gap:20px; height:calc(100vh - 120px)">

      <!-- Grid de productos -->
      <div class="card" style="display:flex; flex-direction:column; overflow:hidden; padding:16px">
        <input id="buscar-producto" placeholder="Buscar producto..." style="margin-bottom:14px" />
        <div id="lista-productos" style="flex:1; overflow-y:auto; display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:10px; align-content:start"></div>
      </div>

      <!-- Panel derecho -->
      <div style="display:flex; flex-direction:column; gap:12px">

        <!-- Carrito -->
        <div class="card" style="flex:1; overflow-y:auto">
          <div style="font-size:11px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:12px">Carrito</div>
          <div id="carrito-items"></div>
        </div>

        <!-- Checkout -->
        <div class="card" style="padding:16px">

          <!-- Código promo -->
          <div class="form-group">
            <label>Código promocional</label>
            <div style="display:flex; gap:6px">
              <input id="input-promo" placeholder="PROMO..." style="flex:1" value="${_venta.promoActiva?.codigo || ''}" />
              <button class="btn btn-ghost" id="btn-promo" style="padding:8px 12px">Aplicar</button>
            </div>
            <div id="promo-status" style="font-size:11px; margin-top:4px; min-height:16px"></div>
          </div>

          <!-- Pago -->
          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
              <label style="margin:0">Método de pago</label>
              <button class="btn btn-ghost" id="btn-dividir" style="padding:2px 8px; font-size:11px">+ Dividir</button>
            </div>
            <div id="pagos-container"></div>
            <div id="pagos-error" style="font-size:11px; color:var(--red); margin-top:3px; display:none">Los montos no suman el total</div>
          </div>

          <!-- Totales -->
          <div style="border-top:1px solid var(--border); padding-top:12px; margin-bottom:14px">
            <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--muted); margin-bottom:5px">
              <span>Subtotal</span><span id="val-subtotal">$0</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--muted); margin-bottom:8px">
              <span>Descuento</span><span id="val-descuento" style="color:var(--gold)">—</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:20px; font-weight:700">
              <span>Total</span><span id="val-total" style="color:var(--gold)">$0</span>
            </div>
          </div>

          <button class="btn btn-gold" id="btn-cobrar" style="width:100%; font-size:15px; padding:13px">
            Cobrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal factura -->
    <div id="modal-factura" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:200; align-items:center; justify-content:center">
      <div class="card" style="width:360px; text-align:center; padding:28px">
        <div style="font-size:15px; font-weight:700; color:var(--gold); margin-bottom:6px">Venta registrada</div>
        <div id="factura-status" style="font-size:12px; color:var(--muted); margin-bottom:20px">Generando factura...</div>
        <div style="display:flex; flex-direction:column; gap:8px">
          <button class="btn btn-primary" id="btn-abrir-factura" style="width:100%" disabled>Abrir factura PDF</button>
          <button class="btn btn-ghost" id="btn-cerrar-factura" style="width:100%">Nueva venta</button>
        </div>
      </div>
    </div>
  `

  function fmt(v) { return '$' + Math.round(v).toLocaleString('es-CO') }

  function getTotal() {
    const sub = _venta.carrito.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0)
    let desc = 0
    if (_venta.promoActiva) {
      desc = _venta.promoActiva.tipo === 'porcentaje'
        ? sub * (_venta.promoActiva.valor / 100)
        : _venta.promoActiva.valor
    }
    return { subtotal: sub, descuento: desc, total: Math.max(0, sub - desc) }
  }

  function renderPagos() {
    const cont = document.getElementById('pagos-container')
    cont.innerHTML = _venta.pagos.map((p, i) => `
      <div style="display:flex; gap:6px; align-items:center; margin-bottom:6px">
        <select data-ps="${i}" style="flex:1; font-size:12px; padding:6px 8px">
          ${metodosPago.map(m => `<option value="${m.id}" ${m.id == p.metodo_pago_id ? 'selected' : ''}>${m.nombre}</option>`).join('')}
        </select>
        <input type="number" data-pm="${i}" value="${Math.round(p.monto)}" min="0" style="width:90px; font-size:12px; padding:6px 8px" />
        ${_venta.pagos.length > 1 ? `<button class="btn btn-danger" style="padding:4px 7px; font-size:12px; border-radius:4px" data-pd="${i}">✕</button>` : ''}
      </div>
    `).join('')

    cont.querySelectorAll('[data-ps]').forEach(el =>
      el.addEventListener('change', () => { _venta.pagos[+el.dataset.ps].metodo_pago_id = +el.value; validarPagos() })
    )
    cont.querySelectorAll('[data-pm]').forEach(el =>
      el.addEventListener('input', () => { _venta.pagos[+el.dataset.pm].monto = +el.value; validarPagos() })
    )
    cont.querySelectorAll('[data-pd]').forEach(el =>
      el.addEventListener('click', () => { _venta.pagos.splice(+el.dataset.pd, 1); renderPagos(); validarPagos() })
    )
  }

  function validarPagos() {
    const { total } = getTotal()
    const suma = _venta.pagos.reduce((s, p) => s + (+p.monto || 0), 0)
    const ok = total === 0 || Math.abs(suma - total) < 1
    document.getElementById('pagos-error').style.display = ok ? 'none' : 'block'
    return ok
  }

  function calcularTotales() {
    const { subtotal, descuento, total } = getTotal()
    document.getElementById('val-subtotal').textContent = fmt(subtotal)
    document.getElementById('val-descuento').textContent = descuento > 0 ? '-' + fmt(descuento) : '—'
    document.getElementById('val-total').textContent = fmt(total)

    if (_venta.pagos.length === 1) {
      _venta.pagos[0].monto = total
      renderPagos()
    }
    validarPagos()
  }

  function renderProductos(filtro = '') {
    const lista = document.getElementById('lista-productos')
    const vis = productos.filter(p =>
      p.activo && (p.tipo === 'plan' || p.stock > 0) &&
      p.nombre.toLowerCase().includes(filtro.toLowerCase())
    )

    lista.innerHTML = vis.map(p => `
      <div class="card" data-pid="${p.id}" style="cursor:pointer; text-align:center; padding:12px; border-color:transparent; transition:border-color .15s">
        ${p.tipo === 'plan' ? '<div style="font-size:9px; font-weight:700; color:var(--gold); letter-spacing:1px; margin-bottom:3px">PLAN</div>' : ''}
        <div style="font-weight:600; font-size:12px; margin-bottom:4px; line-height:1.3">${p.nombre}</div>
        <div style="font-size:15px; font-weight:700; color:var(--gold)">${fmt(p.precio_venta)}</div>
        ${p.tipo !== 'plan' ? `<div style="font-size:10px; color:var(--muted); margin-top:2px">Stock: ${p.stock}</div>` : ''}
      </div>
    `).join('') || '<p class="text-muted" style="font-size:12px">Sin productos disponibles</p>'

    lista.querySelectorAll('[data-pid]').forEach(el => {
      el.addEventListener('mouseenter', () => el.style.borderColor = 'var(--gold)')
      el.addEventListener('mouseleave', () => el.style.borderColor = 'transparent')
      el.addEventListener('click', () => agregarAlCarrito(+el.dataset.pid))
    })
  }

  function agregarAlCarrito(id) {
    const p = productos.find(x => x.id === id)
    const ex = _venta.carrito.find(i => i.producto_id === id)
    if (ex) {
      if (p.tipo === 'plan' || ex.cantidad < p.stock) ex.cantidad++
    } else {
      _venta.carrito.push({ producto_id: id, nombre: p.nombre, precio_unitario: p.precio_venta, cantidad: 1, tipo: p.tipo })
    }
    renderCarrito()
  }

  function renderCarrito() {
    const el = document.getElementById('carrito-items')
    if (!_venta.carrito.length) {
      el.innerHTML = '<p class="text-muted" style="font-size:12px; text-align:center; padding:20px 0">Carrito vacío</p>'
      calcularTotales()
      return
    }

    el.innerHTML = _venta.carrito.map((item, i) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid var(--border)">
        <div>
          <div style="font-size:12px; font-weight:500">${item.nombre}</div>
          <div style="font-size:11px; color:var(--muted)">${fmt(item.precio_unitario)} c/u</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px">
          <button class="btn btn-ghost" style="padding:1px 8px; font-size:14px; line-height:1" data-a="dec" data-i="${i}">−</button>
          <span style="min-width:22px; text-align:center; font-size:13px; font-weight:600">${item.cantidad}</span>
          <button class="btn btn-ghost" style="padding:1px 8px; font-size:14px; line-height:1" data-a="inc" data-i="${i}">+</button>
          <button class="btn btn-danger" style="padding:1px 7px; font-size:12px" data-a="del" data-i="${i}">✕</button>
        </div>
      </div>
    `).join('')

    el.querySelectorAll('[data-a]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.i
        const item = _venta.carrito[i]
        if (!item) return
        const p = productos.find(x => x.id === item.producto_id)
        // Si el producto fue desactivado mientras estaba en el carrito, solo permitir eliminar
        if (!p) { _venta.carrito.splice(i, 1); renderCarrito(); return }
        if (btn.dataset.a === 'inc' && (p.tipo === 'plan' || item.cantidad < p.stock)) item.cantidad++
        if (btn.dataset.a === 'dec') { item.cantidad--; if (item.cantidad <= 0) _venta.carrito.splice(i, 1) }
        if (btn.dataset.a === 'del') _venta.carrito.splice(i, 1)
        renderCarrito()
      })
    })

    calcularTotales()
  }

  // Mostrar promo activa si había una guardada
  if (_venta.promoActiva) {
    const el = document.getElementById('promo-status')
    el.style.color = 'var(--gold)'
    el.textContent = `✓ Promo activa: ${_venta.promoActiva.tipo === 'porcentaje' ? _venta.promoActiva.valor + '%' : fmt(_venta.promoActiva.valor)} de descuento`
  }

  document.getElementById('buscar-producto').addEventListener('input', e => renderProductos(e.target.value))

  document.getElementById('btn-dividir').addEventListener('click', () => {
    const { total } = getTotal()
    const usado = _venta.pagos.reduce((s, p) => s + (+p.monto || 0), 0)
    _venta.pagos.push({ metodo_pago_id: metodosPago[0]?.id ?? null, monto: Math.max(0, total - usado) })
    renderPagos(); validarPagos()
  })

  document.getElementById('btn-promo').addEventListener('click', async () => {
    const codigo = document.getElementById('input-promo').value.trim()
    const el = document.getElementById('promo-status')
    if (!codigo) return
    const promo = await window.api.codigos.validar(codigo)
    if (promo) {
      _venta.promoActiva = promo
      el.style.color = 'var(--gold)'
      el.textContent = `✓ ${promo.tipo === 'porcentaje' ? promo.valor + '%' : fmt(promo.valor)} de descuento`
    } else {
      _venta.promoActiva = null
      el.style.color = 'var(--red)'
      el.textContent = 'Código inválido o expirado'
    }
    calcularTotales()
  })

  let facturaPath = null

  async function generarFactura(ventaId) {
    facturaPath = null
    document.getElementById('btn-abrir-factura').disabled = true
    document.getElementById('factura-status').textContent = 'Generando factura...'
    document.getElementById('modal-factura').style.display = 'flex'

    const res = await window.api.facturas.generar(ventaId)
    if (res?.error) {
      document.getElementById('factura-status').textContent = 'No se pudo generar la factura: ' + res.error
      return
    }

    facturaPath = res.path
    document.getElementById('factura-status').textContent = 'Factura PDF generada correctamente.'
    document.getElementById('btn-abrir-factura').disabled = false
  }

  document.getElementById('btn-abrir-factura').addEventListener('click', () => {
    if (facturaPath) window.api.facturas.abrir(facturaPath)
  })

  document.getElementById('btn-cerrar-factura').addEventListener('click', () => {
    document.getElementById('modal-factura').style.display = 'none'
  })

  document.getElementById('btn-cobrar').addEventListener('click', async () => {
    if (!_venta.carrito.length) return alert('El carrito está vacío')
    if (!validarPagos()) return alert('Los montos de pago no suman el total')

    const btn = document.getElementById('btn-cobrar')
    btn.disabled = true
    btn.textContent = 'Procesando...'

    const { total } = getTotal()
    try {
      const res = await window.api.ventas.registrar({
        items:          _venta.carrito.map(i => ({ ...i, subtotal: i.precio_unitario * i.cantidad })),
        pagos:          _venta.pagos.map(p => ({ metodo_pago_id: +p.metodo_pago_id, monto: +p.monto })),
        total,
        usuario_id:     window._session?.usuario_id ?? 1,
        codigo_promo_id: _venta.promoActiva?.id ?? null,
      })

      if (res?.error) {
        alert('Error al registrar venta: ' + res.error)
        btn.disabled = false
        btn.textContent = 'Cobrar'
        return
      }

      // Limpiar estado compartido
      _venta.carrito.length = 0
      _venta.promoActiva = null
      _venta.pagos = [{ metodo_pago_id: metodosPago[0]?.id ?? null, monto: 0 }]

      // Actualizar stock en la lista local
      const frescos = await window.api.productos.listar()
      productos.splice(0, productos.length, ...frescos)

      document.getElementById('input-promo').value = ''
      document.getElementById('promo-status').textContent = ''

      renderCarrito()
      renderProductos()
      renderPagos()

      generarFactura(res.id)
    } catch (e) {
      alert('Error al registrar venta: ' + e.message)
    }

    btn.disabled = false
    btn.textContent = 'Cobrar'
  })

  renderProductos()
  renderPagos()
  renderCarrito()
})
