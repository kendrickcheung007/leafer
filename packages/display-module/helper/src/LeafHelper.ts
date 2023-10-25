import { IBranch, ILeaf, IMatrixData, IPointData } from '@leafer/interface'
import { MathHelper, MatrixHelper, PointHelper } from '@leafer/math'


const { copy, toInnerPoint, scaleOfOuter, rotateOfOuter, skewOfOuter } = MatrixHelper
const matrix = {} as IMatrixData

export const LeafHelper = {

    updateAllWorldMatrix(leaf: ILeaf): void {
        leaf.__updateWorldMatrix()

        if (leaf.isBranch) {
            const { children } = leaf
            for (let i = 0, len = children.length; i < len; i++) {
                updateAllWorldMatrix(children[i])
            }
        }
    },

    updateAllWorldOpacity(leaf: ILeaf): void {
        leaf.__updateWorldOpacity()

        if (leaf.isBranch) {
            const { children } = leaf
            for (let i = 0, len = children.length; i < len; i++) {
                updateAllWorldOpacity(children[i])
            }
        }
    },

    updateAllChange(leaf: ILeaf): void {

        updateAllWorldOpacity(leaf)

        leaf.__updateChange()

        if (leaf.isBranch) {
            const { children } = leaf
            for (let i = 0, len = children.length; i < len; i++) {
                updateAllChange(children[i])
            }
        }
    },

    worldHittable(t: ILeaf): boolean {
        if (!t.__.hittable) return false
        let { parent } = t
        while (parent) {
            if (!parent.__.hittable || !parent.__.hitChildren) return false
            parent = parent.parent
        }
        return true
    },

    // transform

    moveWorld(t: ILeaf, x: number, y: number): void {
        const local = { x, y }
        if (t.parent) toInnerPoint(t.parent.worldTransform, local, local, true)
        L.moveLocal(t, local.x, local.y)
    },

    moveLocal(t: ILeaf, x: number, y: number = 0): void {
        t.x += x
        t.y += y
    },

    zoomOfWorld(t: ILeaf, origin: IPointData, scaleX: number, scaleY?: number): void {
        this.zoomOfLocal(t, getTempLocal(t, origin), scaleX, scaleY)
    },

    zoomOfLocal(t: ILeaf, origin: IPointData, scaleX: number, scaleY: number = scaleX): void {
        copy(matrix, t.__local)
        scaleOfOuter(matrix, origin, scaleX, scaleY)
        moveByMatrix(t, matrix)
        t.scaleX *= scaleX
        t.scaleY *= scaleY
    },

    rotateOfWorld(t: ILeaf, origin: IPointData, angle: number): void {
        this.rotateOfLocal(t, getTempLocal(t, origin), angle)
    },

    rotateOfLocal(t: ILeaf, origin: IPointData, angle: number): void {
        copy(matrix, t.__local)
        rotateOfOuter(matrix, origin, angle)
        moveByMatrix(t, matrix)
        t.rotation = MathHelper.formatRotation(t.rotation + angle)
    },

    skewOfWorld(t: ILeaf, origin: IPointData, skewX: number, skewY?: number): void {
        this.skewOfLocal(t, getTempLocal(t, origin), skewX, skewY)
    },

    skewOfLocal(t: ILeaf, origin: IPointData, skewX: number, skewY: number): void {
        copy(matrix, t.__local)
        skewOfOuter(matrix, origin, skewX, skewY)
        moveByMatrix(t, matrix)
        t.skewX += skewX
        t.skewY += skewY
    },

    drop(t: ILeaf, parent: IBranch): void {
        const position = { x: t.x, y: t.y }
        t.localToWorld(position)
        parent.worldToInner(position)
        t.set(position)
        parent.add(t)
    },

    hasParent(t: ILeaf, parent: ILeaf): boolean {
        if (!parent) return false
        let p = t
        while (p) {
            if (parent === p) return true
            p = p.parent
        }
        return false
    }

}

const L = LeafHelper
const { updateAllWorldMatrix, updateAllWorldOpacity, updateAllChange } = L

function moveByMatrix(t: ILeaf, matrix: IMatrixData): void {
    t.x += matrix.e - t.__local.e
    t.y += matrix.f - t.__local.f
}

function getTempLocal(t: ILeaf, world: IPointData): IPointData {
    t.__layout.checkUpdate()
    return t.parent ? PointHelper.tempToInnerOf(world, t.parent.__world) : world
}