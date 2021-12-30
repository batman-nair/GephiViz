class GephiViz {
    constructor(objectId) {
        this.svgElement = this.getSVGObject(objectId)
        this.viewBoxOrig = this.svgElement.viewBox.baseVal
        this.initElements()
        this.cleanupClasses()
        this.addListeners()
    }

    getSVGObject(objectId) {
        const obj = document.querySelector(objectId)
        if (obj.contentDocument) {
            return obj.contentDocument.firstElementChild
        }
        return obj.getSVGDocument().firstElementChild
    }

    initElements() {
        this.paths = Array.from(this.svgElement.querySelectorAll("path"))
        this.nodes = Array.from(this.svgElement.querySelectorAll("circle"))
        this.labels = Array.from(this.svgElement.querySelectorAll("text"))
        this.applyElements(element => {
            // element.style.transition = 'opacity 0.1s ease-out' // This is very slow
            // this.dimElement(element)
            this.resetElement(element)
        })
        this.labels.map(label => {
            label.style.pointerEvents = 'none'
        })
    }

    applyElements(func) {
        this.paths.map(func)
        this.nodes.map(func)
        this.labels.map(func)
    }

    cleanupClasses() {
        this.applyElements(element => {
			for (var class_name of element.classList) {
				element.classList.replace(class_name, class_name.replace(/[^a-zA-Z0-9 _]/g, "_"))
			}
        })
    }

    dimElement(element) {
        element.style.opacity = 0.2
    }
    resetElement(element) {
        element.style.opacity = 0.7
    }
    highlightElement(element) {
        element.style.opacity = 1
    }

    getNode(className) {
        return this.svgElement.querySelector("circle."+className)
    }
    getLabel(className) {
        return this.svgElement.querySelector("text."+className)
    }
    getConnectedElements(node) {
        // console.log('get', node)
        const className = node.className.baseVal
        const paths = this.svgElement.querySelectorAll("path."+className)
        let connectedElements = [this.getNode(className), this.getLabel(className)]
        for (const path of paths) {
            let connected_class = path.classList[0]
            if (connected_class == className) {
                connected_class = path.classList[1]
            }
            connectedElements.push(this.getNode(connected_class))
            connectedElements.push(this.getLabel(connected_class))
        }
        connectedElements.push(...paths)
        return connectedElements
    }

    zoomIn() {
        var viewBox = this.svgElement.viewBox.baseVal
        viewBox.x = viewBox.x + viewBox.width / 4;
        viewBox.y = viewBox.y + viewBox.height / 4;
        viewBox.width = viewBox.width / 2;
        viewBox.height = viewBox.height / 2;
    }
    zoomOut() {
        var viewBox = this.svgElement.viewBox.baseVal
        viewBox.x = viewBox.x - viewBox.width / 2;
        viewBox.y = viewBox.y - viewBox.height / 2;
        viewBox.width = viewBox.width * 2;
        viewBox.height = viewBox.height * 2;
    }

    addListeners() {
        const classObj = this
        this.nodes.map(node => {
            node.addEventListener("mouseenter", event => {
                this.applyElements(element => {
                    this.dimElement(element)
                })
                const elements = this.getConnectedElements(event.currentTarget)
                elements.map(this.highlightElement)
            })
            node.addEventListener("mouseleave", event => {
                this.applyElements(element => {
                    this.resetElement(element)
                })
                // const elements = this.getConnectedElements(event.currentTarget)
                // elements.map(this.dimElement)
            })
        })
        this.svgElement.addEventListener("wheel", event => {
            const delta = Math.sign(event.deltaY)
            if (delta > 0) {
                this.zoomOut()
            }
            else {
                this.zoomIn()
            }
        })
    }

}