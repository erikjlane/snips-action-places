const { configFactory } = require('../factories')

module.exports = {
    time: date => {
        const config = configFactory.get()

        if (config.locale === 'french') {
            // French
            return date.getHours() + 'h' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
        } else {
            // English
            const meridiem = (date.getHours() > 11) ? 'pm' : 'am'
            const hours = (meridiem === 'pm') ? date.getHours() - 12 : date.getHours()

            return hours + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ' ' + meridiem
        }
    },
    
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