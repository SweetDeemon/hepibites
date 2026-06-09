const HARGA_SATUAN = 105000
const HARGA_GROSIR = 100000
const MIN_GROSIR = 10
const MAX_GROSIR = 30

export function hitungHarga(jumlahKarton: number): {
  hargaPerKarton: number
  totalHarga: number
} {
  if (jumlahKarton === 1) {
    return { hargaPerKarton: HARGA_SATUAN, totalHarga: HARGA_SATUAN }
  }

  if (jumlahKarton >= MIN_GROSIR && jumlahKarton <= MAX_GROSIR) {
    const total = jumlahKarton * HARGA_GROSIR
    return { hargaPerKarton: HARGA_GROSIR, totalHarga: total }
  }

  throw new Error(
    `Jumlah karton harus 1 atau antara ${MIN_GROSIR}-${MAX_GROSIR}. Hubungi admin untuk konfirmasi manual.`
  )
}

export function validasiJumlahKarton(jumlahKarton: number): {
  valid: boolean
  pesan?: string
} {
  if (jumlahKarton === 1) return { valid: true }

  if (jumlahKarton >= MIN_GROSIR && jumlahKarton <= MAX_GROSIR) {
    return { valid: true }
  }

  return {
    valid: false,
    pesan: `Jumlah karton harus 1 atau antara ${MIN_GROSIR}-${MAX_GROSIR}.`,
  }
}
