let useAffiliateLinks = true

const href = (price, category) => {
  const url = `https://www.amazon.sg/s?i=${category}&s=price-asc-rank&rh=p_36%3A${price}-`
  return useAffiliateLinks
    ? `${url}&tag=lonerifle-22`
    : url
}

window.onload = () => {
  document.getElementById('lookup-button').onclick = event => {
    event.preventDefault()
    const price = 4000 - (Number(document.getElementById('price').value) * 100)
    const category = document.getElementById('category').value
    window.open(href(price, category))
    return false
  }

  document.getElementById('affiliate-toggle').onclick = () => {
    useAffiliateLinks = !useAffiliateLinks
    document.getElementById('affiliate-indicator').innerText = (useAffiliateLinks ? 'on' : 'off')
    document.getElementById('affiliate-prompt').innerText = (useAffiliateLinks ? 'off' : 'on')
  }
}