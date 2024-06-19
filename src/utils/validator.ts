import { ref } from 'vue'
import { checkRepeatEmail } from '@/api/auth/auth'

////UserData驗證
export type FieldName = 'email' | 'username' | 'password' | 'passwordConfirm' | 'title' | 'content'
export const inputValidator = () => {
  interface FormInputType {
    email?: string
    username?: string
    password?: string
    passwordConfirm?: string
    intro?: string
    title?: string
    content?: string
  }

  interface FormInputInvalidType {
    email: {
      valid: boolean
      registered: boolean
    }
    username: boolean
    password: boolean
    passwordConfirm: boolean
    intro?: boolean
    title?: boolean
    content?: boolean
  }
  const formInputInvalid = ref<FormInputInvalidType>({
    email: {
      valid: true,
      registered: false
    },
    username: true,
    password: true,
    passwordConfirm: true,
    title: true,
    content: true
  })

  async function validate(fieldName: FieldName | 'UserData', formInput: FormInputType) {
    if (fieldName === 'UserData') {
      const UserDataValidate: FieldName[] = ['username', 'password', 'passwordConfirm']

      for (const field of UserDataValidate) {
        validate(field, formInput)
      }
    } else {
      let isValid = true
      let emailRepeatCheck = false
      let value = formInput[fieldName]
      if (!value?.trim()) return

      if (!value || value.trim() === '') {
        isValid = false
        value = ''
      }

      let totalWeight = 0
      function countCharacters(text: string) {
        text = text.replace(/\u200B/g, '\n')
        for (const char of text) {
          if (/[\u4e00-\u9fa5\u3100-\u312F]/.test(char)) {
            totalWeight += 2
          } else if (/[\w\s\p{P}]+/u.test(char)) {
            totalWeight += 1
          } else if (/[\「\」\{\}\(\)\<\>\.,;:!?\-、\.\。\、；：！？_\、，"'：=]/.test(char)) {
            totalWeight += 1
          }
        }
        return totalWeight
      }
      switch (fieldName) {
        case 'email':
          const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim
          if (!emailRegex.test(value)) {
            isValid = false
          } else {
            isValid = true
          }
          const isEmailDuplicate = await checkRepeatEmail(value)
          if (isEmailDuplicate) {
            emailRepeatCheck = true
          } else {
            emailRepeatCheck = false
          }
          break
        case 'username':
          countCharacters(value)

          if (totalWeight < 4 || totalWeight > 15) {
            isValid = false
          }
          break

        case 'password':
          if (value.length < 6 || value.length > 15) {
            isValid = false
          }
          const passwordRegex =
            /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}$/
          for (const char of value) {
            if (passwordRegex.test(char)) {
              isValid = false
            }
          }
          break

        case 'passwordConfirm':
          if (value !== formInput.password) {
            isValid = false
          }
          break
        case 'title':
          countCharacters(value)
          if (totalWeight < 6 || totalWeight > 80) {
            isValid = false
          }
          break
        case 'content':
          countCharacters(value)

          if (totalWeight < 20 || totalWeight > 4000) {
            isValid = false
          }
          break
        default:
          break
      }

      if (fieldName === 'email') {
        formInputInvalid.value.email.valid = isValid
        formInputInvalid.value.email.registered = emailRepeatCheck
      } else {
        formInputInvalid.value[fieldName] = isValid
      }
    }
  }

  return { formInputInvalid, validate }
}
