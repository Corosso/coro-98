const views = {}

function registerView(name, renderFn) {
  views[name] = renderFn
}

async function navigateTo(name) {
  const container = document.getElementById('content')
  container.innerHTML = ''

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === name)
  })

  if (views[name]) {
    await views[name](container)
  } else {
    container.innerHTML = `<p class="text-muted">Vista "${name}" no encontrada.</p>`
  }
}
