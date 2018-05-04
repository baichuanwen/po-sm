/**
 * language category change
 */
const languageCategory = 'LANGUAGE_CATAEGORY'

class LangChange {
  static status () {
    return !!localStorage.getItem(languageCategory)
  }

  static updateLang (language: string) {
    if (language === 'zh') {
      localStorage.setItem(languageCategory, 'en')
    } else {
      localStorage.setItem(languageCategory, 'zh')
    }
  }

  static getLang () {
    return localStorage.getItem(languageCategory) || 'zh'
  }
}

export default LangChange
