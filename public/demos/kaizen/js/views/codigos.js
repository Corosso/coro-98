registerView('codigos', async (container) => {
  const codigos = await window.api.codigos.listar()

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
      <h1 class="view-title" style="margin:0">Códigos Promocionales</h1>
      <button class="btn btn-primary" id="btn-nuevo">+ Nuevo</button>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr><th>Código</th><th>Tipo</th><th>Valor</th><th>Expira</th><th>Estado</th></tr>
        </thead>
        <tbody>
          ${codigos.map(c => `
            <tr>
              <td style="font-family:monospace; font-weight:600; color:var(--gold)">${c.codigo}</td>
              <td class="text-muted">${c.tipo === 'porcentaje' ? 'Porcentaje' : 'Monto fijo'}</td>
              <td>${c.tipo === 'porcentaje' ? c.valor + '%' : '$' + c.valor.toLocaleString('es-CO')}</td>
              <td class="text-muted">${c.fecha_expiracion || '—'}</td>
              <td><span class="badge ${c.activo ? 'badge-green' : 'badge-gray'}">${c.activo ? 'Activo' : 'Inactivo'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div id="modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:200; align-items:center; justify-content:center">
      <div class="card" style="width:380px">
        <h2 style="font-size:16px; margin-bottom:20px; color:var(--gold)">Nuevo Código</h2>
        <div class="form-group"><label>Código</label><input id="f-codigo" placeholder="PROMO20" /></div>
        <div class="form-group">
          <label>Tipo de descuento</label>
          <select id="f-tipo">
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="monto_fijo">Monto fijo ($)</option>
          </select>
        </div>
        <div class="form-group"><label>Valor</label><input id="f-valor" type="number" min="0" /></div>
        <div class="form-group"><label>Fecha expiración (opcional)</label><input id="f-expira" type="date" /></div>
        <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:8px">
          <button class="btn btn-ghost" id="btn-cancelar">Cancelar</button>
          <button class="btn btn-primary" id="btn-guardar">Guardar</button>
        </div>
      </div>
    </div>
  `

  document.getElementById('btn-nuevo').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'flex'
  })
  document.getElementById('btn-cancelar').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none'
  })
  document.getElementById('btn-guardar').addEventListener('click', async () => {
    const data = {
      codigo:          document.getElementById('f-codigo').value.trim().toUpperCase(),
      tipo:            document.getElementById('f-tipo').value,
      valor:           Number(document.getElementById('f-valor').value),
      activo:          1,
      fecha_expiracion: document.getElementById('f-expira').value || null,
    }
    if (!data.codigo || !data.valor) return alert('Completa código y valor')
    const res = await window.api.codigos.crear(data)
    if (res.error) return alert(res.error)
    navigateTo('codigos')
  })
})
