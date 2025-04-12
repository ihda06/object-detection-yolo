import * as tf from '@tensorflow/tfjs'
import {  renderBoxesSimple } from './render'




const preprocess = (
  source:
    | tf.PixelData
    | ImageData
    | HTMLImageElement
    | HTMLCanvasElement
    | HTMLVideoElement
    | ImageBitmap,
  modelWidth: number,
  modelHeight: number,
) => {
  const { input, xRatio, yRatio } = tf.tidy(() => {
    const img = tf.browser.fromPixels(source)

    // padding image to square => [n, m] to [n, n], n > m
    const [h, w] = img.shape.slice(0, 2) // get source width and height
    const maxSize = Math.max(w, h) // get max size
    const imgPadded = img.pad([
      [0, maxSize - h], // padding y [bottom only]
      [0, maxSize - w], // padding x [right only]
      [0, 0],
    ]) as tf.Tensor<tf.Rank.R3>

    const xRatio = maxSize / w // update xRatio
    const yRatio = maxSize / h // update yRatio
    const input = tf.image
      .resizeBilinear(imgPadded, [modelWidth, modelHeight]) // resize frame
      .div(255.0) // normalize
      .expandDims(0) // add batch
    return {
      input: input,
      xRatio: xRatio,
      yRatio: yRatio,
    }
  })

  return { input, xRatio, yRatio }
}


export const detect2 = async (
  source:
    | tf.PixelData
    | ImageData
    | HTMLImageElement
    | HTMLCanvasElement
    | HTMLVideoElement
    | ImageBitmap,
  model: { net: tf.GraphModel<string | tf.io.IOHandler>; inputShape: number[] },
  treshold: number,
  canvasRef: HTMLCanvasElement,
  callback = () => {},
) => {
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3) // get model width and height

  tf.engine().startScope() // start scoping tf engine
  const { input, xRatio, yRatio } = preprocess(source, modelWidth, modelHeight) // preprocess image

  const res = (await model.net.executeAsync(input)) as tf.Tensor<tf.Rank.R2> // inference model

  const dets = res.arraySync()

  renderBoxesSimple(canvasRef, dets, [xRatio, yRatio], treshold)

  tf.dispose([res]) // clear memory

  callback()

  tf.engine().endScope() // end of scoping
}

export const detectVideo = (
    vidSource: HTMLVideoElement,
    model: { net: tf.GraphModel<string | tf.io.IOHandler>; inputShape: number[] },
    canvasRef: HTMLCanvasElement,
    treshold: number,
    
  ) => {
    const detectFrame = async () => {
      if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
        const ctx = canvasRef.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) // clean canvas
        return // handle if source is closed
      }

      detect2(vidSource, model, treshold, canvasRef, () => {
        requestAnimationFrame(detectFrame) // get another frame
      })
    }
  
    detectFrame() // initialize to detect every frame
  }
