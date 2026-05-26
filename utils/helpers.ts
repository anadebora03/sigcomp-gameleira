import { SECS } from '@/lib/constants'
import { td } from '@/utils/formatters'

let _id = 1000
export const uid = () => ++_id

export const gS = (id?: number) =>
  SECS.find(s => s.id === id) || { sigla: '?', cor: '#94a3b8', nome: '--' }

export const gT = (l: any[], v?: string) => l.find(s => s.v === v) || l[0]

/**
 * readFiles — lê arquivos localmente como base64.
 * Usado apenas como fallback quando Storage não está disponível.
 * Em produção, use useUpload hook ou uploadArquivos() de lib/storage.ts.
 */
export const readFiles = (files: File[]): Promise<any[]> =>
  Promise.all(files.map(fl => new Promise(res => {
    const r = new FileReader()
    r.onload = e => res({
      id: String(uid()),
      nome: fl.name,
      tamanho: fl.size,
      data: td(),
      dataUrl: (e.target as any).result,
    })
    r.readAsDataURL(fl)
  })))

export const openFile = (dataUrl: string, nome: string) => {
  try {
    const b64 = dataUrl.split(',')[1]
    const bytes = atob(b64)
    const arr = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
    const mime = nome.toLowerCase().endsWith('.pdf')
      ? 'application/pdf'
      : dataUrl.split(';')[0].split(':')[1] || 'application/octet-stream'
    window.open(URL.createObjectURL(new Blob([arr], { type: mime })), '_blank')
  } catch { alert('Não foi possível abrir o arquivo.') }
}

export const downloadFile = (dataUrl: string, nome: string) => {
  const a = document.createElement('a')
  a.href = dataUrl; a.download = nome; a.click()
}
