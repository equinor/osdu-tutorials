import {
    HTMLLayer,
    OnMountEvent,
    OnRescaleEvent,
    OnUpdateEvent,
} from '@equinor/esv-intersection'
import { render, html } from 'lit-html'

const POINTHEIGHT = 7
const POINTWIDTH = 7
const POINTOFFSETX = POINTWIDTH / 2
const POINTOFFSETY = POINTHEIGHT / 2


export class HighlightLayer extends HTMLLayer {
    constructor() {
        super();
        this.pos = [0, 0];
        this.rescaleEvent = null;
    }

    dotId() {
        return `${this.id}-red-dot`
    }

    onMount(event){
        super.onMount(event)
        this.requestRender()
    }

    onRescale(event): void {
        super.onRescale(event)
        this.rescaleEvent = event
        this.requestRender()
    }

    onUpdate(event) {
        super.onUpdate(event)
        this.requestRender()
    }

    updatePos() {
        // coords are [displacement, tvd]
        const coords = this.referenceSystem.project(this.data.md)

        // screen coords inside the container
        const x = this.rescaleEvent.xScale(coords[0])
        const y = this.rescaleEvent.yScale(coords[1])
        this.pos = [x, y]
    }

    requestRender() {
        if (!this.data || this.data.md === undefined || !this.rescaleEvent) {
            return
        }

        if (this.data.md == null) {
            this.pos = null
            render(this.render(), this.elm.node() as HTMLElement)
            return
        }

        this.updatePos()
        render(this.render(), this.elm.node() as HTMLElement)
    }

    render() {
        if (this.pos) {
            return html`
        <div class="highlight-layer-dot" id=${this.dotId()}></div>
        <style>
          .highlight-layer-dot {
            position: absolute;
            display: inline-block;
            height: ${POINTHEIGHT}px;
            width: ${POINTWIDTH}px;
            border-radius: 4px;
            background-color: rgba(255, 0, 0, 0.5);
            left: ${this.pos[0] - POINTOFFSETX}px;
            top: ${this.pos[1] - POINTOFFSETY}px;
          }
        </style>
      `
        }
        return html``
    }
}