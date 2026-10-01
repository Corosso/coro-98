// Kaizen demo — mock de window.api (sin Electron, sin Node, sin SQLite).
// Implementa la superficie EXACTA de preload.js con datos en memoria + localStorage.
// Si localStorage no está disponible (iframe sandbox), funciona solo en memoria.
;(function () {
  'use strict'

  const STORAGE_KEY = 'kaizen-demo-db-v1'

  function now() {
    const d = new Date()
    const p = n => String(n).padStart(2, '0')
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds())
  }

  function seed() {
    return {
      categorias: [
        { id: 1, nombre: 'Accesorios' },
        { id: 2, nombre: 'Snacks' },
        { id: 3, nombre: 'Bebidas' },
        { id: 4, nombre: 'Suplementos' },
        { id: 5, nombre: 'Planes' },
      ],
      metodosPago: [
        { id: 1, nombre: 'Efectivo' },
        { id: 2, nombre: 'Tarjeta' },
        { id: 3, nombre: 'Transferencia' },
        { id: 4, nombre: 'Nequi' },
      ],
      categoriasEgreso: [
        { id: 1, nombre: 'Mercancía' },
        { id: 2, nombre: 'Servicios' },
        { id: 3, nombre: 'Arriendo' },
        { id: 4, nombre: 'Nómina' },
        { id: 5, nombre: 'Mantenimiento' },
        { id: 6, nombre: 'Otros' },
      ],
      usuarios: [
        { id: 1, nombre: 'Admin', rol: 'admin' },
        { id: 2, nombre: 'Cajera', rol: 'cajero' },
      ],
      productos: [
        { id: 1, nombre: 'Proteína Whey 1kg', descripcion: 'Sabor chocolate', precio_venta: 150000, precio_costo: 90000, stock: 20, tipo: 'producto', categoria_id: 4, activo: 1 },
        { id: 2, nombre: 'Creatina 300g', descripcion: null, precio_venta: 85000, precio_costo: 50000, stock: 15, tipo: 'producto', categoria_id: 4, activo: 1 },
        { id: 3, nombre: 'Barra Proteica', descripcion: 'Barra 60g', precio_venta: 8000, precio_costo: 4000, stock: 40, tipo: 'producto', categoria_id: 2, activo: 1 },
        { id: 4, nombre: 'Agua 600ml', descripcion: null, precio_venta: 3000, precio_costo: 1200, stock: 100, tipo: 'producto', categoria_id: 3, activo: 1 },
        { id: 5, nombre: 'Bebida Isotónica', descripcion: 'Gatorade 500ml', precio_venta: 6000, precio_costo: 3500, stock: 50, tipo: 'producto', categoria_id: 3, activo: 1 },
        { id: 6, nombre: 'Membresía Mensual', descripcion: 'Acceso gym 30 días', precio_venta: 90000, precio_costo: 0, stock: 0, tipo: 'plan', categoria_id: 5, activo: 1 },
        { id: 7, nombre: 'Plan Trimestral', descripcion: 'Acceso gym 90 días', precio_venta: 240000, precio_costo: 0, stock: 0, tipo: 'plan', categoria_id: 5, activo: 1 },
      ],
      codigos: [
        { id: 1, codigo: 'PROMO20', tipo: 'porcentaje', valor: 20, activo: 1, fecha_expiracion: null },
        { id: 2, codigo: 'BIENVENIDO', tipo: 'monto_fijo', valor: 10000, activo: 1, fecha_expiracion: null },
      ],
      ventas: [],
      egresos: [],
      sesiones: [],
      seq: {
        producto: 8, usuario: 3, categoria: 6, metodo: 5, codigo: 3,
        categoriaEgreso: 7, venta: 1, egreso: 1, sesion: 1,
      },
    }
  }

  // ── Persistencia (localStorage con fallback a memoria) ────────────────
  let db = null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    db = raw ? JSON.parse(raw) : seed()
  } catch (e) {
    db = seed()
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)) } catch (e) { /* sandbox: solo memoria */ }
  }

  const nextId = k => db.seq[k]++

  const catNombre = id => { const c = db.categorias.find(x => x.id === id); return c ? c.nombre : null }
  const metNombre = id => { const m = db.metodosPago.find(x => x.id === id); return m ? m.nombre : null }
  const userNombre = id => { const u = db.usuarios.find(x => x.id === id); return u ? u.nombre : null }
  const prodNombre = id => { const p = db.productos.find(x => x.id === id); return p ? p.nombre : ('Producto #' + id) }

  const normId = v => (v === '' || v == null) ? null : +v

  function ventaConJoins(v) {
    return {
      id: v.id, fecha: v.fecha, total: v.total, usuario_id: v.usuario_id, codigo_promo_id: v.codigo_promo_id,
      cajero: userNombre(v.usuario_id),
      metodo_pago: v.pagos.map(p => metNombre(p.metodo_pago_id)).filter(Boolean).join(' + ') || null,
      items: v.items, pagos: v.pagos,
    }
  }

  function detalleItems(items) {
    return items.map(it => ({ ...it, producto: prodNombre(it.producto_id), tipo: (db.productos.find(p => p.id === it.producto_id) || { tipo: 'producto' }).tipo }))
  }
  function detallePagos(pagos) {
    return pagos.map(p => ({ ...p, metodo_pago: metNombre(p.metodo_pago_id) }))
  }

  window.api = {
    productos: {
      listar: () =>
        db.productos
          .filter(p => p.activo === 1)
          .map(p => ({ ...p, categoria: catNombre(p.categoria_id) }))
          .sort((a, b) => a.tipo.localeCompare(b.tipo) || a.nombre.localeCompare(b.nombre)),
      crear: (data) => {
        const id = nextId('producto')
        db.productos.push({ id, nombre: data.nombre, descripcion: data.descripcion || null, precio_venta: +data.precio_venta, precio_costo: +data.precio_costo, stock: +data.stock, tipo: data.tipo, categoria_id: normId(data.categoria_id), activo: 1 })
        persist()
        return { id }
      },
      actualizar: (id, data) => {
        const p = db.productos.find(x => x.id === id)
        if (p) Object.assign(p, data, { categoria_id: normId(data.categoria_id) })
        persist()
        return { ok: true }
      },
      desactivar: (id) => {
        const p = db.productos.find(x => x.id === id)
        if (p) p.activo = 0
        persist()
        return { ok: true }
      },
    },

    ventas: {
      registrar: ({ items, pagos, usuario_id, codigo_promo_id, total }) => {
        for (const it of items) {
          if (it.tipo !== 'plan') {
            const p = db.productos.find(x => x.id === it.producto_id)
            if (!p || p.stock < it.cantidad) return { error: 'Stock insuficiente: ' + (it.nombre || 'producto #' + it.producto_id) }
          }
        }
        const id = nextId('venta')
        const fecha = now()
        for (const it of items) {
          if (it.tipo !== 'plan') {
            const p = db.productos.find(x => x.id === it.producto_id)
            p.stock -= it.cantidad
          }
        }
        db.ventas.push({
          id, fecha, total, usuario_id: usuario_id ?? 1, codigo_promo_id: codigo_promo_id ?? null,
          items: items.map(it => ({ producto_id: it.producto_id, cantidad: it.cantidad, precio_unitario: it.precio_unitario, subtotal: it.subtotal })),
          pagos: pagos.map(p => ({ metodo_pago_id: +p.metodo_pago_id, monto: +p.monto })),
        })
        persist()
        return { id }
      },
      listar: (filtros = {}) => {
        let vs = db.ventas
        if (filtros && filtros.fecha) vs = vs.filter(v => (v.fecha || '').split(' ')[0] === filtros.fecha)
        return vs.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).map(ventaConJoins)
      },
      detalle: (id) => {
        const v = db.ventas.find(x => x.id === id)
        if (!v) return { error: 'Venta no encontrada' }
        return { ...ventaConJoins(v), items: detalleItems(v.items), pagos: detallePagos(v.pagos) }
      },
    },

    usuarios: {
      listar: () => db.usuarios.map(u => ({ id: u.id, nombre: u.nombre, rol: u.rol })),
      crear: ({ nombre, rol, password }) => {
        if (db.usuarios.some(u => u.nombre.toLowerCase() === nombre.toLowerCase())) return { error: 'Ya existe un usuario con ese nombre' }
        const id = nextId('usuario')
        db.usuarios.push({ id, nombre, rol })
        persist()
        return { id }
      },
      login: (nombre) => {
        const u = db.usuarios.find(x => x.nombre === nombre)
        return u ? { id: u.id, nombre: u.nombre, rol: u.rol } : null
      },
    },

    categorias: {
      listar: () => db.categorias.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)),
      crear: (nombre) => {
        if (db.categorias.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) return { error: 'Ya existe una categoría con ese nombre' }
        const id = nextId('categoria')
        db.categorias.push({ id, nombre })
        persist()
        return { id }
      },
      actualizar: (id, nombre) => {
        if (db.categorias.some(c => c.id !== id && c.nombre.toLowerCase() === nombre.toLowerCase())) return { error: 'Ya existe una categoría con ese nombre' }
        const c = db.categorias.find(x => x.id === id)
        if (c) c.nombre = nombre
        persist()
        return { ok: true }
      },
      eliminar: (id) => {
        const uso = db.productos.filter(p => p.categoria_id === id && p.activo === 1).length
        if (uso > 0) return { error: 'Tiene ' + uso + ' producto(s) activo(s)' }
        db.categorias = db.categorias.filter(c => c.id !== id)
        persist()
        return { ok: true }
      },
    },

    metodosPago: {
      listar: () => db.metodosPago.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)),
      crear: (nombre) => {
        if (db.metodosPago.some(m => m.nombre.toLowerCase() === nombre.toLowerCase())) return { error: 'Ya existe un método con ese nombre' }
        const id = nextId('metodo')
        db.metodosPago.push({ id, nombre })
        persist()
        return { id }
      },
      actualizar: (id, nombre) => {
        if (db.metodosPago.some(m => m.id !== id && m.nombre.toLowerCase() === nombre.toLowerCase())) return { error: 'Ya existe un método con ese nombre' }
        const m = db.metodosPago.find(x => x.id === id)
        if (m) m.nombre = nombre
        persist()
        return { ok: true }
      },
      eliminar: (id) => {
        const uso = db.ventas.reduce((s, v) => s + v.pagos.filter(p => p.metodo_pago_id === id).length, 0)
        if (uso > 0) return { error: 'Usado en ' + uso + ' venta(s)' }
        db.metodosPago = db.metodosPago.filter(m => m.id !== id)
        persist()
        return { ok: true }
      },
    },

    codigos: {
      listar: () => db.codigos.slice().sort((a, b) => a.codigo.localeCompare(b.codigo)),
      crear: (data) => {
        if (db.codigos.some(c => c.codigo.toUpperCase() === data.codigo.toUpperCase())) return { error: 'Ese código ya existe' }
        const id = nextId('codigo')
        db.codigos.push({ id, codigo: data.codigo, tipo: data.tipo, valor: +data.valor, activo: data.activo ? 1 : 0, fecha_expiracion: data.fecha_expiracion || null })
        persist()
        return { id }
      },
      validar: (codigo) => {
        const c = db.codigos.find(x => x.codigo.toUpperCase() === String(codigo).toUpperCase() && x.activo === 1)
        if (!c) return null
        if (c.fecha_expiracion && c.fecha_expiracion < now().split(' ')[0]) return null
        return { ...c }
      },
    },

    caja: {
      estado: () => {
        const sesion = db.sesiones.filter(s => s.fecha_cierre == null).sort((a, b) => b.fecha_apertura.localeCompare(a.fecha_apertura))[0]
        return { sesion: sesion ? { ...sesion, cajero: userNombre(sesion.usuario_id) } : null }
      },
      abrir: () => {
        const admin = db.usuarios.find(u => u.rol === 'admin')
        if (!admin) return { error: 'No hay administradores configurados' }
        const id = nextId('sesion')
        const sesion = { id, fecha_apertura: now(), fecha_cierre: null, usuario_id: admin.id }
        db.sesiones.push(sesion)
        persist()
        return { sesion: { ...sesion, cajero: admin.nombre } }
      },
      cerrar: (sesionId) => {
        const s = db.sesiones.find(x => x.id === sesionId)
        if (!s) return { error: 'Sesión no encontrada' }
        s.fecha_cierre = now()
        const cerrada = { ...s, cajero: userNombre(s.usuario_id) }
        const ventas = db.ventas.filter(v => v.fecha >= s.fecha_apertura && v.fecha <= s.fecha_cierre).sort((a, b) => a.fecha.localeCompare(b.fecha))
        const conDetalle = ventas.map(v => ({ ...ventaConJoins(v), items: detalleItems(v.items), pagos: detallePagos(v.pagos) }))
        persist()
        return { ventas: conDetalle, sesion: cerrada }
      },
      exportar: () => {
        alert('Demo: la exportación a Excel no está disponible en la versión web.')
        return { canceled: true }
      },
    },

    egresos: {
      listar: (filtros = {}) => {
        let es = db.egresos
        if (filtros && filtros.fecha) es = es.filter(e => (e.fecha || '').split(' ')[0] === filtros.fecha)
        return es.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).map(e => ({
          ...e, usuario: userNombre(e.usuario_id), categoria: null, metodo_pago: metNombre(e.metodo_pago_id),
        }))
      },
      detalle: (id) => {
        const e = db.egresos.find(x => x.id === id)
        if (!e) return { error: 'Egreso no encontrado' }
        return { ...e, usuario: userNombre(e.usuario_id), categoria: null, metodo_pago: metNombre(e.metodo_pago_id), items: detalleItems(e.items) }
      },
      crear: ({ concepto, metodo_pago_id, notas, usuario_id, items, total_manual }) => {
        const listaItems = items || []
        const total = listaItems.length
          ? listaItems.reduce((s, i) => s + (+i.total_compra || 0), 0)
          : (+total_manual || 0)
        if (total <= 0) return { error: 'El total del egreso debe ser mayor a cero' }

        const detalle = []
        for (const it of listaItems) {
          const cantidad = +it.cantidad
          const totalItem = +it.total_compra
          if (!(cantidad > 0)) return { error: 'La cantidad de cada producto debe ser mayor a cero' }
          if (!(totalItem > 0)) return { error: 'El valor de compra de cada producto debe ser mayor a cero' }
          const costoUnitario = +it.costo_unitario > 0 ? +it.costo_unitario : totalItem / cantidad

          let productoId = it.producto_id
          if (!productoId && it.producto_nuevo) {
            const nuevo = it.producto_nuevo
            const pid = nextId('producto')
            db.productos.push({ id: pid, nombre: nuevo.nombre, descripcion: null, precio_venta: +nuevo.precio_venta || 0, precio_costo: costoUnitario, stock: cantidad, tipo: 'producto', categoria_id: normId(nuevo.categoria_id), activo: 1 })
            productoId = pid
          } else {
            const p = db.productos.find(x => x.id === productoId)
            if (!p) return { error: 'El producto #' + productoId + ' no existe' }
            const nuevoStock = p.stock + cantidad
            p.precio_costo = nuevoStock <= 0 ? costoUnitario : (p.stock * p.precio_costo + cantidad * costoUnitario) / nuevoStock
            p.stock = nuevoStock
          }
          detalle.push({ producto_id: productoId, cantidad, costo_unitario: costoUnitario, subtotal: totalItem })
        }

        const id = nextId('egreso')
        db.egresos.push({ id, fecha: now(), concepto, categoria_id: null, total, usuario_id: usuario_id ?? 1, metodo_pago_id: normId(metodo_pago_id), notas: notas || null, items: detalle })
        persist()
        return { id }
      },
    },

    categoriasEgreso: {
      listar: () => db.categoriasEgreso.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)),
      crear: (nombre) => {
        if (db.categoriasEgreso.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) return { error: 'Ya existe una categoría con ese nombre' }
        const id = nextId('categoriaEgreso')
        db.categoriasEgreso.push({ id, nombre })
        persist()
        return { id }
      },
    },

    facturas: {
      generar: (ventaId) => {
        const v = db.ventas.find(x => x.id === ventaId)
        if (!v) return { error: 'Venta no encontrada' }
        return { path: 'factura-' + ventaId + '.pdf' }
      },
      abrir: () => {
        alert('Demo: la apertura de PDF no está disponible en la versión web.')
        return { ok: true }
      },
    },
  }
})()
