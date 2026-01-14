// डैशबोर्ड के सेक्शन यहीं से कॉन्फ़िग करें.
// NOTE: ब्राउज़र से CSV fetch करने के लिए शीट public/published होनी चाहिए.

/**
 * @type {Array<{
 *  key: string,
 *  title: string,
 *  source: { spreadsheetId: string, sheetName?: string, gid?: string|number }
 * }>} */
export const DASHBOARD_SECTIONS = [
  {
    key: 'cyber-awareness',
    title: 'साइबर जागरूकता कार्यक्रम',
    source: { spreadsheetId: '1iH9yBXjjQAgCMvg4k3MzBu0EzypRnK5wJ0DLWtoWkV4' },
    formLink: 'https://forms.gle/NJopTL9wovPhWfBN8',
  },
  {
    key: 'pratibimb-portal',
    title: 'प्रतिविम्ब पोर्टल',
    source: { spreadsheetId: '1-M-TtC3B1_xekkuPWx0QpcUn-YycUukvDRWTOQE8xA8' },
    formLink: 'https://forms.gle/7ipjCcMSgtr3gmQq8',
  },
  {
    key: 'samnvay-notices-generated',
    title: 'समन्वय पोर्टल पर निर्गत नोटिस',
    source: { spreadsheetId: '16jNmxct-lw1GFqDxnucaH5beJWY5dZLtn9fZT3HEjZM' },
    formLink: 'https://forms.gle/RU1XyHdju8px9YXX9',
  },
  {
    key: 'samnvay-notices-received',
    title: 'समन्वय पोर्टल प्राप्त नोटिस',
    source: { spreadsheetId: '1kdAF7bsO5XBCHiAFVNcgiOarqcEQEM8Q1eZzv1CMnyY' },
    formLink: 'https://forms.gle/4GQbRYkmM6udrgfz8',
  },
  {
    key: 'ncmec',
    title: 'NCMEC PORTAL',
    source: { spreadsheetId: '1IiaecZdzeqXNU0uqa5ykUA3EJpvAWbjL9zZ25QybeqI' },
    formLink: 'https://forms.gle/Fu5eoRZxapqa4M1P8',
  },
  {
    key: 'mule-account-entry',
    title: 'Mule Account Entry',
    source: { spreadsheetId: '1qZGpASsNrwYMItcRoCvfKpy7HoCseDnMjtpsmPsixPo' },
    formLink: 'https://forms.gle/d4D9GKZCmWvgoBpK7',
  },
  {
    key: 'unfreeze-account-entry',
    title: 'Unfreeze Account Entry',
    source: { spreadsheetId: '1auKzU0AOumLw_U836OuUvDGD4MUUTkCjXTUu6CgYY8w' },
    formLink: 'https://forms.gle/dYXHzFvVeX8iYyks5',
  },
]
