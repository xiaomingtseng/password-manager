export interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  customSymbols: string
}

export class PasswordGenerator {
  private static readonly UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  private static readonly UPPERCASE_CHARS_NO_SIMILAR = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  private static readonly LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz'
  private static readonly LOWERCASE_CHARS_NO_SIMILAR = 'abcdefghijkmnopqrstuvwxyz'
  private static readonly NUMBER_CHARS = '0123456789'
  private static readonly NUMBER_CHARS_NO_SIMILAR = '23456789'

  static generate(options: PasswordOptions): string {
    let charSet = ''
    const requiredChars: string[] = []

    // 構建字符集並確保包含每種必需的字符類型
    if (options.includeUppercase) {
      const upperChars = options.excludeSimilar 
        ? this.UPPERCASE_CHARS_NO_SIMILAR 
        : this.UPPERCASE_CHARS
      charSet += upperChars
      requiredChars.push(this.getRandomChar(upperChars))
    }

    if (options.includeLowercase) {
      const lowerChars = options.excludeSimilar 
        ? this.LOWERCASE_CHARS_NO_SIMILAR 
        : this.LOWERCASE_CHARS
      charSet += lowerChars
      requiredChars.push(this.getRandomChar(lowerChars))
    }

    if (options.includeNumbers) {
      const numberChars = options.excludeSimilar 
        ? this.NUMBER_CHARS_NO_SIMILAR 
        : this.NUMBER_CHARS
      charSet += numberChars
      requiredChars.push(this.getRandomChar(numberChars))
    }

    if (options.includeSymbols && options.customSymbols) {
      charSet += options.customSymbols
      requiredChars.push(this.getRandomChar(options.customSymbols))
    }

    // 如果沒有選擇任何字符類型，使用默認數字
    if (charSet === '') {
      charSet = this.NUMBER_CHARS
    }

    // 生成密碼
    let password = [...requiredChars]

    // 填充剩餘長度
    for (let i = requiredChars.length; i < options.length; i++) {
      password.push(this.getRandomChar(charSet))
    }

    // 如果長度小於必需字符數，截取到指定長度
    if (password.length > options.length) {
      password = password.slice(0, options.length)
    }

    // 隨機打亂順序
    return this.shuffleArray(password).join('')
  }

  static calculateStrength(options: PasswordOptions): {
    score: number
    level: 'weak' | 'medium' | 'strong'
    feedback: string[]
  } {
    let score = 0
    const feedback: string[] = []

    // 長度評分
    if (options.length >= 8) score += 1
    if (options.length >= 12) score += 1
    if (options.length >= 16) score += 1
    else if (options.length < 8) {
      feedback.push('密碼長度應至少為8個字符')
    }

    // 字符類型評分
    let charTypeCount = 0
    if (options.includeUppercase) {
      charTypeCount++
      score += 1
    }
    if (options.includeLowercase) {
      charTypeCount++
      score += 1
    }
    if (options.includeNumbers) {
      charTypeCount++
      score += 1
    }
    if (options.includeSymbols) {
      charTypeCount++
      score += 1
    }

    if (charTypeCount < 3) {
      feedback.push('建議至少使用3種不同類型的字符')
    }

    // 排除相似字符加分
    if (options.excludeSimilar) {
      score += 0.5
    }

    // 確定強度等級
    let level: 'weak' | 'medium' | 'strong'
    if (score <= 3) {
      level = 'weak'
      feedback.push('密碼強度較弱，建議增加長度或字符類型')
    } else if (score <= 5) {
      level = 'medium'
    } else {
      level = 'strong'
    }

    return { score, level, feedback }
  }

  static estimateEntropy(options: PasswordOptions): number {
    let charSetSize = 0

    if (options.includeUppercase) {
      charSetSize += options.excludeSimilar ? 25 : 26
    }
    if (options.includeLowercase) {
      charSetSize += options.excludeSimilar ? 25 : 26
    }
    if (options.includeNumbers) {
      charSetSize += options.excludeSimilar ? 8 : 10
    }
    if (options.includeSymbols) {
      charSetSize += options.customSymbols.length
    }

    if (charSetSize === 0) return 0

    // 熵 = log2(字符集大小^密碼長度)
    return Math.log2(Math.pow(charSetSize, options.length))
  }

  private static getRandomChar(chars: string): string {
    return chars.charAt(Math.floor(Math.random() * chars.length))
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

// 預設配置
export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: false,
  customSymbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
}

// 常用配置預設
export const PASSWORD_PRESETS = {
  simple: {
    ...DEFAULT_PASSWORD_OPTIONS,
    length: 8,
    includeSymbols: false,
    excludeSimilar: true
  },
  standard: {
    ...DEFAULT_PASSWORD_OPTIONS,
    length: 12
  },
  strong: {
    ...DEFAULT_PASSWORD_OPTIONS,
    length: 20,
    excludeSimilar: true
  },
  numeric: {
    ...DEFAULT_PASSWORD_OPTIONS,
    length: 6,
    includeUppercase: false,
    includeLowercase: false,
    includeSymbols: false,
    includeNumbers: true
  }
}
