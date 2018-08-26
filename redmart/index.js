const href = uri => `https://redmart.com/product/${uri}`

const columnOrder = ['details', 'pricing']
const columnDefinitions = {
  pricing: {
    className: 'dt-body-center',
    render: ({ promo_price, price }) => (promo_price || price).toFixed(2),
  },
  details: {
    render: ({ uri }, type, { title }) => `<a target="_new" href="${href(uri)}">${title}</a>`,
  },
}

const columnsToDefinitions =
  (column, targets) => ({ targets, ...columnDefinitions[column] })

const sortIndices = {
  pricing: { asc: 8, desc: 16 },
  details: { asc: 32, desc: 64 },
}

function mapServerResponse (response) {
  const defaults = { products: [], total: 0 }
  const { products: data, total: recordsTotal } = { ...defaults, ...response }
  return { data, recordsTotal, recordsFiltered: recordsTotal }
}

let lastKnownPrice

function mapDataTablesParams (dtParams) {
  let price = Number($('#lookup input[type=number]').val())
  if (!price) {
    $('#lookup input[type=number]').val(lastKnownPrice)
    price = lastKnownPrice
  }
  const params = {
    toggle: 'stock_status',
    price: `${price}-${price * 1.5}`,
  }

  lastKnownPrice = price

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

const ENDPOINT = 'https://api.redmart.com/v1.6.0/catalog/search'

function ajax (data, callback) {
  const qs = Object.entries(mapDataTablesParams(data))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  $.ajax(`${ENDPOINT}?${qs}`, {
    dataType: 'json',
    error: console.warn,
    complete: ({ responseJSON }) => {
      callback(mapServerResponse(responseJSON))
    }
  })
}

let items

$(document).ready(() => {
  $('#items').hide()
  $('#lookup').submit((event) => {
    if (items) {
      items.clear().draw()
    } else {
      items = $('#items').DataTable({
        pageLength: 20,
        pagingType: 'full',
        lengthChange: false,
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
      $('#items').show()
    }
    event.preventDefault()
    return false
  })
})
