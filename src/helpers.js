function getCurrencyByKey(key) {
  if (/^eth/i.test(key))
    return 'ETH'
  if (/^btc/i.test(key))
    return 'BTC'
  if (/^bch/i.test(key))
    return 'BCH'
  if (/^ltc/i.test(key))
    return 'LTC'
  if (/^xrp/i.test(key))
    return 'XRP'
  if (/^dash/i.test(key))
    return 'DASH'
  if (/^trst/i.test(key))
    return 'TRST'

  return 'BTC' //default
}

function getCurrencyByClient(client) {
  switch (client) {
    case 'BITCOIN':
      return 'BTC'
    case 'BITCOINCASH':
      return 'BCH'
    case 'LITECOIN':
      return 'LTC'
    case 'RIPPLE':
      return 'XRP'
    case 'DASH':
      return 'DASH'
    case 'ETHEREUM':
      return 'ETH'
    case 'TRUST':
      return 'TRST'

    default:
      return 'BTC' //default
  }
}

module.exports = {
  getCurrencyByKey,
  getCurrencyByClient
}
