import { IFunction } from '../function/IFunction'
import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { ILeaf } from '../display/ILeaf'
import { IExportFileType, IExportImageType } from '../file/IFileType'
import { IBoundsData, ISizeData } from '../math/IMath'
import { IObject } from '../data/IData'
import { ICanvasType } from '../canvas/ISkiaCanvas'

export interface IPlatform {
    name?: 'web' | 'node' | 'miniapp'
    os?: 'Mac' | 'Windows' | 'Linux'
    requestRender?(render: IFunction): void
    canvas?: ILeaferCanvas
    canvasType?: ICanvasType
    isWorker?: boolean
    isMobile?: boolean
    devicePixelRatio?: number
    intWheelDeltaY?: boolean // firefox / Windows need
    conicGradientSupport?: boolean
    conicGradientRotate90?: boolean // firefox need rotate
    fullImageShadow?: boolean // safari need 
    syncDomFont?: boolean // firefox need
    layout?(target: ILeaf): void
    origin?: {
        createCanvas(width: number, height: number, format?: 'svg' | 'pdf'): any
        canvasToDataURL(canvas: any, type?: IExportImageType, quality?: number): string | Promise<string>
        canvasToBolb(canvas: any, type?: IExportFileType, quality?: number): Promise<any>
        canvasSaveAs(canvas: any, filename: string, quality?: number): Promise<void>
        loadImage(url: string): Promise<any>
        noRepeat?: string  // fix: 微信小程序 createPattern 直接使用 no-repeat 有bug，导致无法显示
    },
    roundRectPatch?: boolean //  fix: skia-canvas roundRect
    ellipseToCurve?: boolean, // fix: skia 绘制圆环和椭圆弧
    event?: {
        stopDefault(origin: IObject): void
        stopNow(origin: IObject): void
        stop(origin: IObject): void
    },
    miniapp?: IMiniapp
    image: {
        maxCacheSize: number // 最大等级缓存，一般取当前屏幕大小，默认2k: 2560 * 1600
        maxPatternSize: number // 最大repeat pattern缓存, 默认4k: 4096 * 2160
        suffix: string  // 需要带上后缀区分dom中image标签的缓存，否则会导致浏览器缓存跨域问题
        crossOrigin: string | false // 跨域设置
    }
}


export interface IMiniappSelect extends IObject { }

export interface IMiniappSizeView extends ISizeData {
    view: any
}

export interface IMiniapp {
    select(name: string): IMiniappSelect
    getBounds(select: IMiniappSelect): Promise<IBoundsData>
    getSizeView(select: IMiniappSelect): Promise<IMiniappSizeView>
    onWindowResize(fun: IFunction): void
    offWindowResize(fun: IFunction): void
    saveToAlbum(path: string): Promise<any>
}