const { configFactory } = require('../factories')

module.exports = {
    address: address => {
        const config = configFactory.get()

        if (config.locale === 'english') {
            address = address.replace(/(.*)( Av| AV| Av\.| Ave)(\/|$|-|,| )(.*)/g, '$1 Avenue$3$4')
            address = address.replace(/(.*)( Rd)(\/|$|-|,| )(.*)/g, '$1 Road$3$4')
            address = address.replace(/(.*)( St)(\/|$|-|,| )(.*)/g, '$1 Street$3$4')
        }

        return address
    }
}