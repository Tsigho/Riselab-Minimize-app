
export interface Country {
    code: string;
    name: string;
    phoneCode: string;
    flag: string;
}

export const countries: Country[] = [
    { code: "MZ", name: "Moçambique", phoneCode: "+258", flag: "🇲🇿" },
    { code: "BR", name: "Brasil", phoneCode: "+55", flag: "🇧🇷" },
    { code: "PT", name: "Portugal", phoneCode: "+351", flag: "🇵🇹" },
    { code: "ZA", name: "África do Sul", phoneCode: "+27", flag: "🇿🇦" },
    { code: "AO", name: "Angola", phoneCode: "+244", flag: "🇦🇴" },
];

export const defaultCountry = countries[0];
