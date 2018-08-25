const href = uri => `https://redmart.com/product/${uri}`

const columnOrder = ['details', 'pricing']
const columnDefinitions = {
  pricing: ({ promo_price, price }) => promo_price || price,
  details: ({ uri }, type, { title }) => `<a target="_new" href="${href(uri)}">${title}</a>`,
}

const columnsToDefinitions =
  (column, index) => ({ targets: [ index ], render: columnDefinitions[column] })

const sortIndices = {
  pricing: { asc: 8, desc: 16 },
  details: { asc: 32, desc: 64 },
}

function mapServerResponse (response) {
  const defaults = { products: [], total: 0 }
  const { products: data, total: recordsTotal } = { ...defaults, ...response }
  return { data, recordsTotal, recordsFiltered: recordsTotal }
}

function mapDataTablesParams (dtParams) {
  const params = {
    price: '2.99-5',
  }

  const { length, start, order, search } = dtParams

  if (search && search.value) {
    params.q = search.value
  }

  params.pageSize = length
  params.page = start / length

  const { column: sortColumnIndex, dir: sortDir } = order && order[0]
  const sortColumn = columnOrder[sortColumnIndex]
  const sortIndex = sortIndices[sortColumn] && sortIndices[sortColumn][sortDir]
  if (sortIndex) {
    params.sort = sortIndex
  }

  return params
}

function ajax (data, callback) {
  const qs = Object.entries(mapDataTablesParams(data))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  $.ajax(`https://api.redmart.com/v1.6.0/catalog/search?${qs}`, {
    dataType: 'json',
    error: console.warn,
    complete: ({ responseJSON }) => {
      callback(mapServerResponse(responseJSON))
    }
  })
}

$(document).ready(() => {
  $('#items').DataTable({
    pageLength: 25,
    search: { regex: false },
    processing: true,
    serverSide: true,
    ajax,
    columnDefs: columnOrder
      .map(columnsToDefinitions)
      .filter(d => d.render),
    columns: columnOrder.map(data => ({ data })),
    orderMulti: false,
    order: [1, 'asc'],
  })
})