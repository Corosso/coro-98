window._session = null

function mostrarSesion(sesion) {
  document.getElementById('caja-cajero').textContent = sesion.cajero || '—'
  const hora = (sesion.fecha_apertura || '').split(' ')[1]?.slice(0, 5) || '—'
  document.getElementById('caja-hora').textContent = hora
}

async function inicializar() {
  const { sesion } = await window.api.caja.estado()
  if (sesion) {
    window._session = sesion
    mostrarSesion(sesion)
    navigateTo('ventas')
  } else {
    document.getElementById('overlay-caja').style.display = 'flex'
  }
}

document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', () => navigateTo(el.dataset.view))
})

document.getElementById('btn-abrir-caja').addEventListener('click', async () => {
  const btn = document.getElementById('btn-abrir-caja')
  btn.disabled = true
  btn.textContent = 'Abriendo...'

  const res = await window.api.caja.abrir()
  if (res.error) {
    alert(res.error)
    btn.disabled = false
    btn.textContent = 'ABRIR CAJA'
    return
  }

  window._session = res.sesion
  mostrarSesion(res.sesion)
  document.getElementById('overlay-caja').style.display = 'none'
  navigateTo('ventas')
})

document.getElementById('btn-cerrar-caja').addEventListener('click', async () => {
  if (!window._session) return
  if (!confirm('¿Cerrar la caja y generar el reporte de la sesión?')) return

  const res = await window.api.caja.cerrar(window._session.id)
  if (res.error) return alert('Error al cerrar caja: ' + res.error)

  const exp = await window.api.caja.exportar({
    ventas: res.ventas,
    sesion: { ...res.sesion, cajero: window._session.cajero },
  })

  if (exp.error) {
    alert('Error exportando reporte: ' + exp.error)
  } else if (!exp.canceled) {
    alert(`Reporte guardado correctamente.\n${exp.path}`)
  }

  window._session = null
  document.getElementById('caja-cajero').textContent = '—'
  document.getElementById('caja-hora').textContent = '—'
  document.getElementById('overlay-caja').style.display = 'flex'
  const btn = document.getElementById('btn-abrir-caja')
  btn.disabled = false
  btn.textContent = 'ABRIR CAJA'
})

document.getElementById('btn-logout').addEventListener('click', () => {
  if (!confirm('¿Salir de la aplicación?')) return
  alert('Demo: esta ventana no puede cerrarse desde el navegador.')
})

inicializar()
