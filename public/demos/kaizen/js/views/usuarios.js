registerView('usuarios', async (container) => {
  const usuarios = await window.api.usuarios.listar()

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
      <h1 class="view-title" style="margin:0">Usuarios</h1>
      <button class="btn btn-primary" id="btn-nuevo">+ Nuevo</button>
    </div>

    <div class="card" style="max-width:520px">
      <table>
        <thead><tr><th>Nombre</th><th>Rol</th></tr></thead>
        <tbody>
          ${usuarios.map(u => `
            <tr>
              <td style="font-weight:500">${u.nombre}</td>
              <td><span class="badge ${u.rol === 'admin' ? 'badge-red' : 'badge-gray'}">${u.rol}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div id="modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:200; align-items:center; justify-content:center">
      <div class="card" style="width:360px">
        <h2 style="font-size:16px; margin-bottom:20px; color:var(--gold)">Nuevo Usuario</h2>
        <div class="form-group"><label>Nombre</label><input id="f-nombre" /></div>
        <div class="form-group">
          <label>Rol</label>
          <select id="f-rol">
            <option value="cajero">Cajero</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="form-group"><label>Contraseña</label><input id="f-pass" type="password" /></div>
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
      nombre:   document.getElementById('f-nombre').value.trim(),
      rol:      document.getElementById('f-rol').value,
      password: document.getElementById('f-pass').value,
    }
    if (!data.nombre || !data.password) return alert('Completa todos los campos')
    const res = await window.api.usuarios.crear(data)
    if (res.error) return alert(res.error)
    navigateTo('usuarios')
  })
})
