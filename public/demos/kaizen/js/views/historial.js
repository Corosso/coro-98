registerView('historial', async (container) => {
  const _d = new Date()
  const hoy = `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
      <h1 class="view-title" style="margin:0">Historial de Ventas</h1>
      <div style="display:flex; gap:8px; align-items:center">
        <label style="color:var(--muted); font-size:12px">Fecha</label>
        <input type="date" id="filtro-fecha" value="${hoy}" style="width:160px" />
      </div>
    </div>

    <div id="resumen" style="display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px"></div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Hora</th>
            <th>Total</th>
            <th>Método de pago</th>
            <th>Cajero</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="tbody-historial"></tbody>
      </table>
    </div>

    <!-- Detalle modal -->
    <div id="modal-detalle" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:200; align-items:center; justify-content:center">
      <div class="card" style="width:500px; max-height:80vh; overflow-y:auto">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
          <h2 style="font-size:16px; color:var(--gold)">Detalle de venta</h2>
          <button class="btn btn-ghost" id="btn-cerrar-detalle" style="padding:4px 10px">✕</button>
        </div>
        <div id="detalle-content"></div>
      </div>
    </div>
  `

  function fmt(v) { return '$' + Math.round(v).toLocaleString('es-CO') }

  async function cargar(fecha) {
    const ventas = await window.api.ventas.listar({ fecha })

    const total = ventas.reduce((s, v) => s + v.total, 0)
    const prom = ventas.length ? total / ventas.length : 0

    document.getElementById('resumen').innerHTML = [
      { label: 'Ventas', val: ventas.length, color: 'var(--gold)' },
      { label: 'Total del día', val: fmt(total), color: 'var(--gold)' },
      { label: 'Ticket promedio', val: fmt(prom), color: 'var(--muted)' },
    ].map(c => `
      <div class="card">
        <div style="font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px">${c.label}</div>
        <div style="font-size:22px; font-weight:700; color:${c.color}">${c.val}</div>
      </div>
    `).join('')

    const tbody = document.getElementById('tbody-historial')
    tbody.innerHTML = ventas.map(v => `
      <tr>
        <td class="text-muted">${v.fecha.split(' ')[1]?.slice(0,5) || '—'}</td>
        <td style="color:var(--gold); font-weight:600">${fmt(v.total)}</td>
        <td class="text-muted">${v.metodo_pago || '—'}</td>
        <td class="text-muted">${v.cajero}</td>
        <td><button class="btn btn-ghost" style="padding:3px 10px; font-size:12px" data-vid="${v.id}">Ver</button></td>
      </tr>
    `).join('') || `<tr><td colspan="5" class="text-muted" style="text-align:center; padding:30px">Sin ventas para esta fecha</td></tr>`

    tbody.querySelectorAll('[data-vid]').forEach(btn => {
      btn.addEventListener('click', () => verDetalle(+btn.dataset.vid))
    })
  }

  async function verDetalle(id) {
    const d = await window.api.ventas.detalle(id)
    const fmt2 = v => '$' + Math.round(v).toLocaleString('es-CO')

    document.getElementById('detalle-content').innerHTML = `
      <div style="font-size:12px; color:var(--muted); margin-bottom:14px">${d.fecha} — ${d.cajero}</div>
      <table style="margin-bottom:14px">
        <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${d.items.map(i => `
            <tr>
              <td>${i.producto}</td>
              <td class="text-muted">${i.cantidad}</td>
              <td class="text-muted">${fmt2(i.precio_unitario)}</td>
              <td style="color:var(--gold)">${fmt2(i.subtotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="border-top:1px solid var(--border); padding-top:10px">
        ${d.pagos.map(p => `
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--muted); margin-bottom:4px">
            <span>${p.metodo_pago}</span><span>${fmt2(p.monto)}</span>
          </div>
        `).join('')}
        <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:700; margin-top:6px">
          <span>Total</span><span style="color:var(--gold)">${fmt2(d.total)}</span>
        </div>
      </div>
    `
    document.getElementById('modal-detalle').style.display = 'flex'
  }

  document.getElementById('btn-cerrar-detalle').addEventListener('click', () => {
    document.getElementById('modal-detalle').style.display = 'none'
  })

  document.getElementById('filtro-fecha').addEventListener('change', e => cargar(e.target.value))

  cargar(hoy)
})
