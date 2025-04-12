import labels from './labels.json'

export const renderBoxes = (
  canvasRef: HTMLCanvasElement,
  boxes_data: number[],
  scores_data: number[],
  classes_data: number[],
  ratios: number[],
  tresshold: number,
) => {
  const ctx = canvasRef.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) // clean canvas

  const colors = new Colors()

  // font configs
  const font = `${Math.max(
    Math.round(Math.max(ctx.canvas.width, ctx.canvas.height) / 40),
    14,
  )}px Arial`
  ctx.font = font
  ctx.textBaseline = 'top'

  for (let i = 0; i < scores_data.length; ++i) {
    // filter based on class threshold
    const klass = labels[classes_data[i]]
    const color = colors.get(classes_data[i])
    const score = (scores_data[i] * 100).toFixed(1)

    if (Number(score) < tresshold) continue

    let [y1, x1, y2, x2] = boxes_data.slice(i * 4, (i + 1) * 4)
    x1 *= ratios[0]
    x2 *= ratios[0]
    y1 *= ratios[1]
    y2 *= ratios[1]
    const width = x2 - x1
    const height = y2 - y1

    // draw box.
    ctx.fillStyle = Colors.hexToRgba(color, 0.2)!
    ctx.fillRect(x1, y1, width, height)

    // draw border box.
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(
      Math.min(ctx.canvas.width, ctx.canvas.height) / 200,
      2.5,
    )
    ctx.strokeRect(x1, y1, width, height)

    // Draw the label background.
    ctx.fillStyle = color
    const textWidth = ctx.measureText(klass + ' - ' + score + '%').width
    const textHeight = parseInt(font, 10) // base 10
    const yText = y1 - (textHeight + ctx.lineWidth)
    ctx.fillRect(
      x1 - 1,
      yText < 0 ? 0 : yText, // handle overflow label box
      textWidth + ctx.lineWidth,
      textHeight + ctx.lineWidth,
    )

    // Draw labels
    ctx.fillStyle = '#ffffff'
    ctx.fillText(klass + ' - ' + score + '%', x1 - 1, yText < 0 ? 0 : yText)
  }
}

export const renderBoxesSimple = (
  canvasRef: HTMLCanvasElement,
  boxes_data: number[][],
  ratios: number[],
  threshold: number,
) => {
  const ctx = canvasRef.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) // clean canvas

  // font configs
  const font = `${Math.max(
    Math.round(Math.max(ctx.canvas.width, ctx.canvas.height) / 40),
    14,
  )}px Arial`
  ctx.font = font
  ctx.textBaseline = 'top'
  if (!ctx) return

  boxes_data.forEach((det) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, x0, y0, x1, y1, cls_id, score] = det

    if (score < threshold / 100) return
    const [xRatio, yRatio] = ratios
    // Konversi koordinat ke ukuran gambar asli
    const origX0 = x0 * xRatio
    const origY0 = y0 * yRatio
    const origX1 = x1 * xRatio
    const origY1 = y1 * yRatio
    const colors = new Colors()
    const color = colors.get(cls_id)
    // Gambar background
    ctx.fillStyle = Colors.hexToRgba(color, 0.2)!
    ctx.fillRect(origX0, origY0, origX1 - origX0, origY1 - origY0)
    // Gambar kotak (bounding box)
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.strokeRect(origX0, origY0, origX1 - origX0, origY1 - origY0)

    // Draw the label background.
    ctx.fillStyle = color
    const text = `${labels[cls_id]}: ${score.toFixed(2)}%`
    const textWidth = ctx.measureText(text).width
    const textHeight = parseInt(font, 10) // base 10
    const yText = origY0 - (textHeight + ctx.lineWidth)
    ctx.fillRect(
      origX0 - 1,
      yText < 0 ? 0 : yText, // handle overflow label box
      textWidth + ctx.lineWidth,
      textHeight + ctx.lineWidth,
    )

    // Draw labels
    ctx.fillStyle = '#ffffff'
    ctx.fillText(text, origX0 - 1, yText < 0 ? 0 : yText)
  })
}

class Colors {
  palette: string[]
  n: number
  // ultralytics color palette https://ultralytics.com/
  constructor() {
    this.palette = [
      '#FF3838',
      '#FF9D97',
      '#FF701F',
      '#FFB21D',
      '#CFD231',
      '#48F90A',
      '#92CC17',
      '#3DDB86',
      '#1A9334',
      '#00D4BB',
      '#2C99A8',
      '#00C2FF',
      '#344593',
      '#6473FF',
      '#0018EC',
      '#8438FF',
      '#520085',
      '#CB38FF',
      '#FF95C8',
      '#FF37C7',
    ]
    this.n = this.palette.length
  }

  get = (i: number) => this.palette[Math.floor(i) % this.n]

  static hexToRgba = (hex: string, alpha: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `rgba(${[
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ].join(', ')}, ${alpha})`
      : null
  }
}
