export const USA = { countryCode: 'US', id: 1, phoneCode: '+1', name: 'United States' };

export const Canada = { countryCode: 'CA', id: 39, phoneCode: '+1', name: 'Canada' };

export const CountryList = [
    { id: USA.id, countryName: USA.name, countryCode: USA.countryCode, phoneCode: USA.phoneCode, countryFlag: 'usa' },
    {
        id: Canada.id,
        countryName: Canada.name,
        countryCode: Canada.countryCode,
        phoneCode: Canada.phoneCode,
        countryFlag: 'canada',
    },
];
