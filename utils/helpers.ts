import { SECS, STO, PRI, SPL, SPQ } from '@/lib/constants'

let _id = 1000
export const uid = () => ++_id

export const gS = (id?: number) =>
  SECS.find(s => s.id === id) || { sigla:'?', cor:'#94a3b8', nome:'--' }

export const gT = (l: any[], v?: string) => l.find(s => s.v === v) || l[0]

export const readFileAsDataUrl = (file: File): Promise<{
  id: number; nome: string; tamanho: number; data: string; dataUrl: string
}> => new Promise((res) => {
  const r = new FileReader()
  const { td } = require('./formatters')
  r.onload = e => res({ id: uid(), nome: file.name, tamanho: file.size, data: td(), dataUrl: e.target!.result as string })
  r.readAsDataURL(file)
})

export const openFileInNewTab = (dataUrl: string, nome: string) => {
  try {
    const b64 = dataUrl.split(',')[1]
    const bytes = atob(b64)
    const arr = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
    const mime = nome.toLowerCase().endsWith('.pdf') ? 'application/pdf'
      : dataUrl.split(';')[0].split(':')[1] || 'application/octet-stream'
    const blob = new Blob([arr], { type: mime })
    window.open(URL.createObjectURL(blob), '_blank')
  } catch { alert('Não foi possível abrir o arquivo.') }
}

export const downloadFile = (dataUrl: string, nome: string) => {
  const a = document.createElement('a')
  a.href = dataUrl; a.download = nome; a.click()
}
